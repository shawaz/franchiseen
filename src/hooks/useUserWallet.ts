import { useState, useEffect, useCallback } from 'react';
import { getWalletBalance } from '@/lib/solanaWalletUtils';
import { useWallets } from '@privy-io/react-auth';
import { useAuth } from '@/contexts/PrivyAuthContext';

interface UserWallet {
  publicKey: string;
  balance: number;
  isLoading: boolean;
  error: string | null;
}

export function useUserWallet() {
  const { userProfile } = useAuth();
  const { wallets, ready: walletsReady } = useWallets();
  const [wallet, setWallet] = useState<UserWallet>({
    publicKey: '',
    balance: 0,
    isLoading: true,
    error: null
  });

  // Load wallet from Privy embedded wallet or Convex userProfile
  const loadWallet = useCallback(async () => {
    if (!walletsReady) {
      return;
    }

    setWallet(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      let address: string | undefined;

      // Priority 1: Get from Convex userProfile (already synced)
      if (userProfile?.walletAddress) {
        address = userProfile.walletAddress;
        console.log('✅ Using wallet from Convex userProfile:', address);
      } 
      // Priority 2: Get from Privy wallets hook
      else if (wallets.length > 0) {
        const solanaWallet = wallets.find(w => w.walletClientType === 'privy');
        if (solanaWallet) {
          address = solanaWallet.address;
          console.log('✅ Using wallet from Privy wallets:', address);
        }
      }

      if (address) {
        // Get wallet balance
        const balance = await getWalletBalance(address);
        
        setWallet({
          publicKey: address,
          balance,
          isLoading: false,
          error: null
        });
        
        // Store in localStorage for quick access
        localStorage.setItem('userWalletAddress', address);
        localStorage.setItem('userWalletBalance', balance.toString());
        
        console.log(`✅ Loaded wallet: ${address} with balance: ${balance} SOL`);
      } else {
        // No wallet available yet
        console.log('⚠️ No wallet found in userProfile or Privy wallets');
        setWallet({
          publicKey: '',
          balance: 0,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('❌ Error loading wallet:', error);
      setWallet(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load wallet'
      }));
    }
  }, [userProfile?.walletAddress, wallets, walletsReady]);

  // Initialize wallet on mount and when user changes
  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // Refresh wallet 
  const refreshWallet = useCallback(async () => {
    await loadWallet();
  }, [loadWallet]);

  // Update wallet balance after transaction
  const updateWalletBalance = useCallback(async (newBalance: number) => {
    // First update the local state optimistically
    setWallet(prev => ({
      ...prev,
      balance: newBalance
    }));
    
    // Update localStorage balance
    localStorage.setItem('userWalletBalance', newBalance.toString());
    
    // Then fetch the real balance from blockchain to ensure accuracy
    try {
      if (wallet.publicKey) {
        const realBalance = await getWalletBalance(wallet.publicKey);
        console.log(`Updated balance after transaction - Expected: ${newBalance}, Actual from blockchain: ${realBalance}`);
        
        // Update with real balance if it differs significantly
        if (Math.abs(realBalance - newBalance) > 0.001) {
          setWallet(prev => ({
            ...prev,
            balance: realBalance
          }));
          localStorage.setItem('userWalletBalance', realBalance.toString());
          console.log(`Corrected balance to match blockchain: ${realBalance} SOL`);
        }
      }
    } catch (error) {
      console.error('Error fetching updated balance:', error);
    }
  }, [wallet.publicKey]);

  return {
    wallet,
    refreshWallet,
    updateWalletBalance,
  };
}
