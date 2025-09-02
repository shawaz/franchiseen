import { format, parseISO } from 'date-fns';
import { kebabCase, camelCase, snakeCase } from 'lodash';

// String utilities
export const generateSlug = (text: string): string => {
  return kebabCase(text.toLowerCase());
};

export const generateHandle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidSubdomain = (subdomain: string): boolean => {
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return subdomainRegex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 50;
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Date utilities
export const formatDate = (date: Date | string, formatStr = 'yyyy-MM-dd'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// ID generation
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}${random}`;
};

// Object utilities
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Price utilities
export const calculateTax = (price: number, taxRate: number): number => {
  return Math.round(price * taxRate * 100) / 100;
};

export const calculateDiscount = (
  price: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number => {
  if (discountType === 'percentage') {
    return Math.round(price * (discountValue / 100) * 100) / 100;
  }
  return Math.min(discountValue, price);
};

// URL utilities
export const buildUrl = (base: string, path: string, params?: Record<string, string>): string => {
  const url = new URL(path, base);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
};

export const extractSubdomain = (hostname: string): string | null => {
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }
  return null;
};

// Error utilities
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode = 500): AppError => {
  return new AppError(message, statusCode);
};

// Async utilities
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt === maxAttempts) {
        throw lastError;
      }
      await sleep(delay * attempt);
    }
  }

  throw lastError!;
};

// Case conversion utilities
export { kebabCase, camelCase, snakeCase };

export const toPascalCase = (str: string): string => {
  return camelCase(str).replace(/^./, match => match.toUpperCase());
};

// Solana utilities
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    // Basic validation for Solana address format
    const addressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return addressRegex.test(address);
  } catch {
    return false;
  }
};

export const formatSolanaAmount = (lamports: number, decimals = 9): number => {
  return lamports / Math.pow(10, decimals);
};

export const parseSolanaAmount = (amount: number, decimals = 9): number => {
  return Math.floor(amount * Math.pow(10, decimals));
};

export const generateSolanaPayReference = (): string => {
  // Generate a unique reference for Solana Pay
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${random}`.toUpperCase();
};

export const createSolanaPayUrl = (params: {
  recipient: string;
  amount?: number;
  splToken?: string;
  reference?: string;
  label?: string;
  message?: string;
  memo?: string;
}): string => {
  const url = new URL(`solana:${params.recipient}`);

  if (params.amount) {
    url.searchParams.set('amount', params.amount.toString());
  }

  if (params.splToken) {
    url.searchParams.set('spl-token', params.splToken);
  }

  if (params.reference) {
    url.searchParams.set('reference', params.reference);
  }

  if (params.label) {
    url.searchParams.set('label', encodeURIComponent(params.label));
  }

  if (params.message) {
    url.searchParams.set('message', encodeURIComponent(params.message));
  }

  if (params.memo) {
    url.searchParams.set('memo', encodeURIComponent(params.memo));
  }

  return url.toString();
};

export const parseSolanaPayUrl = (url: string): {
  recipient: string;
  amount?: number;
  splToken?: string;
  reference?: string;
  label?: string;
  message?: string;
  memo?: string;
} | null => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'solana:') {
      return null;
    }

    const recipient = parsedUrl.pathname;
    if (!isValidSolanaAddress(recipient)) {
      return null;
    }

    const result: any = { recipient };

    const amount = parsedUrl.searchParams.get('amount');
    if (amount) {
      result.amount = parseFloat(amount);
    }

    const splToken = parsedUrl.searchParams.get('spl-token');
    if (splToken) {
      result.splToken = splToken;
    }

    const reference = parsedUrl.searchParams.get('reference');
    if (reference) {
      result.reference = reference;
    }

    const label = parsedUrl.searchParams.get('label');
    if (label) {
      result.label = decodeURIComponent(label);
    }

    const message = parsedUrl.searchParams.get('message');
    if (message) {
      result.message = decodeURIComponent(message);
    }

    const memo = parsedUrl.searchParams.get('memo');
    if (memo) {
      result.memo = decodeURIComponent(memo);
    }

    return result;
  } catch {
    return null;
  }
};
