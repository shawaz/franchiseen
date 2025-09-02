import { ApiResponse } from '../types/shared'
import apiService from './api'

interface SolanaPayRequest {
  id: string
  reference: string
  url: string
  recipient: string
  amount: number
  currency: string
  label: string
  message?: string
  memo?: string
  expiresAt: Date
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
}

interface PaymentValidation {
  isValid: boolean
  signature: string
  status: string
  amount: number
  currency: string
  error?: string
}

interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'finalized' | 'failed'
  confirmations: number
  slot?: number
  blockTime?: number
  signature: string
}

interface WalletBalance {
  publicKey: string
  balances: Array<{
    mint: string
    symbol: string
    balance: number
    uiAmount: number
    decimals: number
  }>
}

class SolanaService {
  async createPaymentRequest(params: {
    amount: number
    currency: 'SOL' | 'USDC' | 'USDT'
    label: string
    message?: string
    memo?: string
    accountId?: string
  }): Promise<SolanaPayRequest> {
    const response = await apiService.post<ApiResponse<SolanaPayRequest>>('/client/solana/payment-request', params)
    return response.data
  }

  async getPaymentRequest(id: string): Promise<SolanaPayRequest> {
    const response = await apiService.get<ApiResponse<SolanaPayRequest>>(`/client/solana/payment-request/${id}`)
    return response.data
  }

  async validatePayment(
    signature: string,
    paymentRequestId: string
  ): Promise<PaymentValidation> {
    const response = await apiService.post<ApiResponse<PaymentValidation>>('/client/solana/validate-payment', {
      signature,
      paymentRequestId,
    })
    return response.data
  }

  async getTransactionStatus(signature: string): Promise<TransactionStatus> {
    const response = await apiService.get<ApiResponse<TransactionStatus>>(`/client/solana/transaction/${signature}`)
    return response.data
  }

  async getWalletBalance(publicKey: string): Promise<WalletBalance> {
    const response = await apiService.get<ApiResponse<WalletBalance>>(`/client/solana/wallet/${publicKey}/balance`)
    return response.data
  }

  async sendCrypto(params: {
    fromWallet: string
    toAddress: string
    amount: number
    currency: 'SOL' | 'USDC' | 'USDT'
    memo?: string
    accountId?: string
  }): Promise<{ signature: string; status: string }> {
    const response = await apiService.post<ApiResponse<{ signature: string; status: string }>>('/client/solana/send', params)
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

  // Convert lamports to SOL
  lamportsToSol(lamports: number): number {
    return lamports / 1000000000
  }

  // Convert SOL to lamports
  solToLamports(sol: number): number {
    return Math.floor(sol * 1000000000)
  }

  // Validate Solana address
  isValidAddress(address: string): boolean {
    try {
      // Basic validation - should be 32-44 characters, base58 encoded
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
    } catch {
      return false
    }
  }
}

export const solanaService = new SolanaService()
export default solanaService
