import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError, HTTP_STATUS, ERROR_CODES } from '@franchiseen/shared';
import { logger } from '../utils/logger';

interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: any;
  stack?: string;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let errorCode = ERROR_CODES.VALIDATION_ERROR;
  let message = 'Internal server error';
  let details: any = undefined;

  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    tenantId: req.tenantId,
    userId: req.userId,
  });

  // Handle different error types
  if (error instanceof AppError) {
    // Custom application errors
    statusCode = error.statusCode;
    message = error.message;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
  } else if (error instanceof ZodError) {
    // Zod validation errors
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma database errors
    switch (error.code) {
      case 'P2002':
        statusCode = HTTP_STATUS.CONFLICT;
        message = 'Resource already exists';
        errorCode = ERROR_CODES.DUPLICATE_RESOURCE;
        details = {
          field: error.meta?.target,
        };
        break;
      case 'P2025':
        statusCode = HTTP_STATUS.NOT_FOUND;
        message = 'Resource not found';
        errorCode = ERROR_CODES.NOT_FOUND;
        break;
      case 'P2003':
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Foreign key constraint failed';
        errorCode = ERROR_CODES.VALIDATION_ERROR;
        break;
      default:
        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        message = 'Database error occurred';
        errorCode = ERROR_CODES.VALIDATION_ERROR;
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Prisma validation errors
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid data provided';
    errorCode = ERROR_CODES.VALIDATION_ERROR;
  } else if (error instanceof JsonWebTokenError) {
    // JWT errors
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    errorCode = ERROR_CODES.AUTHENTICATION_ERROR;
    
    if (error instanceof TokenExpiredError) {
      message = 'Token has expired';
    } else {
      message = 'Invalid token';
    }
  } else if (error.name === 'ValidationError') {
    // Express validator errors
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation failed';
    errorCode = ERROR_CODES.VALIDATION_ERROR;
  } else if (error.name === 'CastError') {
    // MongoDB cast errors (if using MongoDB)
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Invalid ID format';
    errorCode = ERROR_CODES.VALIDATION_ERROR;
  } else if (error.name === 'MulterError') {
    // File upload errors
    statusCode = HTTP_STATUS.BAD_REQUEST;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    
    switch (error.message) {
      case 'File too large':
        message = 'File size exceeds limit';
        errorCode = ERROR_CODES.FILE_TOO_LARGE;
        break;
      case 'Unexpected field':
        message = 'Unexpected file field';
        break;
      default:
        message = 'File upload error';
    }
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: message,
    message,
    code: errorCode,
  };

  // Add details if available
  if (details) {
    errorResponse.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    code: ERROR_CODES.NOT_FOUND,
  });
};
