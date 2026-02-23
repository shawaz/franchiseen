'use client'

import { ThemeProvider } from '@/components/default/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { ConvexClientProvider } from '@/providers/convex-provider'
import { CrossmintProvider, CrossmintAuthProvider } from '@crossmint/client-sdk-react-ui'
import { PrivyAuthProvider } from '@/contexts/PrivyAuthContext'
import { NetworkProvider } from '@/contexts/NetworkContext'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const crossmintClientId = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID;
  const crossmintEnv = process.env.NEXT_PUBLIC_CROSSMINT_ENVIRONMENT as 'staging' | 'production' | undefined;

  if (!crossmintClientId) {
    console.error('NEXT_PUBLIC_CROSSMINT_CLIENT_ID is not set');
  }

  return (
    <ConvexClientProvider>
      <CrossmintProvider apiKey={crossmintClientId || ''}>
        <CrossmintAuthProvider>
          <PrivyAuthProvider>
            <NetworkProvider>
              <ReactQueryProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                  <SolanaProvider>{children}</SolanaProvider>
                </ThemeProvider>
              </ReactQueryProvider>
            </NetworkProvider>
          </PrivyAuthProvider>
        </CrossmintAuthProvider>
      </CrossmintProvider>
    </ConvexClientProvider>
  )
}
