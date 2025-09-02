import { Tenant, ApiResponse, CreateTenantInput } from '../types/shared'
import apiService from './api'

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface TenantStats {
  totalTenants: number
  activeTenants: number
  suspendedTenants: number
  totalRevenue: number
  monthlyGrowth: number
  breakdown: Array<{
    status: string
    plan: string
    _count: { id: number }
  }>
}

class TenantService {
  async getTenants(params?: {
    page?: number
    limit?: number
    status?: string
    plan?: string
    search?: string
  }): Promise<PaginatedResponse<Tenant>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<Tenant>>>('/tenants', {
      params,
    })
    return response.data
  }

  async getTenant(id: string): Promise<Tenant> {
    const response = await apiService.get<ApiResponse<Tenant>>(`/tenants/${id}`)
    return response.data
  }

  async createTenant(data: CreateTenantInput): Promise<Tenant> {
    const response = await apiService.post<ApiResponse<Tenant>>('/tenants', data)
    return response.data
  }

  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const response = await apiService.put<ApiResponse<Tenant>>(`/tenants/${id}`, data)
    return response.data
  }

  async suspendTenant(id: string, reason?: string): Promise<Tenant> {
    const response = await apiService.put<ApiResponse<Tenant>>(`/tenants/${id}`, {
      status: 'SUSPENDED',
      metadata: { suspensionReason: reason },
    })
    return response.data
  }

  async activateTenant(id: string): Promise<Tenant> {
    const response = await apiService.put<ApiResponse<Tenant>>(`/tenants/${id}`, {
      status: 'ACTIVE',
    })
    return response.data
  }

  async getTenantStats(): Promise<TenantStats> {
    const response = await apiService.get<ApiResponse<TenantStats>>('/tenants/stats')
    return response.data
  }

  async deleteTenant(id: string): Promise<void> {
    await apiService.delete(`/tenants/${id}`)
  }
}

export const tenantService = new TenantService()
export default tenantService
