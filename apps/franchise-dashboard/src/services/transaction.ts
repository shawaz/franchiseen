import { Transaction, ApiResponse, CreateTransactionInput } from '../types/shared'
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

interface TransactionStats {
  totalTransactions: number
  totalVolume: number
  successfulTransactions: number
  pendingTransactions: number
  failedTransactions: number
  totalCommissions: number
  totalFees: number
  successRate: number
  transactionsByType: Array<{
    transactionType: string
    _count: { id: number }
    _sum: { amount: number }
  }>
}

class TransactionService {
  async getTransactions(params?: {
    page?: number
    limit?: number
    status?: string
    transactionType?: string
    clientId?: string
    fromDate?: string
    toDate?: string
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<Transaction>>>('/transactions', {
      params,
    })
    return response.data
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiService.get<ApiResponse<Transaction>>(`/transactions/${id}`)
    return response.data
  }

  async createTransaction(data: CreateTransactionInput & {
    fromAccountId?: string
    toAccountId?: string
    processingFee?: number
    commissionRate?: number
    gateway?: string
    metadata?: Record<string, any>
  }): Promise<Transaction> {
    const response = await apiService.post<ApiResponse<Transaction>>('/transactions', data)
    return response.data
  }

  async updateTransactionStatus(
    id: string,
    status: string,
    gatewayTransactionId?: string,
    internalNotes?: string
  ): Promise<Transaction> {
    const response = await apiService.put<ApiResponse<Transaction>>(`/transactions/${id}/status`, {
      status,
      gatewayTransactionId,
      internalNotes,
    })
    return response.data
  }

  async getTransactionStats(params?: {
    fromDate?: string
    toDate?: string
  }): Promise<TransactionStats> {
    const response = await apiService.get<ApiResponse<TransactionStats>>('/transactions/stats', {
      params,
    })
    return response.data
  }
}

export const transactionService = new TransactionService()
export default transactionService
