import winston from 'winston';
import { config } from '../config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

// Create custom format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Create console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => `${info.timestamp} [${info.level}]: ${info.message}`
  )
);

// Create transports
const transports: winston.transport[] = [];

// Console transport for development
if (config.env === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  // JSON format for production
  transports.push(
    new winston.transports.Console({
      format: format,
    })
  );
}

// File transports for production
if (config.env === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: format,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Helper functions for structured logging
export const logWithContext = (
  level: keyof typeof levels,
  message: string,
  context?: Record<string, any>
) => {
  logger.log(level, message, context);
};

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });
};

export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  responseTime: number,
  tenantId?: string,
  userId?: string
) => {
  logger.info('HTTP Request', {
    method,
    url,
    statusCode,
    responseTime: `${responseTime}ms`,
    tenantId,
    userId,
  });
};

export const logTenantAction = (
  action: string,
  tenantId: string,
  userId?: string,
  details?: Record<string, any>
) => {
  logger.info(`Tenant Action: ${action}`, {
    tenantId,
    userId,
    ...details,
  });
};

export const logAuthAction = (
  action: string,
  userId?: string,
  email?: string,
  details?: Record<string, any>
) => {
  logger.info(`Auth Action: ${action}`, {
    userId,
    email,
    ...details,
  });
};
