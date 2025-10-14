'use client'

import { ThemeProvider } from '@/components/default/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { ConvexClientProvider } from '@/providers/convex-provider'
import { PrivyProvider } from '@privy-io/react-auth'
import { PrivyAuthProvider } from '@/contexts/PrivyAuthContext'
import { NetworkProvider } from '@/contexts/NetworkContext'
import React from 'react'

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  if (!privyAppId) {
    console.error('NEXT_PUBLIC_PRIVY_APP_ID is not set');
  }

  return (
    <ConvexClientProvider>
      <PrivyProvider
        appId={privyAppId || ''}
        config={{
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
            logo: '/logo.svg',
          },
          loginMethods: ['google'],
        }}
      >
        <PrivyAuthProvider>
          <NetworkProvider>
            <ReactQueryProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <SolanaProvider>{children}</SolanaProvider>
              </ThemeProvider>
            </ReactQueryProvider>
          </NetworkProvider>
        </PrivyAuthProvider>
      </PrivyProvider>
    </ConvexClientProvider>
  )
}
