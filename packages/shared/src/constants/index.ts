// Application constants
export const APP_NAME = 'Franchiseen';
export const APP_VERSION = '1.0.0';

// API constants
export const API_PREFIX = '/api/v1';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Authentication constants
export const JWT_EXPIRES_IN = '15m';
export const JWT_REFRESH_EXPIRES_IN = '7d';
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const RATE_LIMIT_MAX_REQUESTS_AUTH = 5; // For auth endpoints

// File upload constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/csv', 'application/vnd.ms-excel'];

// Product constants
export const MAX_PRODUCT_IMAGES = 10;
export const MAX_PRODUCT_VARIANTS = 100;
export const MAX_PRODUCT_TAGS = 20;
export const PRODUCT_HANDLE_MAX_LENGTH = 255;

// Order constants
export const ORDER_NUMBER_PREFIX = 'ORD';
export const MAX_ORDER_LINE_ITEMS = 100;

// Tenant constants
export const SUBDOMAIN_MIN_LENGTH = 3;
export const SUBDOMAIN_MAX_LENGTH = 50;
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'ftp',
  'blog',
  'shop',
  'store',
  'support',
  'help',
  'docs',
  'status',
  'cdn',
  'assets',
  'static',
  'media',
  'images',
  'files',
  'download',
  'uploads',
  'secure',
  'ssl',
  'test',
  'staging',
  'dev',
  'demo',
  'beta',
  'alpha',
  'preview',
  'temp',
  'tmp',
  'backup',
  'archive',
  'old',
  'new',
  'mobile',
  'wap',
  'iphone',
  'android',
  'tablet',
  'touch',
  'voice',
  'sms',
  'mms',
  'email',
  'newsletter',
  'news',
  'rss',
  'atom',
  'xml',
  'json',
  'csv',
  'txt',
  'pdf',
  'doc',
  'xls',
  'ppt',
  'zip',
  'rar',
  'tar',
  'gz',
  'bz2',
  'mp3',
  'mp4',
  'avi',
  'mov',
  'wmv',
  'flv',
  'swf',
  'gif',
  'jpg',
  'jpeg',
  'png',
  'bmp',
  'ico',
  'svg',
  'css',
  'js',
  'html',
  'htm',
  'php',
  'asp',
  'jsp',
  'cgi',
  'pl',
  'py',
  'rb',
  'java',
  'c',
  'cpp',
  'h',
  'cs',
  'vb',
  'sql',
  'db',
  'mdb',
  'accdb',
  'sqlite',
  'mysql',
  'postgres',
  'oracle',
  'mssql',
  'mongodb',
  'redis',
  'memcached',
  'elasticsearch',
  'solr',
  'lucene',
  'sphinx',
  'git',
  'svn',
  'cvs',
  'hg',
  'bzr',
  'darcs',
  'fossil',
  'tfs',
  'vss',
  'perforce',
  'clearcase',
  'accurev',
  'vault',
  'surround',
  'dimensions',
  'synergy',
  'integrity',
  'continuus',
  'pvcs',
  'rcs',
  'sccs',
];

// Currency constants
export const DEFAULT_CURRENCY = 'USD';
export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'SEK', 'NZD',
  'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'RUB', 'INR', 'BRL', 'ZAR', 'KRW',
];

// Solana constants
export const SOLANA_NETWORKS = {
  MAINNET: 'mainnet-beta',
  DEVNET: 'devnet',
  TESTNET: 'testnet',
} as const;

export const SOLANA_TOKENS = {
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    mint: 'So11111111111111111111111111111111111111112', // Wrapped SOL
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  },
} as const;

export const SOLANA_PAY_CONSTANTS = {
  PROTOCOL: 'solana:',
  MAX_MEMO_LENGTH: 32,
  DEFAULT_CONFIRMATION_TIMEOUT: 60000, // 60 seconds
  TRANSACTION_EXPIRY_TIME: 300000, // 5 minutes
  MIN_SOL_AMOUNT: 0.000001, // 1 lamport in SOL
  MAX_SOL_AMOUNT: 1000000, // 1M SOL
} as const;

// Timezone constants
export const DEFAULT_TIMEZONE = 'UTC';
export const SUPPORTED_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Zurich',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Singapore',
  'Asia/Seoul',
  'Asia/Mumbai',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
];

// Language constants
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'sv', name: 'Svenska' },
  { code: 'da', name: 'Dansk' },
  { code: 'no', name: 'Norsk' },
  { code: 'fi', name: 'Suomi' },
  { code: 'pl', name: 'Polski' },
  { code: 'cs', name: 'Čeština' },
  { code: 'hu', name: 'Magyar' },
  { code: 'ru', name: 'Русский' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
];

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  ORDER_CONFIRMATION: 'order-confirmation',
  ORDER_SHIPPED: 'order-shipped',
  ORDER_DELIVERED: 'order-delivered',
  INVOICE: 'invoice',
  REFUND_PROCESSED: 'refund-processed',
  ACCOUNT_SUSPENDED: 'account-suspended',
  SUBSCRIPTION_EXPIRED: 'subscription-expired',
  PAYMENT_FAILED: 'payment-failed',
} as const;

// Webhook events
export const WEBHOOK_EVENTS = {
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_SUSPENDED: 'tenant.suspended',
  TENANT_DELETED: 'tenant.deleted',
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_PAID: 'order.paid',
  ORDER_FULFILLED: 'order.fulfilled',
  ORDER_CANCELLED: 'order.cancelled',
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  PAYMENT_PROCESSED: 'payment.processed',
  PAYMENT_FAILED: 'payment.failed',
  REFUND_CREATED: 'refund.created',
  // Solana Pay events
  SOLANA_PAY_CREATED: 'solana_pay.created',
  SOLANA_PAY_CONFIRMED: 'solana_pay.confirmed',
  SOLANA_PAY_FINALIZED: 'solana_pay.finalized',
  SOLANA_PAY_EXPIRED: 'solana_pay.expired',
  SOLANA_PAY_FAILED: 'solana_pay.failed',
  SOLANA_TRANSACTION_DETECTED: 'solana_transaction.detected',
} as const;

// Cache keys
export const CACHE_KEYS = {
  TENANT: (id: string) => `tenant:${id}`,
  TENANT_BY_SUBDOMAIN: (subdomain: string) => `tenant:subdomain:${subdomain}`,
  USER: (id: string) => `user:${id}`,
  USER_SESSIONS: (userId: string) => `user:sessions:${userId}`,
  PRODUCT: (tenantId: string, id: string) => `product:${tenantId}:${id}`,
  PRODUCTS_LIST: (tenantId: string, page: number, limit: number) => 
    `products:${tenantId}:${page}:${limit}`,
  ORDER: (tenantId: string, id: string) => `order:${tenantId}:${id}`,
  CUSTOMER: (tenantId: string, id: string) => `customer:${tenantId}:${id}`,
} as const;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 2 * 60 * 60, // 2 hours
  VERY_LONG: 24 * 60 * 60, // 24 hours
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  TENANT_SUSPENDED: 'TENANT_SUSPENDED',
  INVALID_SUBDOMAIN: 'INVALID_SUBDOMAIN',
  SUBDOMAIN_TAKEN: 'SUBDOMAIN_TAKEN',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_INVENTORY: 'INSUFFICIENT_INVENTORY',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  // Solana-specific error codes
  INVALID_SOLANA_ADDRESS: 'INVALID_SOLANA_ADDRESS',
  SOLANA_NETWORK_ERROR: 'SOLANA_NETWORK_ERROR',
  SOLANA_TRANSACTION_FAILED: 'SOLANA_TRANSACTION_FAILED',
  SOLANA_INSUFFICIENT_BALANCE: 'SOLANA_INSUFFICIENT_BALANCE',
  SOLANA_PAY_EXPIRED: 'SOLANA_PAY_EXPIRED',
  SOLANA_PAY_INVALID: 'SOLANA_PAY_INVALID',
  INVALID_SPL_TOKEN: 'INVALID_SPL_TOKEN',
} as const;
