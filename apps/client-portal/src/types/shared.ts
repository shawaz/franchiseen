// Shared types for Client Portal
// Simplified version for deployment

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

export interface FinancialAccount {
  id: string
  accountNumber: string
  accountType: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CRYPTO'
  currency: string
  balance: number
  availableBalance: number
  nickname?: string
  isActive: boolean
  clientId: string
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
  accountId?: string
  account?: FinancialAccount
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
