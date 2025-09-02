import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { prisma } from '@franchiseen/database';
import { 
  AppError, 
  HTTP_STATUS, 
  ERROR_CODES,
  isValidEmail,
  generateId 
} from '@franchiseen/shared';
import { 
  generateTokens, 
  refreshAccessToken, 
  revokeRefreshToken,
  revokeAllUserSessions 
} from '../middleware/auth';
import { config } from '../config';
import { logger, logAuthAction } from '../utils/logger';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const { email, password, firstName, lastName, role = 'CUSTOMER' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(
        'User with this email already exists',
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.DUPLICATE_RESOURCE
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.security.bcryptRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        status: 'ACTIVE',
        emailVerified: false, // In production, require email verification
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await generateTokens(user);

    logAuthAction('user_registered', user.id, user.email, {
      role: user.role,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        tokens,
      },
    });
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true,
        tenantId: true,
      },
    });

    if (!user) {
      throw new AppError(
        'Invalid email or password',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      logAuthAction('login_failed', user.id, user.email, {
        reason: 'invalid_password',
      });

      throw new AppError(
        'Invalid email or password',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    // Check user status
    if (user.status !== 'ACTIVE') {
      logAuthAction('login_failed', user.id, user.email, {
        reason: 'account_inactive',
        status: user.status,
      });

      throw new AppError(
        'Account is not active',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    // Generate tokens
    const { passwordHash, ...userWithoutPassword } = user;
    const tokens = await generateTokens(userWithoutPassword);

    logAuthAction('user_logged_in', user.id, user.email, {
      role: user.role,
      tenantId: user.tenantId,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        tokens,
      },
    });
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const { refreshToken } = req.body;

    try {
      const tokens = await refreshAccessToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      throw new AppError(
        'Invalid or expired refresh token',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }
  }

  /**
   * Logout user
   */
  static async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    logAuthAction('user_logged_out', req.userId, req.user?.email);

    res.json({
      success: true,
      message: 'Logout successful',
    });
  }

  /**
   * Logout from all devices
   */
  static async logoutAll(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw new AppError(
        'Authentication required',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    await revokeAllUserSessions(req.userId);

    logAuthAction('user_logged_out_all', req.userId, req.user?.email);

    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw new AppError(
        'Authentication required',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            status: true,
            plan: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(
        'User not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    res.json({
      success: true,
      data: user,
    });
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw new AppError(
        'Authentication required',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    const { firstName, lastName, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        tenantId: true,
        updatedAt: true,
      },
    });

    logAuthAction('profile_updated', req.userId, req.user?.email);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    if (!req.userId) {
      throw new AppError(
        'Authentication required',
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new AppError(
        'User not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new AppError(
        'Current password is incorrect',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.AUTHENTICATION_ERROR
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.userId },
      data: { passwordHash: newPasswordHash },
    });

    // Revoke all sessions to force re-login
    await revokeAllUserSessions(req.userId);

    logAuthAction('password_changed', req.userId, user.email);

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    });
  }
}
