'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { ReactNode } from 'react'

export function PrivyClientProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  
  if (!appId) {
    console.error('NEXT_PUBLIC_PRIVY_APP_ID is not set')
    return <>{children}</>
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        // Customize the login UI
        loginMethods: [ 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        // Embedded wallet configuration
        embeddedWallets: {
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  )
}

