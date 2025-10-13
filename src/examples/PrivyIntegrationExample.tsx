'use client'

/**
 * Example component demonstrating Privy integration
 * This shows how to use Privy for authentication and wallet management
 */

import { usePrivyAuth } from '@/hooks/usePrivyAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function PrivyIntegrationExample() {
  const {
    authenticated,
    ready,
    login,
    logout,
    user,
    email,
    primarySolanaWallet,
    wallets,
    hasSolanaWallet,
  } = usePrivyAuth()

  if (!ready) {
    return <div>Loading Privy...</div>
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Privy Integration Example</CardTitle>
          <CardDescription>
            This example demonstrates how to use Privy for authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!authenticated ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to authenticate with Privy. You can use email, 
                connect a wallet, or sign in with Google.
              </p>
              <Button onClick={login} className="w-full">
                Login with Privy
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ Authenticated
                </p>
              </div>

              {/* User Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">User Information</h3>
                <div className="text-sm space-y-1">
                  {email && (
                    <p>
                      <span className="text-muted-foreground">Email:</span> {email}
                    </p>
                  )}
                  <p>
                    <span className="text-muted-foreground">User ID:</span>{' '}
                    {user?.id ? shortenAddress(user.id) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Wallet Info */}
              {hasSolanaWallet && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Wallets ({wallets.length})</h3>
                  <div className="space-y-2">
                    {wallets.map((wallet, index) => (
                      <div
                        key={wallet.address}
                        className="p-3 bg-muted rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {wallet.walletClientType === 'privy'
                                ? 'Embedded Wallet'
                                : wallet.walletClientType}
                            </p>
                            <p className="text-muted-foreground font-mono">
                              {shortenAddress(wallet.address)}
                            </p>
                          </div>
                          {index === 0 && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Primary Solana Wallet */}
              {primarySolanaWallet && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium mb-2">Primary Solana Wallet</p>
                  <p className="font-mono text-sm break-all">
                    {primarySolanaWallet.address}
                  </p>
                </div>
              )}

              {/* Logout Button */}
              <Button onClick={logout} variant="outline" className="w-full">
                Logout
              </Button>
            </div>
          )}

          {/* Info */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              💡 Tip: You can use the `usePrivyAuth()` hook in any component to access
              authentication state and user information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

