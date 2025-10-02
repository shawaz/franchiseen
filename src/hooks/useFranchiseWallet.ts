import { useState, useEffect, useCallback, useRef } from 'react';
import { Keypair } from '@solana/web3.js';
import { 
  createNewWallet, 
  getWalletBalance, 
  requestAirdrop, 
  transferSOL, 
  storeWallet, 
  getStoredWallet,
  generateDeterministicWallet 
} from '@/lib/solanaWalletUtils';
import { toast } from 'sonner';

interface FranchiseWallet {
  publicKey: string;
  secretKey: Uint8Array;
  keypair: Keypair;
  balance: number;
  isLoading: boolean;
}

interface UseFranchiseWalletProps {
  franchiseId?: string;
  franchiserId?: string;
  useDeterministic?: boolean;
}

export function useFranchiseWallet({ 
  franchiseId, 
  franchiserId, 
  useDeterministic = false 
}: UseFranchiseWalletProps = {}) {
  const [wallet, setWallet] = useState<FranchiseWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store the latest initializeWallet function
  const initializeWalletRef = useRef<(() => Promise<void>) | null>(null);

  // Create or retrieve wallet
  const initializeWallet = useCallback(async () => {
    if (!franchiseId) {
      console.log('No franchiseId provided to useFranchiseWallet');
      return;
    }

    console.log('Initializing wallet for franchiseId:', franchiseId);
    setIsLoading(true);
    setError(null);

    try {
      // Try to get existing wallet first
      const storedWallet = getStoredWallet(franchiseId);
      console.log('Stored wallet found:', !!storedWallet);
      
      if (storedWallet) {
        console.log('Using stored wallet:', storedWallet.publicKey);
        const keypair = Keypair.fromSecretKey(storedWallet.secretKey);
        const balance = await getWalletBalance(storedWallet.publicKey);
        console.log('Wallet balance:', balance);
        
        setWallet({
          publicKey: storedWallet.publicKey,
          secretKey: storedWallet.secretKey,
          keypair,
          balance,
          isLoading: false
        });
      } else {
        console.log('No stored wallet found, creating new one');
        // Create new wallet
        let newWallet;
        
        if (useDeterministic && franchiserId) {
          console.log('Creating deterministic wallet');
          newWallet = generateDeterministicWallet(franchiseId, franchiserId);
        } else {
          console.log('Creating random wallet');
          newWallet = createNewWallet();
        }

        console.log('New wallet created:', newWallet.publicKey);

        // Store the wallet
        storeWallet(newWallet.publicKey, newWallet.secretKey, franchiseId);
        console.log('Wallet stored for franchiseId:', franchiseId);

        // Get initial balance
        const balance = await getWalletBalance(newWallet.publicKey);
        console.log('Initial wallet balance:', balance);

        setWallet({
          publicKey: newWallet.publicKey,
          secretKey: newWallet.secretKey,
          keypair: newWallet.keypair,
          balance,
          isLoading: false
        });

        toast.success('New franchise wallet created!');
      }
    } catch (err) {
      console.error('Error initializing wallet:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize wallet';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [franchiseId, franchiserId, useDeterministic]);

  // Store the latest initializeWallet function in ref
  initializeWalletRef.current = initializeWallet;

  // Refresh wallet balance
  const refreshBalance = useCallback(async () => {
    if (!wallet) return;

    setIsLoading(true);
    try {
      const balance = await getWalletBalance(wallet.publicKey);
      setWallet(prev => prev ? { ...prev, balance, isLoading: false } : null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh balance';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  // Request airdrop (for devnet testing)
  const requestAirdropToWallet = useCallback(async (amount: number = 1) => {
    if (!wallet) return;

    setIsLoading(true);
    try {
      const signature = await requestAirdrop(wallet.publicKey, amount);
      if (signature) {
        toast.success(`${amount} SOL airdropped to franchise wallet!`);
        await refreshBalance();
      } else {
        toast.error('Failed to request airdrop');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request airdrop';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [wallet, refreshBalance]);

  // Transfer SOL to this wallet
  const transferToWallet = useCallback(async (
    fromKeypair: Keypair, 
    amount: number, 
    network: 'devnet' | 'mainnet-beta' = 'devnet'
  ) => {
    if (!wallet) return;

    setIsLoading(true);
    try {
      const signature = await transferSOL(fromKeypair, wallet.publicKey, amount, network);
      if (signature) {
        toast.success(`${amount} SOL transferred to franchise wallet!`);
        await refreshBalance();
        return signature;
      } else {
        toast.error('Failed to transfer SOL');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transfer SOL';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [wallet, refreshBalance]);

  // Initialize wallet when franchiseId changes
  useEffect(() => {
    if (franchiseId && initializeWalletRef.current) {
      initializeWalletRef.current();
    }
  }, [franchiseId]); // Stable dependency array

  return {
    wallet,
    isLoading,
    error,
    initializeWallet,
    refreshBalance,
    requestAirdropToWallet,
    transferToWallet
  };
}
