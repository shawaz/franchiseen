"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { UiWalletAccount, useWalletAccountTransactionSendingSigner } from '@wallet-ui/react'
import { useSolana } from '@/components/solana/use-solana'
import { useMemo, useState, useEffect } from 'react'

interface Props {
  children: (signer: { signAndSendTransactions: (...args: unknown[]) => Promise<unknown> } | null, error: Error | null, isLoading: boolean) => ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class WalletSignerWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.log('WalletSignerWrapper: Checking error:', error.message);
    
    // Check if it's a WalletStandardError or wallet-related error
    if (error.message.includes('WalletStandardError') || 
        error.message.includes('No underlying Wallet Standard wallet') ||
        error.message.includes('Wallet connection error') ||
        error.message.includes('No valid wallet account connected') ||
        error.message.includes('Wallet signer unavailable')) {
      console.log('WalletSignerWrapper: Catching wallet error:', error.message);
      return { hasError: true, error };
    }
    
    // For other errors, don't catch them
    console.log('WalletSignerWrapper: Not catching non-wallet error:', error.message);
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WalletSignerWrapper caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.children(null, this.state.error || new Error('Wallet connection error'), false);
    }

    return <WalletSignerInner {...this.props} />;
  }
}

function WalletSignerInner({ children }: Props) {
  const { account, cluster } = useSolana()
  const [hookError, setHookError] = useState<Error | null>(null)

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
        clusterId: 'solana:devnet' as string
      }
    }
    
    return { 
      safeAccount: account, 
      clusterId: cluster 
    }
  }, [account, cluster, hasValidAccount])

  // Call the hook
  const rawSigner = useWalletAccountTransactionSendingSigner(
    safeValues.safeAccount || {
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
    safeValues.clusterId as `solana:${string}`
  );

  // Check if the signer is valid
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

  // If there's a hook error or no real account, return a mock signer
  if (hookError || !hasValidAccount || !signer) {
    const errorMessage = hookError?.message || 'No wallet connected';
    
    const mockSigner = {
      signTransaction: async (tx: { toString: () => string }) => {
        console.warn('Wallet signer unavailable - transaction not actually signed', errorMessage)
        return tx
      },
      signAllTransactions: async (txs: { toString: () => string }[]) => {
        console.warn('Wallet signer unavailable - transactions not actually signed', errorMessage)
        return txs
      },
      signAndSendTransactions: async (...args: unknown[]) => {
        console.warn('Wallet signer unavailable - transactions not actually signed', errorMessage)
        return args
      },
      // Add error property for debugging
      error: hookError,
      isMock: true
    };

    return <>{children(mockSigner, hookError, false)}</>;
  }

  // Wrap the real signer to match the expected interface
  const wrappedSigner = {
    signAndSendTransactions: (...args: unknown[]) => {
      return signer.signAndSendTransactions(args[0] as Parameters<typeof signer.signAndSendTransactions>[0], args[1] as Parameters<typeof signer.signAndSendTransactions>[1]);
    }
  };

  return <>{children(wrappedSigner, null, false)}</>;
}

export default WalletSignerWrapper;
