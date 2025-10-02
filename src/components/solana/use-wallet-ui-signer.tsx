import { UiWalletAccount, useWalletAccountTransactionSendingSigner } from '@wallet-ui/react'
import { useSolana } from '@/components/solana/use-solana'
import { useMemo, useState, useEffect } from 'react'


export function useWalletUiSigner() {
  const { account, cluster } = useSolana()
  const [hookError, setHookError] = useState<Error | null>(null)

  // Check if we have a valid account
  const hasValidAccount = account && account.address && account.address !== '11111111111111111111111111111111'

  // Memoize safe values to prevent unnecessary re-renders and ensure stability
  const safeValues = useMemo(() => {
    // Check if we're on the client side to prevent SSR issues
    if (typeof window === 'undefined') {
      return {
        safeAccount: {
          address: '11111111111111111111111111111111' as string,
          publicKey: null,
          chains: ['solana:devnet'],
          features: ['solana:signAndSendTransaction'],
          label: 'Fallback Account',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0Y5RkFGQiIvPgo8cGF0aCBkPSJNOCAxMkgxNlYyMEg4VjEyWiIgZmlsbD0iIzk0QTNBRiIvPgo8L3N2Zz4K',
          appMetadata: {
            name: 'Fallback Wallet',
            url: 'https://fallback.wallet'
          }
        } as unknown as UiWalletAccount,
        clusterId: 'solana:devnet' as string
      }
    }
    // Ensure cluster has all required properties
    const safeCluster = cluster || { 
      id: 'devnet', 
      label: 'Devnet',
      endpoint: 'https://api.devnet.solana.com',
      wsEndpoint: 'wss://api.devnet.solana.com/'
    }
    
    // Ensure cluster.id is a valid string and not undefined
    const clusterId = typeof safeCluster?.id === 'string' ? safeCluster.id : 'devnet'
    
    // Always provide a fallback account to prevent hook errors
    const safeAccount = hasValidAccount ? account : { 
      address: '11111111111111111111111111111111',
      label: 'No Account',
      publicKey: null,
      key: null,
      imported: false,
      isActive: false,
      isPrimary: false,
      derivationPath: null,
      derivationPathString: null,
      type: 'imported' as const,
      chain: 'solana' as const,
      chains: ['solana', 'solana:devnet'] as const,
      features: ['solana:signTransaction', 'solana:signAndSendTransaction'] as const,
      icon: null,
      name: 'No Account',
      standard: 'wallet-standard' as const
    } as unknown as UiWalletAccount
    
    return { safeAccount, clusterId }
  }, [account, cluster, hasValidAccount])

  // Always call the hook - React hooks must be called unconditionally
  const rawSigner = useWalletAccountTransactionSendingSigner(
    safeValues.safeAccount, 
    safeValues.clusterId as `solana:${string}`
  );

  // Check if the signer is valid and handle WalletStandardError
  const signer = useMemo(() => {
    // If we don't have a valid account, return null
    if (!hasValidAccount) {
      return null;
    }

    // If rawSigner is null or has an error, return null
    if (!rawSigner || (typeof rawSigner === 'object' && 'error' in rawSigner)) {
      return null;
    }

    // Check if signer has required methods
    if (typeof rawSigner === 'object' && 'signAndSendTransactions' in rawSigner) {
      return rawSigner;
    }

    return null;
  }, [rawSigner, hasValidAccount]);

  // Handle hook errors and validate signer
  useEffect(() => {
    if (!hasValidAccount) {
      setHookError(new Error('No valid wallet account connected'))
      return
    }

    // Check if rawSigner has an error (WalletStandardError)
    if (rawSigner && typeof rawSigner === 'object' && 'error' in rawSigner) {
      setHookError(new Error(`Wallet Standard Error: ${rawSigner.error}`))
      return
    }

    if (signer && typeof signer === 'object' && 'error' in signer) {
      setHookError(signer.error as Error)
    } else if (signer && typeof signer === 'object' && !('signAndSendTransactions' in signer)) {
      setHookError(new Error('Invalid signer object - missing signAndSendTransactions method'))
    } else if (!signer && hasValidAccount) {
      setHookError(new Error('No signer returned from hook'))
    } else {
      setHookError(null)
    }
  }, [signer, hasValidAccount, rawSigner])

  // Check if we're on the client side to prevent SSR issues
  if (typeof window === 'undefined') {
    return {
      signTransaction: async (tx: { toString: () => string }) => tx,
      signAllTransactions: async (txs: { toString: () => string }[]) => txs,
    }
  }

  // If there's a hook error or no real account, return a mock signer
  if (hookError || !hasValidAccount || !signer) {
    const errorMessage = hookError?.message || 'No wallet connected';
    
    return {
      signTransaction: async (tx: { toString: () => string }) => {
        console.warn('Wallet signer unavailable - transaction not actually signed', errorMessage)
        return tx
      },
      signAllTransactions: async (txs: { toString: () => string }[]) => {
        console.warn('Wallet signer unavailable - transactions not actually signed', errorMessage)
        return txs
      },
      // Add error property for debugging
      error: hookError,
      isMock: true
    }
  }

  return signer
}
