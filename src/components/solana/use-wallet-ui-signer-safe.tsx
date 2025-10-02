"use client";

import { UiWalletAccount, useWalletAccountTransactionSendingSigner } from '@wallet-ui/react'
import { useSolana } from '@/components/solana/use-solana'
import { useMemo, useState, useEffect } from 'react'

// Safe wrapper for useWalletAccountTransactionSendingSigner that handles WalletStandardError
export function useWalletUiSignerSafe() {
  const { account, cluster } = useSolana()
  const [hookError, setHookError] = useState<Error | null>(null)
  const [isWalletError, setIsWalletError] = useState(false)

  // Check if we have a valid account (not fallback)
  const hasValidAccount = useMemo(() => {
    return account && 
           account.address !== '11111111111111111111111111111111' && 
           account.address !== 'null' &&
           account.address !== null
  }, [account])

  // Safe values for the hook
  const safeValues = useMemo(() => {
    if (!hasValidAccount) {
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
        clusterId: 'solana:devnet' as unknown as string
      }
    }
    
    return { 
      safeAccount: account, 
      clusterId: cluster 
    }
  }, [account, cluster, hasValidAccount])

  // Call the hook with error boundary
  let rawSigner: { signAndSendTransactions: (...args: unknown[]) => Promise<unknown> } | null = null;
  const signerError: Error | null = null;

  // Use a custom hook that wraps the original with error handling
  const useWalletAccountTransactionSendingSignerSafe = () => {
    try {
      if (!safeValues.safeAccount) {
        return null;
      }
      return useWalletAccountTransactionSendingSigner(
        safeValues.safeAccount, 
        safeValues.clusterId
      );
    } catch (error) {
      console.warn('WalletStandardError caught in useWalletAccountTransactionSendingSigner:', error);
      return null;
    }
  };

  rawSigner = useWalletAccountTransactionSendingSignerSafe();

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
      setIsWalletError(true)
      return
    }

    // Check if rawSigner has an error (WalletStandardError)
    if (rawSigner && typeof rawSigner === 'object' && 'error' in rawSigner) {
      setHookError(new Error(`Wallet Standard Error: ${rawSigner.error}`))
      setIsWalletError(true)
      return
    }

    if (signer && typeof signer === 'object' && 'error' in signer) {
      setHookError(signer.error as Error)
      setIsWalletError(true)
    } else if (signer && typeof signer === 'object' && !('signAndSendTransactions' in signer)) {
      setHookError(new Error('Invalid signer object - missing signAndSendTransactions method'))
      setIsWalletError(true)
    } else if (!signer && hasValidAccount) {
      setHookError(new Error('No signer returned from hook'))
      setIsWalletError(true)
    } else {
      setHookError(null)
      setIsWalletError(false)
    }
  }, [signer, hasValidAccount, rawSigner])

  // If there's a hook error or no real account, return a mock signer
  if (hookError || !hasValidAccount || !signer || isWalletError) {
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
      isMock: true,
      isWalletError
    }
  }

  return signer
}
