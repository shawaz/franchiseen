// Shared types for Admin Dashboard
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

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface CreateTenantInput {
  name: string
  subdomain: string
  plan: 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
  ownerId: string
  franchiseType?: string
  licenseNumber?: string
  settings?: Record<string, any>
}
