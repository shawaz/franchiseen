import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useMemo } from 'react'

/**
 * Custom hook to simplify Privy authentication and wallet management
 */
export function usePrivyAuth() {
  const { 
    authenticated, 
    user, 
    login, 
    logout, 
    ready,
    sendTransaction,
    signMessage,
  } = usePrivy()
  
  const { wallets, ready: walletsReady } = useWallets()

  // Get Solana wallets
  const solanaWallets = useMemo(() => {
    return wallets.filter(
      wallet => wallet.walletClientType === 'privy' || 
                wallet.walletClientType === 'phantom' ||
                wallet.walletClientType === 'solflare'
    )
  }, [wallets])

  // Get primary Solana wallet
  const primarySolanaWallet = useMemo(() => {
    return solanaWallets[0] || null
  }, [solanaWallets])

  // Get embedded wallet
  const embeddedWallet = useMemo(() => {
    return wallets.find(
      wallet => wallet.walletClientType === 'privy'
    ) || null
  }, [wallets])

  // Get connected wallet addresses
  const walletAddresses = useMemo(() => {
    return wallets.map(wallet => wallet.address)
  }, [wallets])

  return {
    // Authentication state
    authenticated,
    ready,
    user,
    
    // Authentication methods
    login,
    logout,
    
    // Wallet state
    wallets,
    walletsReady,
    solanaWallets,
    primarySolanaWallet,
    embeddedWallet,
    walletAddresses,
    
    // Transaction methods
    sendTransaction,
    signMessage,
    
    // User info
    email: user?.email?.address || null,
    hasWallet: wallets.length > 0,
    hasSolanaWallet: solanaWallets.length > 0,
  }
}

