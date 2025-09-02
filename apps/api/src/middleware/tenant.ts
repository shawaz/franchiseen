import { Request, Response, NextFunction } from 'express';
import { prisma } from '@franchiseen/database';
import { AppError, HTTP_STATUS, ERROR_CODES, extractSubdomain } from '@franchiseen/shared';
import { logger, logTenantAction } from '../utils/logger';

// Extend Express Request interface to include tenant information
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        name: string;
        subdomain: string;
        domain?: string;
        status: string;
        plan: string;
        settings: any;
      };
      tenantId?: string;
      userId?: string;
    }
  }
}

/**
 * Middleware to identify and validate tenant from request
 * Can identify tenant from:
 * 1. X-Tenant-ID header (for API clients)
 * 2. Subdomain in hostname (for web requests)
 * 3. Custom domain (for branded stores)
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let tenantIdentifier: string | null = null;
    let identificationMethod: 'header' | 'subdomain' | 'domain' = 'header';

    // Method 1: Check X-Tenant-ID header (preferred for API clients)
    const tenantIdHeader = req.headers['x-tenant-id'] as string;
    if (tenantIdHeader) {
      tenantIdentifier = tenantIdHeader;
      identificationMethod = 'header';
    } else {
      // Method 2: Extract from subdomain
      const hostname = req.get('host') || '';
      const subdomain = extractSubdomain(hostname);
      
      if (subdomain) {
        tenantIdentifier = subdomain;
        identificationMethod = 'subdomain';
      } else {
        // Method 3: Check if it's a custom domain
        const customDomain = hostname.split(':')[0]; // Remove port if present
        if (customDomain && customDomain !== 'localhost' && !customDomain.includes('franchiseen.com')) {
          tenantIdentifier = customDomain;
          identificationMethod = 'domain';
        }
      }
    }

    // If no tenant identifier found, return error
    if (!tenantIdentifier) {
      throw new AppError(
        'Tenant identification required. Please provide X-Tenant-ID header or use tenant subdomain.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.TENANT_NOT_FOUND
      );
    }

    // Find tenant in database
    let tenant;
    
    if (identificationMethod === 'header') {
      // Look up by tenant ID
      tenant = await prisma.tenant.findUnique({
        where: { id: tenantIdentifier },
        select: {
          id: true,
          name: true,
          subdomain: true,
          domain: true,
          status: true,
          plan: true,
          settings: true,
          ownerId: true,
        },
      });
    } else if (identificationMethod === 'subdomain') {
      // Look up by subdomain
      tenant = await prisma.tenant.findUnique({
        where: { subdomain: tenantIdentifier },
        select: {
          id: true,
          name: true,
          subdomain: true,
          domain: true,
          status: true,
          plan: true,
          settings: true,
          ownerId: true,
        },
      });
    } else {
      // Look up by custom domain
      tenant = await prisma.tenant.findUnique({
        where: { domain: tenantIdentifier },
        select: {
          id: true,
          name: true,
          subdomain: true,
          domain: true,
          status: true,
          plan: true,
          settings: true,
          ownerId: true,
        },
      });
    }

    // Check if tenant exists
    if (!tenant) {
      throw new AppError(
        'Tenant not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.TENANT_NOT_FOUND
      );
    }

    // Check tenant status
    if (tenant.status === 'SUSPENDED') {
      throw new AppError(
        'Tenant account is suspended',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.TENANT_SUSPENDED
      );
    }

    if (tenant.status === 'CANCELLED') {
      throw new AppError(
        'Tenant account has been cancelled',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.TENANT_SUSPENDED
      );
    }

    // Add tenant information to request
    req.tenant = tenant;
    req.tenantId = tenant.id;

    // Log tenant access
    logTenantAction('tenant_access', tenant.id, req.userId, {
      method: req.method,
      url: req.url,
      identificationMethod,
      identifier: tenantIdentifier,
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to ensure user belongs to the current tenant
 * Should be used after both authMiddleware and tenantMiddleware
 */
export const tenantMembershipMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId || !req.tenantId) {
      throw new AppError(
        'Authentication and tenant context required',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    // Check if user belongs to the tenant
    const user = await prisma.user.findFirst({
      where: {
        id: req.userId,
        OR: [
          { tenantId: req.tenantId }, // User is a member of the tenant
          { ownedTenants: { some: { id: req.tenantId } } }, // User owns the tenant
          { role: 'PLATFORM_ADMIN' }, // Platform admin can access any tenant
        ],
      },
      select: {
        id: true,
        role: true,
        tenantId: true,
      },
    });

    if (!user) {
      throw new AppError(
        'Access denied. User does not belong to this tenant.',
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.AUTHORIZATION_ERROR
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to ensure user has specific role within tenant
 */
export const requireTenantRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId || !req.tenantId) {
        throw new AppError(
          'Authentication and tenant context required',
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTHENTICATION_ERROR
        );
      }

      const user = await prisma.user.findFirst({
        where: {
          id: req.userId,
          OR: [
            { tenantId: req.tenantId },
            { ownedTenants: { some: { id: req.tenantId } } },
            { role: 'PLATFORM_ADMIN' },
          ],
        },
        select: {
          id: true,
          role: true,
          tenantId: true,
          ownedTenants: {
            where: { id: req.tenantId },
            select: { id: true },
          },
        },
      });

      if (!user) {
        throw new AppError(
          'Access denied. User does not belong to this tenant.',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.AUTHORIZATION_ERROR
        );
      }

      // Platform admin can access everything
      if (user.role === 'PLATFORM_ADMIN') {
        return next();
      }

      // Tenant owner can access everything in their tenant
      if (user.ownedTenants.length > 0) {
        return next();
      }

      // Check if user has required role
      if (!allowedRoles.includes(user.role)) {
        throw new AppError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.AUTHORIZATION_ERROR
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional tenant middleware - doesn't throw error if tenant not found
 * Useful for endpoints that can work with or without tenant context
 */
export const optionalTenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to identify tenant but don't fail if not found
    const tenantIdHeader = req.headers['x-tenant-id'] as string;
    const hostname = req.get('host') || '';
    const subdomain = extractSubdomain(hostname);

    let tenant = null;

    if (tenantIdHeader) {
      tenant = await prisma.tenant.findUnique({
        where: { id: tenantIdHeader },
        select: {
          id: true,
          name: true,
          subdomain: true,
          domain: true,
          status: true,
          plan: true,
          settings: true,
          ownerId: true,
        },
      });
    } else if (subdomain) {
      tenant = await prisma.tenant.findUnique({
        where: { subdomain },
        select: {
          id: true,
          name: true,
          subdomain: true,
          domain: true,
          status: true,
          plan: true,
          settings: true,
          ownerId: true,
        },
      });
    }

    if (tenant && tenant.status === 'ACTIVE') {
      req.tenant = tenant;
      req.tenantId = tenant.id;
    }

    next();
  } catch (error) {
    // Log error but don't fail the request
    logger.error('Optional tenant middleware error:', error);
    next();
  }
};
