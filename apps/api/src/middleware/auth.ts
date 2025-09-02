import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@franchiseen/database';
import { AppError, HTTP_STATUS, ERROR_CODES } from '@franchiseen/shared';
import { config } from '../config';
import { logger, logAuthAction } from '../utils/logger';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  iat: number;
  exp: number;
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Access token required',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError(
          'Access token has expired',
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTHENTICATION_ERROR
        );
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError(
          'Invalid access token',
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTHENTICATION_ERROR
        );
      }
      throw error;
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        tenantId: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new AppError(
        'User not found',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(
        'User account is not active',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    // Add user information to request
    req.userId = user.id;
    req.user = user;

    // Log authentication
    logAuthAction('token_verified', user.id, user.email, {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
    });

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware - doesn't throw error if no token
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token provided, continue without authentication
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          tenantId: true,
          emailVerified: true,
        },
      });

      if (user && user.status === 'ACTIVE') {
        req.userId = user.id;
        req.user = user;
      }
    } catch (error) {
      // Log error but don't fail the request
      logger.warn('Optional auth middleware error:', error);
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Middleware to require specific user roles
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(
          'Authentication required',
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.AUTHENTICATION_ERROR
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
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
 * Middleware to require platform admin role
 */
export const requirePlatformAdmin = requireRole(['PLATFORM_ADMIN']);

/**
 * Middleware to require tenant owner or admin role
 */
export const requireTenantOwnerOrAdmin = requireRole(['TENANT_OWNER', 'TENANT_ADMIN', 'PLATFORM_ADMIN']);

/**
 * Middleware to require email verification
 */
export const requireEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(
        'Authentication required',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    if (!req.user.emailVerified) {
      throw new AppError(
        'Email verification required',
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
 * Utility function to generate JWT tokens
 */
export const generateTokens = async (user: {
  id: string;
  email: string;
  role: string;
  tenantId?: string | null;
}) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  };

  // Generate access token
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  // Generate refresh token
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await prisma.userSession.create({
    data: {
      userId: user.id,
      refreshToken,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.expiresIn,
  };
};

/**
 * Utility function to refresh access token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;

    // Check if refresh token exists in database
    const session = await prisma.userSession.findUnique({
      where: { refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            tenantId: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new AppError(
        'Invalid or expired refresh token',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    if (session.user.status !== 'ACTIVE') {
      throw new AppError(
        'User account is not active',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    // Generate new access token
    const payload = {
      userId: session.user.id,
      email: session.user.email,
      role: session.user.role,
      tenantId: session.user.tenantId,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    return {
      accessToken,
      expiresIn: config.jwt.expiresIn,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(
        'Invalid refresh token',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }
    throw error;
  }
};

/**
 * Utility function to revoke refresh token
 */
export const revokeRefreshToken = async (refreshToken: string) => {
  await prisma.userSession.deleteMany({
    where: { refreshToken },
  });
};

/**
 * Utility function to revoke all user sessions
 */
export const revokeAllUserSessions = async (userId: string) => {
  await prisma.userSession.deleteMany({
    where: { userId },
  });
};
