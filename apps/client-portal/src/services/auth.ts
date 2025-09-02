import { Client, ApiResponse } from '../types/shared'
import apiService from './api'

interface LoginResponse {
  client: Client
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: string
  }
}

interface RegisterResponse {
  client: Client
  tokens: {
    accessToken: string
    refreshToken: string
    expiresIn: string
  }
}

interface RefreshTokenResponse {
  accessToken: string
  expiresIn: string
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  businessName?: string
  clientType: 'INDIVIDUAL' | 'BUSINESS' | 'CORPORATE'
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiService.post<ApiResponse<LoginResponse>>('/auth/client/login', {
      email,
      password,
    })
    return response.data
  }

  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await apiService.post<ApiResponse<RegisterResponse>>('/auth/client/register', data)
    return response.data
  }

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await apiService.post('/auth/logout', { refreshToken })
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiService.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  }

  async getProfile(): Promise<Client> {
    const response = await apiService.get<ApiResponse<Client>>('/auth/client/me')
    return response.data
  }

  async updateProfile(data: Partial<Client>): Promise<Client> {
    const response = await apiService.put<ApiResponse<Client>>('/auth/client/profile', data)
    return response.data
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/client/change-password', {
      currentPassword,
      newPassword,
    })
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiService.post('/auth/client/forgot-password', { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/client/reset-password', {
      token,
      newPassword,
    })
  }

  async verifyEmail(token: string): Promise<void> {
    await apiService.post('/auth/client/verify-email', { token })
  }

  async resendVerificationEmail(): Promise<void> {
    await apiService.post('/auth/client/resend-verification')
  }
}

export const authService = new AuthService()
export default authService
