import { useMemo } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useUserWallet } from './useUserWallet'
import { useAuth } from '@/contexts/AuthContext'
import { Id } from '../../convex/_generated/dataModel'

/**
 * Unified wallet hook that checks BOTH:
 * 1. Traditional user wallet (from database)
 * 2. Privy wallet (from Privy auth)
 * 
 * Returns the first available wallet
 */
export function useUnifiedWallet() {
  const { userProfile } = useAuth()
  const { authenticated: privyAuthenticated, ready: privyReady } = usePrivy()
  const { wallets: privyWallets } = useWallets()
  
  // Get traditional user wallet
  const { 
    wallet: userWallet, 
    isWalletLoaded: isUserWalletLoaded,
    updateWalletBalance 
  } = useUserWallet({ 
    userId: userProfile?.userId ? userProfile.userId as Id<"users"> : undefined 
  })

  // Get Privy Solana wallets
  const privySolanaWallets = useMemo(() => {
    if (!privyReady || !privyAuthenticated) return []
    return privyWallets.filter(
      wallet => wallet.walletClientType === 'privy' || 
                wallet.walletClientType === 'phantom' ||
                wallet.walletClientType === 'solflare'
    )
  }, [privyWallets, privyReady, privyAuthenticated])

  const primaryPrivyWallet = privySolanaWallets[0] || null

  // Determine which wallet to use
  const hasUserWallet = isUserWalletLoaded && userWallet.publicKey
  const hasPrivyWallet = privyReady && primaryPrivyWallet !== null

  // Unified wallet object
  const unifiedWallet = useMemo(() => {
    if (hasUserWallet) {
      // Use traditional user wallet (include all properties for backward compatibility)
      return {
        type: 'user' as const,
        publicKey: userWallet.publicKey,
        balance: userWallet.balance,
        keypair: userWallet.keypair,
        privateKey: userWallet.privateKey,
        isLoaded: true,
        source: 'database'
      }
    } else if (hasPrivyWallet && primaryPrivyWallet) {
      // Use Privy wallet
      return {
        type: 'privy' as const,
        publicKey: primaryPrivyWallet.address,
        balance: 0, // Privy doesn't provide balance directly, would need to fetch
        keypair: null,
        privateKey: null,
        isLoaded: true,
        source: 'privy',
        privyWallet: primaryPrivyWallet
      }
    } else {
      // No wallet
      return {
        type: null,
        publicKey: null,
        balance: 0,
        keypair: null,
        privateKey: null,
        isLoaded: privyReady || isUserWalletLoaded,
        source: null
      }
    }
  }, [hasUserWallet, hasPrivyWallet, userWallet, primaryPrivyWallet, privyReady, isUserWalletLoaded])

  return {
    wallet: unifiedWallet,
    isWalletLoaded: unifiedWallet.isLoaded,
    hasWallet: unifiedWallet.publicKey !== null,
    userWallet, // Original user wallet for backward compatibility
    privyWallet: primaryPrivyWallet,
    updateWalletBalance,
    // Helper methods
    getPublicKey: () => unifiedWallet.publicKey,
    getBalance: () => unifiedWallet.balance,
    getWalletType: () => unifiedWallet.type,
  }
}

