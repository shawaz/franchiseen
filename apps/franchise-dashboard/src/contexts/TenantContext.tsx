import React, { createContext, useContext, useEffect, useState } from 'react'
import { Tenant } from '../types/shared'
import { useAuth } from './AuthContext'

interface TenantContextType {
  tenant: Tenant | null
  tenantId: string | null
  isLoading: boolean
  setTenant: (tenant: Tenant | null) => void
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export const useTenant = () => {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

interface TenantProviderProps {
  children: React.ReactNode
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  const tenantId = tenant?.id || null

  useEffect(() => {
    if (isAuthenticated && user?.tenantId) {
      // In a real app, you would fetch tenant details here
      // For now, we'll create a mock tenant based on user data
      const mockTenant: Tenant = {
        id: user.tenantId,
        name: `${user.firstName}'s Franchise`,
        subdomain: 'demo-franchise',
        status: 'ACTIVE',
        plan: 'PROFESSIONAL',
        settings: {},
        franchiseType: 'financial_services',
        licenseNumber: 'FS-2024-001',
        regulatoryInfo: {},
        commissionRate: 0.025,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: user.id,
      }
      
      setTenant(mockTenant)
      localStorage.setItem('tenantId', user.tenantId)
    } else {
      setTenant(null)
      localStorage.removeItem('tenantId')
    }
    
    setIsLoading(false)
  }, [isAuthenticated, user])

  const value: TenantContextType = {
    tenant,
    tenantId,
    isLoading,
    setTenant,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}
