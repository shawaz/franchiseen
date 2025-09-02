import { z } from 'zod';

// Base Entity Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tenant/Store Types
export interface Tenant extends BaseEntity {
  name: string;
  subdomain: string;
  domain?: string;
  status: TenantStatus;
  plan: SubscriptionPlan;
  settings: TenantSettings;
  ownerId: string;
}

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export interface TenantSettings {
  storeName: string;
  storeDescription?: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  timezone: string;
  language: string;
  enabledFeatures: string[];
}

// User Types
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  emailVerified: boolean;
  status: UserStatus;
  role: UserRole;
  tenantId?: string;
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum UserRole {
  PLATFORM_ADMIN = 'platform_admin',
  TENANT_OWNER = 'tenant_owner',
  TENANT_ADMIN = 'tenant_admin',
  TENANT_STAFF = 'tenant_staff',
  CUSTOMER = 'customer',
}

// Service Types (replacing Product for fintech)
export interface Service extends BaseEntity {
  name: string;
  description?: string;
  serviceCode: string;
  status: ServiceStatus;
  category?: string;
  serviceType?: string;
  tags: string[];
  metadata: Record<string, any>;
  basePrice?: number;
  commissionRate?: number;
  feeStructure: Record<string, any>;
  tenantId: string;
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Transaction Types (replacing Order for fintech)
export interface Transaction extends BaseEntity {
  transactionId: string;
  amount: number;
  currency: string;
  transactionType: TransactionType;
  category?: string;
  description?: string;
  reference?: string;
  gateway: string;
  gatewayTransactionId?: string;
  status: TransactionStatus;
  processingFee?: number;
  commissionAmount?: number;
  metadata: Record<string, any>;
  internalNotes?: string;
  processedAt?: Date;
  clientId?: string;
  serviceId?: string;
  fromAccountId?: string;
  toAccountId?: string;
  tenantId: string;
}

export enum TransactionType {
  PAYMENT = 'payment',
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  FEE = 'fee',
  COMMISSION = 'commission',
  REFUND = 'refund',
  CHARGEBACK = 'chargeback',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILURE = 'failure',
  ERROR = 'error',
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

// Client Types (replacing Customer for fintech)
export interface Client extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  businessName?: string;
  clientType: ClientType;
  status: ClientStatus;
  totalVolume: number;
  transactionCount: number;
  creditLimit?: number;
  riskScore?: number;
  kycStatus: KYCStatus;
  kycDocuments: any[];
  verificationDate?: Date;
  addresses: Address[];
  tags: string[];
  metadata: Record<string, any>;
  tenantId: string;
}

export enum ClientType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
  CORPORATE = 'corporate',
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export enum KYCStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

// Financial Account Types
export interface FinancialAccount extends BaseEntity {
  accountNumber: string;
  accountType: AccountType;
  accountName: string;
  currency: string;
  balance: number;
  availableBalance: number;
  status: AccountStatus;
  routingNumber?: string;
  swiftCode?: string;
  iban?: string;
  metadata: Record<string, any>;
  clientId?: string;
  tenantId: string;
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  BUSINESS = 'business',
  ESCROW = 'escrow',
  MERCHANT = 'merchant',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FROZEN = 'frozen',
  CLOSED = 'closed',
}

// Solana Types
export interface SolanaWallet extends BaseEntity {
  address: string;
  name?: string;
  isActive: boolean;
  tenantId: string;
}

export interface SolanaPayRequest extends BaseEntity {
  reference: string;
  recipient: string;
  amount?: number;
  splToken?: string;
  label?: string;
  message?: string;
  memo?: string;
  status: SolanaPayStatus;
  expiresAt?: Date;
  orderId?: string;
  tenantId: string;
}

export enum SolanaPayStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FINALIZED = 'finalized',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

export interface SolanaTransaction {
  signature: string;
  slot: number;
  blockTime?: number;
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
  amount: number;
  token?: string;
  from: string;
  to: string;
  memo?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Validation Schemas
export const CreateTenantSchema = z.object({
  name: z.string().min(1).max(100),
  subdomain: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  ownerEmail: z.string().email(),
  ownerFirstName: z.string().min(1).max(50),
  ownerLastName: z.string().min(1).max(50),
  plan: z.nativeEnum(SubscriptionPlan),
  franchiseType: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const CreateServiceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  serviceCode: z.string().min(1).max(100),
  status: z.nativeEnum(ServiceStatus),
  category: z.string().optional(),
  serviceType: z.string().optional(),
  tags: z.array(z.string()),
  basePrice: z.number().positive().optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  feeStructure: z.record(z.any()).optional(),
});

export const CreateClientSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  clientType: z.nativeEnum(ClientType),
  creditLimit: z.number().positive().optional(),
});

export const CreateTransactionSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  transactionType: z.nativeEnum(TransactionType),
  category: z.string().optional(),
  description: z.string().optional(),
  reference: z.string().optional(),
  clientId: z.string().optional(),
  serviceId: z.string().optional(),
});

export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;
export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;
export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
