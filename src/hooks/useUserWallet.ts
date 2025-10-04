import { useState, useEffect, useCallback } from 'react';
import { Keypair } from '@solana/web3.js';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { getWalletBalance } from '@/lib/solanaWalletUtils';

interface UserWallet {
  publicKey: string;
  privateKey: Uint8Array;
  keypair: Keypair;
  balance: number;
  isLoading: boolean;
  error: string | null;
}

interface UseUserWalletProps {
  userId?: Id<"users">;
}

export function useUserWallet({ userId }: UseUserWalletProps = {}) {
  const [wallet, setWallet] = useState<UserWallet>({
    publicKey: '',
    privateKey: new Uint8Array(),
    keypair: new Keypair(),
    balance: 0,
    isLoading: false,
    error: null
  });

  const getUserPrivateKey = useMutation(api.userManagement.getUserPrivateKey);

  // Load wallet from localStorage first (for immediate access)
  const loadLocalWallet = useCallback(async () => {
    try {
      const storedWalletAddress = localStorage.getItem('userWalletAddress');
      const storedPrivateKey = localStorage.getItem('userPrivateKey');
      const storedBalance = localStorage.getItem('userWalletBalance');
      
      if (storedWalletAddress && storedPrivateKey) {
        const privateKeyArray = new Uint8Array(JSON.parse(storedPrivateKey));
        const keypair = Keypair.fromSecretKey(privateKeyArray);
        
        // Always fetch real balance from blockchain for accuracy
        let balance = 0;
        try {
          balance = await getWalletBalance(storedWalletAddress);
          // Update localStorage with real balance
          localStorage.setItem('userWalletBalance', balance.toString());
          console.log(`Fetched real balance from blockchain: ${balance} SOL for wallet ${storedWalletAddress}`);
        } catch (error) {
          console.error('Error fetching wallet balance from blockchain:', error);
          // Fallback to stored balance if blockchain fetch fails
          if (storedBalance) {
            balance = parseFloat(storedBalance);
            console.log(`Using stored balance as fallback: ${balance} SOL`);
          }
        }
        
        setWallet({
          publicKey: storedWalletAddress,
          privateKey: privateKeyArray,
          keypair,
          balance,
          isLoading: false,
          error: null
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error loading local wallet:', error);
    }
    
    return false;
  }, []);

  // Load wallet from server (when userId is provided and local storage is empty)
  const loadServerWallet = useCallback(async () => {
    if (!userId) return;
    
    setWallet(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await getUserPrivateKey({ userId });
      
      const keypair = Keypair.fromSecretKey(new Uint8Array(result.privateKey));
      
      // Get wallet balance
      const balance = await getWalletBalance(result.publicKey || '');
      
      setWallet({
        publicKey: result.publicKey || '',
        privateKey: new Uint8Array(result.privateKey),
        keypair,
        balance,
        isLoading: false,
        error: null
      });
      
      // Store in localStorage for future use
      localStorage.setItem('userWalletAddress', result.publicKey || '');
      localStorage.setItem('userPrivateKey', JSON.stringify(result.privateKey));
      
    } catch (error) {
      console.error('Error loading server wallet:', error);
      setWallet(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load wallet'
      }));
    }
  }, [userId, getUserPrivateKey]);

  // Initialize wallet on mount
  useEffect(() => {
    const initializeWallet = async () => {
      const localWalletLoaded = await loadLocalWallet();
      
      // If no local wallet and userId is provided, load from server
      if (!localWalletLoaded && userId) {
        await loadServerWallet();
      }
    };
    
    initializeWallet();
  }, [loadLocalWallet, loadServerWallet, userId]);

  // Refresh wallet from server
  const refreshWallet = useCallback(async () => {
    if (userId) {
      await loadServerWallet();
    }
  }, [userId, loadServerWallet]);

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
      const currentWallet = localStorage.getItem('userWalletAddress');
      if (currentWallet) {
        const realBalance = await getWalletBalance(currentWallet);
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
      console.error('Error fetching updated balance from blockchain:', error);
    }
  }, []);

  // Clear wallet (for logout)
  const clearWallet = useCallback(() => {
    setWallet({
      publicKey: '',
      privateKey: new Uint8Array(),
      keypair: new Keypair(),
      balance: 0,
      isLoading: false,
      error: null
    });
    
    localStorage.removeItem('userWalletAddress');
    localStorage.removeItem('userPrivateKey');
    localStorage.removeItem('userWalletBalance');
  }, []);

  return {
    wallet,
    refreshWallet,
    clearWallet,
    updateWalletBalance,
    isWalletLoaded: !!wallet.publicKey
  };
}