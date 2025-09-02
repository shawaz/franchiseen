import { User, ApiResponse } from '../types/shared'
import apiService from './api'

interface LoginResponse {
  user: User
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

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiService.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    })
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

  async getProfile(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/auth/me')
    return response.data
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>('/auth/profile', data)
    return response.data
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  }
}

export const authService = new AuthService()
export default authService
