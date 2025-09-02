import React, { createContext, useContext, useEffect, useState } from 'react'
import { Client } from '../types/shared'
import { authService } from '../services/auth'
import toast from 'react-hot-toast'

interface AuthContextType {
  client: Client | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  updateProfile: (data: Partial<Client>) => Promise<void>
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

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!client

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      setClient(response.client)
      
      // Store tokens
      localStorage.setItem('accessToken', response.tokens.accessToken)
      localStorage.setItem('refreshToken', response.tokens.refreshToken)
      
      toast.success('Welcome to your financial portal!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data)
      setClient(response.client)
      
      // Store tokens
      localStorage.setItem('accessToken', response.tokens.accessToken)
      localStorage.setItem('refreshToken', response.tokens.refreshToken)
      
      toast.success('Account created successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
      throw error
    }
  }

  const logout = () => {
    setClient(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    toast.success('Logged out successfully')
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authService.refreshToken(refreshToken)
      localStorage.setItem('accessToken', response.accessToken)
    } catch (error) {
      logout()
      throw error
    }
  }

  const updateProfile = async (data: Partial<Client>) => {
    try {
      const updatedClient = await authService.updateProfile(data)
      setClient(updatedClient)
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
      throw error
    }
  }

  const loadClient = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setIsLoading(false)
        return
      }

      const client = await authService.getProfile()
      setClient(client)
    } catch (error: any) {
      // Try to refresh token
      try {
        await refreshToken()
        const client = await authService.getProfile()
        setClient(client)
      } catch (refreshError) {
        logout()
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClient()
  }, [])

  const value: AuthContextType = {
    client,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
