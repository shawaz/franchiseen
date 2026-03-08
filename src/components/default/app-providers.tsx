'use client'

import { ThemeProvider } from '@/components/default/theme-provider'
import { ReactQueryProvider } from './react-query-provider'
import { SolanaProvider } from '@/components/solana/solana-provider'
import { ConvexClientProvider } from '@/providers/convex-provider'
import { CrossmintProvider, CrossmintAuthProvider, CrossmintWalletProvider } from '@crossmint/client-sdk-react-ui'
import { PrivyAuthProvider } from '@/contexts/PrivyAuthContext'
import { NetworkProvider } from '@/contexts/NetworkContext'
import React from 'react'

/**
 * Hostname → Crossmint environment mapping:
 *   franchiseen.com       → production keys
 *   play.franchiseen.com  → staging keys
 *   localhost / other     → staging keys  (safe dev default)
 */
function getCrossmintConfig(): { clientId: string; environment: 'staging' | 'production' } {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const isProduction = hostname === 'franchiseen.com' || hostname === 'www.franchiseen.com'

  if (isProduction) {
    return {
      clientId: process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID_PRODUCTION || '',
      environment: 'production',
    }
  }

  return {
    clientId: process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_ID_STAGING || '',
    environment: 'staging',
  }
}

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const { clientId: crossmintClientId, environment: crossmintEnv } = getCrossmintConfig()

  if (!crossmintClientId) {
    console.error(
      '[Crossmint] Missing client ID — check NEXT_PUBLIC_CROSSMINT_CLIENT_ID_STAGING / _PRODUCTION in your env'
    )
  }

  return (
    <ConvexClientProvider>
      <CrossmintProvider apiKey={crossmintClientId}>
        <CrossmintAuthProvider>
          <CrossmintWalletProvider appearance={{ colors: { background: "#000000" } }} createOnLogin={{ chain: 'solana', signer: { type: 'email' } }}>
            <PrivyAuthProvider>
              <NetworkProvider>
                <ReactQueryProvider>
                  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <SolanaProvider>{children}</SolanaProvider>
                  </ThemeProvider>
                </ReactQueryProvider>
              </NetworkProvider>
            </PrivyAuthProvider>
          </CrossmintWalletProvider>
        </CrossmintAuthProvider>
      </CrossmintProvider>
    </ConvexClientProvider>
  )
}
