import { Client, ApiResponse, CreateClientInput } from '../types/shared'
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

interface ClientStats {
  totalClients: number
  totalVolume: number
  breakdown: Array<{
    status: string
    kycStatus: string
    clientType: string
    _count: { id: number }
    _sum: { totalVolume: number }
  }>
}

class ClientService {
  async getClients(params?: {
    page?: number
    limit?: number
    status?: string
    kycStatus?: string
    clientType?: string
    search?: string
  }): Promise<PaginatedResponse<Client>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<Client>>>('/clients', {
      params,
    })
    return response.data
  }

  async getClient(id: string): Promise<Client> {
    const response = await apiService.get<ApiResponse<Client>>(`/clients/${id}`)
    return response.data
  }

  async createClient(data: CreateClientInput): Promise<Client> {
    const response = await apiService.post<ApiResponse<Client>>('/clients', data)
    return response.data
  }

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    const response = await apiService.put<ApiResponse<Client>>(`/clients/${id}`, data)
    return response.data
  }

  async updateKYCStatus(
    id: string,
    kycStatus: string,
    verificationNotes?: string
  ): Promise<Client> {
    const response = await apiService.put<ApiResponse<Client>>(`/clients/${id}/kyc`, {
      kycStatus,
      verificationNotes,
    })
    return response.data
  }

  async getClientStats(): Promise<ClientStats> {
    const response = await apiService.get<ApiResponse<ClientStats>>('/clients/stats')
    return response.data
  }
}

export const clientService = new ClientService()
export default clientService
