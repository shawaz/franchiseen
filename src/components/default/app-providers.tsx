'use client'

import { ThemeProvider } from '@/components/default/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { ConvexClientProvider } from '@/providers/convex-provider'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ConvexClientProvider>
      <ReactQueryProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SolanaProvider>{children}</SolanaProvider>
        </ThemeProvider>
      </ReactQueryProvider>
    </ConvexClientProvider>
  )
}
