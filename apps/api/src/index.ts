import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { tenantMiddleware } from './middleware/tenant';
import { authMiddleware } from './middleware/auth';

// Import routes
import authRoutes from './routes/auth';
import tenantRoutes from './routes/tenant';
import serviceRoutes from './routes/service';
import transactionRoutes from './routes/transaction';
import clientRoutes from './routes/client';
import financialAccountRoutes from './routes/financialAccount';
import webhookRoutes from './routes/webhook';
import solanaRoutes from './routes/solana';

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Swagger documentation (development only)
if (config.env === 'development' && config.swagger.enabled) {
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Franchiseen API',
        version: '1.0.0',
        description: 'Multi-tenant e-commerce platform API',
      },
      servers: [
        {
          url: `http://localhost:${config.port}/api/v1`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
  };

  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// API routes
const apiRouter = express.Router();

// Public routes (no authentication required)
apiRouter.use('/auth', authRoutes);
apiRouter.use('/webhooks', webhookRoutes);

// Protected routes (authentication required)
apiRouter.use('/tenants', authMiddleware, tenantRoutes);

// Tenant-specific routes (require tenant context)
apiRouter.use('/services', authMiddleware, tenantMiddleware, serviceRoutes);
apiRouter.use('/transactions', authMiddleware, tenantMiddleware, transactionRoutes);
apiRouter.use('/clients', authMiddleware, tenantMiddleware, clientRoutes);
apiRouter.use('/financial-accounts', authMiddleware, tenantMiddleware, financialAccountRoutes);
apiRouter.use('/solana', authMiddleware, tenantMiddleware, solanaRoutes);

app.use('/api/v1', apiRouter);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(config.port, config.host, () => {
  logger.info(`🚀 Franchiseen API server running on http://${config.host}:${config.port}`);
  logger.info(`📚 API Documentation: http://${config.host}:${config.port}/api/docs`);
  logger.info(`🏥 Health Check: http://${config.host}:${config.port}/health`);
  logger.info(`🌍 Environment: ${config.env}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
