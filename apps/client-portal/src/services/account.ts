import { FinancialAccount, ApiResponse } from '../types/shared'
import apiService from './api'

interface CreateAccountInput {
  accountType: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CRYPTO'
  currency: string
  nickname?: string
  initialDeposit?: number
}

interface AccountStats {
  totalBalance: number
  totalAccounts: number
  accountsByType: Array<{
    accountType: string
    _count: { id: number }
    _sum: { balance: number }
  }>
  recentTransactions: number
}

class AccountService {
  async getAccounts(): Promise<FinancialAccount[]> {
    const response = await apiService.get<ApiResponse<FinancialAccount[]>>('/client/accounts')
    return response.data
  }

  async getAccount(id: string): Promise<FinancialAccount> {
    const response = await apiService.get<ApiResponse<FinancialAccount>>(`/client/accounts/${id}`)
    return response.data
  }

  async createAccount(data: CreateAccountInput): Promise<FinancialAccount> {
    const response = await apiService.post<ApiResponse<FinancialAccount>>('/client/accounts', data)
    return response.data
  }

  async updateAccount(id: string, data: Partial<FinancialAccount>): Promise<FinancialAccount> {
    const response = await apiService.put<ApiResponse<FinancialAccount>>(`/client/accounts/${id}`, data)
    return response.data
  }

  async closeAccount(id: string, reason?: string): Promise<FinancialAccount> {
    const response = await apiService.put<ApiResponse<FinancialAccount>>(`/client/accounts/${id}/close`, {
      reason,
    })
    return response.data
  }

  async getAccountStats(): Promise<AccountStats> {
    const response = await apiService.get<ApiResponse<AccountStats>>('/client/accounts/stats')
    return response.data
  }

  async getAccountBalance(id: string): Promise<{ balance: number; availableBalance: number }> {
    const response = await apiService.get<ApiResponse<{ balance: number; availableBalance: number }>>(
      `/client/accounts/${id}/balance`
    )
    return response.data
  }

  async transferFunds(data: {
    fromAccountId: string
    toAccountId: string
    amount: number
    description?: string
  }): Promise<void> {
    await apiService.post('/client/accounts/transfer', data)
  }
}

export const accountService = new AccountService()
export default accountService
