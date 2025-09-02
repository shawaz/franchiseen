import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('localhost'),
  
  // Database
  DATABASE_URL: z.string(),
  DATABASE_POOL_SIZE: z.string().transform(Number).default('20'),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3002,http://localhost:3003'),
  
  // File Storage
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_ENDPOINT: z.string().optional(),
  
  // Email
  EMAIL_PROVIDER: z.enum(['sendgrid', 'mailgun', 'smtp']).default('smtp'),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@franchiseen.com'),
  EMAIL_FROM_NAME: z.string().default('Franchiseen'),
  
  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: z.string().transform(Boolean).default('false'),
  
  // Payment
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_ID: z.string().optional(),

  // Solana Configuration
  SOLANA_NETWORK: z.enum(['mainnet-beta', 'devnet', 'testnet']).default('devnet'),
  SOLANA_RPC_URL: z.string().optional(),
  SOLANA_MERCHANT_WALLET: z.string().optional(),
  SOLANA_PRIVATE_KEY: z.string().optional(), // Base58 encoded private key
  SOLANA_WEBHOOK_SECRET: z.string().optional(),
  
  // Platform
  PLATFORM_NAME: z.string().default('Franchiseen'),
  PLATFORM_DOMAIN: z.string().default('franchiseen.com'),
  PLATFORM_SUPPORT_EMAIL: z.string().email().default('support@franchiseen.com'),
  
  // Frontend URLs
  ADMIN_DASHBOARD_URL: z.string().url().default('http://localhost:3000'),
  STORE_DASHBOARD_URL: z.string().url().default('http://localhost:3002'),
  STOREFRONT_BASE_URL: z.string().url().default('http://localhost:3003'),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // Development
  ENABLE_SWAGGER: z.string().transform(Boolean).default('true'),
  ENABLE_GRAPHQL_PLAYGROUND: z.string().transform(Boolean).default('true'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Export configuration object
export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  host: env.HOST,
  
  database: {
    url: env.DATABASE_URL,
    poolSize: env.DATABASE_POOL_SIZE,
  },
  
  redis: {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  
  cors: {
    origins: env.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  },
  
  storage: {
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucket: env.AWS_S3_BUCKET,
      endpoint: env.AWS_S3_ENDPOINT,
    },
  },
  
  email: {
    provider: env.EMAIL_PROVIDER,
    apiKey: env.EMAIL_API_KEY,
    from: env.EMAIL_FROM,
    fromName: env.EMAIL_FROM_NAME,
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
      secure: env.SMTP_SECURE,
    },
  },
  
  payment: {
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      publishableKey: env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    },
    paypal: {
      clientId: env.PAYPAL_CLIENT_ID,
      clientSecret: env.PAYPAL_CLIENT_SECRET,
      webhookId: env.PAYPAL_WEBHOOK_ID,
    },
    solana: {
      network: env.SOLANA_NETWORK,
      rpcUrl: env.SOLANA_RPC_URL,
      merchantWallet: env.SOLANA_MERCHANT_WALLET,
      privateKey: env.SOLANA_PRIVATE_KEY,
      webhookSecret: env.SOLANA_WEBHOOK_SECRET,
    },
  },
  
  platform: {
    name: env.PLATFORM_NAME,
    domain: env.PLATFORM_DOMAIN,
    supportEmail: env.PLATFORM_SUPPORT_EMAIL,
  },
  
  frontend: {
    adminDashboardUrl: env.ADMIN_DASHBOARD_URL,
    storeDashboardUrl: env.STORE_DASHBOARD_URL,
    storefrontBaseUrl: env.STOREFRONT_BASE_URL,
  },
  
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
  },
  
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  swagger: {
    enabled: env.ENABLE_SWAGGER,
  },
  
  graphql: {
    playgroundEnabled: env.ENABLE_GRAPHQL_PLAYGROUND,
  },
  
  logging: {
    level: env.LOG_LEVEL,
  },
  
  monitoring: {
    sentryDsn: env.SENTRY_DSN,
  },
} as const;

// Type for configuration
export type Config = typeof config;
