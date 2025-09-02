import { ApiResponse } from '../types/shared'
import apiService from './api'

interface SolanaConfig {
  network: string
  rpcUrl: string
  merchantWallet?: string
  isConfigured: boolean
  supportedTokens: string[]
}

interface SolanaPayRequest {
  id: string
  reference: string
  url: string
  recipient: string
  amount: number
  currency: string
  expiresAt: Date
}

interface PaymentValidation {
  isValid: boolean
  signature: string
  status: string
  error?: string
}

interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'finalized' | 'failed'
  confirmations: number
  slot?: number
  blockTime?: number
}

class SolanaService {
  async getConfig(): Promise<SolanaConfig> {
    const response = await apiService.get<ApiResponse<SolanaConfig>>('/solana/config')
    return response.data
  }

  async createPaymentRequest(params: {
    amount: number
    currency: 'SOL' | 'USDC' | 'USDT'
    label: string
    message?: string
    memo?: string
    orderId?: string
  }): Promise<SolanaPayRequest> {
    const response = await apiService.post<ApiResponse<SolanaPayRequest>>('/solana/payment-request', params)
    return response.data
  }

  async getPaymentRequest(id: string): Promise<SolanaPayRequest> {
    const response = await apiService.get<ApiResponse<SolanaPayRequest>>(`/solana/payment-request/${id}`)
    return response.data
  }

  async validatePayment(
    signature: string,
    paymentRequestId: string
  ): Promise<PaymentValidation> {
    const response = await apiService.post<ApiResponse<PaymentValidation>>('/solana/validate-payment', {
      signature,
      paymentRequestId,
    })
    return response.data
  }

  async getTransactionStatus(signature: string): Promise<TransactionStatus> {
    const response = await apiService.get<ApiResponse<TransactionStatus>>(`/solana/transaction/${signature}`)
    return response.data
  }

  // Utility function to generate QR code data URL
  async generateQRCode(url: string): Promise<string> {
    const QRCode = await import('qrcode')
    return QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
  }

  // Format Solana address for display
  formatAddress(address: string, chars = 4): string {
    if (address.length <= chars * 2) return address
    return `${address.slice(0, chars)}...${address.slice(-chars)}`
  }

  // Format amount with proper decimals
  formatAmount(amount: number, currency: string): string {
    const decimals = currency === 'SOL' ? 4 : 2
    return amount.toFixed(decimals)
  }

  // Get explorer URL for transaction
  getExplorerUrl(signature: string, network = 'devnet'): string {
    const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`
    return `https://explorer.solana.com/tx/${signature}${cluster}`
  }
}

export const solanaService = new SolanaService()
export default solanaService
