'use client'

import { ThemeProvider } from '@/components/default/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { ConvexClientProvider } from '@/providers/convex-provider'
import { AuthProvider } from '@/contexts/AuthContext'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConvexClientProvider>
      <AuthProvider>
        <ReactQueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SolanaProvider>{children}</SolanaProvider>
          </ThemeProvider>
        </ReactQueryProvider>
      </AuthProvider>
    </ConvexClientProvider>
  )
}
