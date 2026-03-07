import { useState, useEffect, useCallback } from 'react';
import { getWalletBalance, getUSDCBalance } from '@/lib/solanaWalletUtils';
import { useAuth } from '@/contexts/PrivyAuthContext';
import { useWallet } from '@crossmint/client-sdk-react-ui';

interface UserWallet {
  publicKey: string;
  balance: number;
  usdcBalance: number;
  isLoading: boolean;
  error: string | null;
}

export function useUserWallet() {
  const { userProfile, privyUser } = useAuth();
  // Use the Crossmint useWallet hook as the primary source
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const crossmintWallet = useWallet() as any;
  const [wallet, setWallet] = useState<UserWallet>({
    publicKey: '',
    balance: 0,
    usdcBalance: 0,
    isLoading: true,
    error: null
  });

  // Extract address from wallet sources
  const getWalletAddress = useCallback((): string | undefined => {
    // 1. Primary: Crossmint useWallet hook (most reliable)
    if (crossmintWallet?.address) {
      console.log('✅ [useUserWallet] Using wallet from useWallet hook:', crossmintWallet.address);
      return crossmintWallet.address;
    }
    // 2. Crossmint wallet from wallet object
    if (crossmintWallet?.wallet?.address) {
      console.log('✅ [useUserWallet] Using wallet.address from useWallet hook:', crossmintWallet.wallet.address);
      return crossmintWallet.wallet.address;
    }
    // 3. Convex userProfile (already synced)
    if (userProfile?.walletAddress) {
      console.log('✅ [useUserWallet] Using wallet from Convex userProfile:', userProfile.walletAddress);
      return userProfile.walletAddress;
    }
    // 4. Fallback: direct Crossmint user object
    if (privyUser?.walletAddress) {
      console.log('✅ [useUserWallet] Using wallet via privyUser.walletAddress:', privyUser.walletAddress);
      return privyUser.walletAddress;
    }
    if (privyUser?.wallets?.[0]?.address) {
      console.log('✅ [useUserWallet] Using wallet via privyUser.wallets[0]:', privyUser.wallets[0].address);
      return privyUser.wallets[0].address;
    }
    if (privyUser?.address) {
      console.log('✅ [useUserWallet] Using wallet via privyUser.address:', privyUser.address);
      return privyUser.address;
    }

    console.log('🔍 [useUserWallet] No wallet address found in:', {
      crossmintWalletAddress: crossmintWallet?.address,
      crossmintWalletObjectAddress: crossmintWallet?.wallet?.address,
      crossmintWalletStatus: crossmintWallet?.status,
      userProfileAddress: userProfile?.walletAddress,
      privyUserAddress: privyUser?.walletAddress,
      privyUserWallets: privyUser?.wallets,
    });
    return undefined;
  }, [crossmintWallet, userProfile?.walletAddress, privyUser]);

  // Load wallet balances
  const loadWallet = useCallback(async () => {
    setWallet(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const address = getWalletAddress();

      if (address) {
        const [balance, usdcBalance] = await Promise.all([
          getWalletBalance(address),
          getUSDCBalance(address)
        ]);

        // Add mocked staging balance
        let finalUsdcBalance = usdcBalance;
        try {
          const mockedStr = localStorage.getItem('mocked_usdc_balance');
          if (mockedStr) {
            finalUsdcBalance += parseFloat(mockedStr);
          }
        } catch (e) {
          console.error('Error reading mocked balance', e);
        }

        setWallet({
          publicKey: address,
          balance,
          usdcBalance: finalUsdcBalance,
          isLoading: false,
          error: null
        });

        localStorage.setItem('userWalletAddress', address);
        localStorage.setItem('userWalletBalance', balance.toString());
        localStorage.setItem('userWalletUSDCBalance', finalUsdcBalance.toString());

        console.log(`✅ Loaded wallet: ${address} with USDC: ${usdcBalance}`);
      } else {
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
  }, [getWalletAddress]);

  // Initialize wallet on mount and when user/wallet changes
  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const refreshWallet = useCallback(async () => {
    await loadWallet();
  }, [loadWallet]);

  const updateWalletBalance = useCallback(async (newBalance: number) => {
    setWallet(prev => ({ ...prev, balance: newBalance }));
    localStorage.setItem('userWalletBalance', newBalance.toString());
  }, []);

  const addMockedUSDC = useCallback((amount: number) => {
    try {
      const currentMock = parseFloat(localStorage.getItem('mocked_usdc_balance') || '0');
      localStorage.setItem('mocked_usdc_balance', (currentMock + amount).toString());
      refreshWallet();
    } catch (e) {
      console.error('Error adding mock balance', e);
    }
  }, [refreshWallet]);

  return {
    wallet,
    refreshWallet,
    updateWalletBalance,
    addMockedUSDC,
  };
}
