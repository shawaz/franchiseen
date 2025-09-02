import { Transaction, ApiResponse } from '../types/shared'
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

interface CreateTransactionInput {
  accountId: string
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'PAYMENT' | 'CRYPTO_DEPOSIT' | 'CRYPTO_WITHDRAWAL'
  amount: number
  currency: string
  description?: string
  recipientInfo?: {
    name?: string
    email?: string
    address?: string
    walletAddress?: string
  }
  metadata?: Record<string, any>
}

interface TransactionStats {
  totalTransactions: number
  totalVolume: number
  transactionsByType: Array<{
    transactionType: string
    _count: { id: number }
    _sum: { amount: number }
  }>
  monthlyVolume: number
  monthlyTransactions: number
}

class TransactionService {
  async getTransactions(params?: {
    page?: number
    limit?: number
    accountId?: string
    transactionType?: string
    status?: string
    fromDate?: string
    toDate?: string
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await apiService.get<ApiResponse<PaginatedResponse<Transaction>>>('/client/transactions', {
      params,
    })
    return response.data
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await apiService.get<ApiResponse<Transaction>>(`/client/transactions/${id}`)
    return response.data
  }

  async createTransaction(data: CreateTransactionInput): Promise<Transaction> {
    const response = await apiService.post<ApiResponse<Transaction>>('/client/transactions', data)
    return response.data
  }

  async getTransactionStats(params?: {
    accountId?: string
    fromDate?: string
    toDate?: string
  }): Promise<TransactionStats> {
    const response = await apiService.get<ApiResponse<TransactionStats>>('/client/transactions/stats', {
      params,
    })
    return response.data
  }

  async cancelTransaction(id: string, reason?: string): Promise<Transaction> {
    const response = await apiService.put<ApiResponse<Transaction>>(`/client/transactions/${id}/cancel`, {
      reason,
    })
    return response.data
  }

  async getReceipt(id: string): Promise<Blob> {
    const response = await apiService.get(`/client/transactions/${id}/receipt`, {
      responseType: 'blob',
    })
    return response
  }

  async exportTransactions(params?: {
    fromDate?: string
    toDate?: string
    format?: 'csv' | 'pdf'
  }): Promise<Blob> {
    const response = await apiService.get('/client/transactions/export', {
      params,
      responseType: 'blob',
    })
    return response
  }
}

export const transactionService = new TransactionService()
export default transactionService
