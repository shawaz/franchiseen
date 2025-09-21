'use client'

import { ThemeProvider } from '@/components/default/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { MoralisProviders } from './moralis-provider'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ReactQueryProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <MoralisProviders>
          <SolanaProvider>{children}</SolanaProvider>
        </MoralisProviders>
      </ThemeProvider>
    </ReactQueryProvider>
  )
}
