// Shared types for Franchise Dashboard
// Simplified version for deployment

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'FRANCHISE_OWNER' | 'CLIENT'
  tenantId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  subdomain: string
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  plan: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
  settings: Record<string, any>
  franchiseType?: string
  licenseNumber?: string
  regulatoryInfo?: Record<string, any>
  commissionRate?: number
  createdAt: string
  updatedAt: string
  ownerId: string
  owner?: User
}

export interface Client {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  businessName?: string
  clientType: 'INDIVIDUAL' | 'BUSINESS' | 'CORPORATE'
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  riskScore?: number
  totalVolume?: number
  isActive: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'CRYPTO_DEPOSIT' | 'CRYPTO_WITHDRAWAL'
  amount: number
  currency: string
  status: 'PENDING' | 'SUCCESS' | 'FAILURE' | 'CANCELLED'
  description?: string
  clientId: string
  client?: Client
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface CreateClientInput {
  email: string
  firstName: string
  lastName: string
  phone?: string
  businessName?: string
  clientType: 'INDIVIDUAL' | 'BUSINESS' | 'CORPORATE'
}

export interface CreateTransactionInput {
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'CRYPTO_DEPOSIT' | 'CRYPTO_WITHDRAWAL'
  amount: number
  currency: string
  description?: string
  clientId: string
}
