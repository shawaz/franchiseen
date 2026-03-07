import { useState, useEffect, useCallback } from 'react';
import { getWalletBalance, getUSDCBalance } from '@/lib/solanaWalletUtils';
import { useAuth } from '@/contexts/PrivyAuthContext';

interface UserWallet {
  publicKey: string;
  balance: number;
  usdcBalance: number;
  isLoading: boolean;
  error: string | null;
}

export function useUserWallet() {
  const { userProfile, privyUser } = useAuth();
  const [wallet, setWallet] = useState<UserWallet>({
    publicKey: '',
    balance: 0,
    usdcBalance: 0,
    isLoading: true,
    error: null
  });

  // Load wallet from Convex userProfile
  const loadWallet = useCallback(async () => {
    setWallet(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      let address: string | undefined;

      // 1. Get from Convex userProfile (already synced)
      if (userProfile?.walletAddress) {
        address = userProfile.walletAddress;
        console.log('✅ [useUserWallet] Using wallet from Convex userProfile:', address);
      }
      // 2. Fallback to direct Crossmint user object
      else if (privyUser?.walletAddress) {
        address = privyUser.walletAddress;
        console.log('✅ [useUserWallet] Using wallet via privyUser.walletAddress:', address);
      }
      else if (privyUser?.wallets?.[0]?.address) {
        address = privyUser.wallets[0].address;
        console.log('✅ [useUserWallet] Using wallet via privyUser.wallets[0]:', address);
      }
      else if (privyUser?.address) {
        address = privyUser.address;
        console.log('✅ [useUserWallet] Using wallet via privyUser.address:', address);
      }
      else {
        console.log('🔍 [useUserWallet] No wallet address found in:', {
          userProfileAddress: userProfile?.walletAddress,
          privyUserAddress: privyUser?.walletAddress,
          privyUserWallets: privyUser?.wallets,
          privyUserDirectAddress: privyUser?.address
        });
      }

      if (address) {
        // Get wallet balance and USDC balance
        const [balance, usdcBalance] = await Promise.all([
          getWalletBalance(address),
          getUSDCBalance(address)
        ]);

        setWallet({
          publicKey: address,
          balance,
          usdcBalance,
          isLoading: false,
          error: null
        });

        // Store in localStorage for quick access
        localStorage.setItem('userWalletAddress', address);
        localStorage.setItem('userWalletBalance', balance.toString());
        localStorage.setItem('userWalletUSDCBalance', usdcBalance.toString());

        console.log(`✅ Loaded wallet: ${address} with balance: ${balance} SOL, ${usdcBalance} USDC`);
      } else {
        // No wallet available yet
        console.log('⚠️ No wallet found in userProfile or Privy wallets');
        setWallet({
          publicKey: '',
          balance: 0,
          usdcBalance: 0,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('❌ [useUserWallet] Error loading wallet:', error);
      setWallet(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load wallet'
      }));
    }
  }, [userProfile?.walletAddress, privyUser]);

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
