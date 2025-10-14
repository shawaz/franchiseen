"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ArrowUpDown, Copy, ArrowDownLeft, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '../../ui/button';
import { useAuth } from '@/contexts/PrivyAuthContext';
import { useSolPrice } from '@/lib/coingecko';
import { getSolanaConnection } from '@/lib/solanaConnection';
import { useNetwork } from '@/contexts/NetworkContext';

interface WalletProps {
  onAddMoney?: () => void;
  className?: string;
}

// Demo data
// SOL to USD rate will be fetched from CoinGecko API

const UserWallet: React.FC<WalletProps> = ({
  onAddMoney,
  className = '',
}) => {
  // Get user profile with wallet address from global auth context
  const { userProfile } = useAuth();
  const walletAddress = userProfile?.walletAddress;
  const connected = !!walletAddress;
  const avatarUrl = userProfile?.avatarUrl || null;
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState<boolean>(false);
  const [lastAirdropTime, setLastAirdropTime] = useState<number | null>(null);
  const [nextAirdropIn, setNextAirdropIn] = useState<number | null>(null);
  
  // Get network state from context
  const { isDevnet } = useNetwork();
  
  // Get SOL to USD price from CoinGecko
  const { price: solToUsdPrice, loading: priceLoading, error: priceError } = useSolPrice();

  // Initialize client-side state to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
    setLastUpdated(new Date());
  }, []);

  // Load last airdrop time from localStorage on component mount
  useEffect(() => {
    const savedTime = localStorage.getItem('lastAirdropTime');
    if (savedTime) {
      setLastAirdropTime(Number(savedTime));
    }
  }, []);

  // Update next airdrop time every second
  useEffect(() => {
    if (!lastAirdropTime) return;

    const checkAirdropCooldown = () => {
      const now = Date.now();
      const cooldownPeriod = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
      const timeSinceLastAirdrop = now - lastAirdropTime;
      
      if (timeSinceLastAirdrop < cooldownPeriod) {
        const timeRemaining = cooldownPeriod - timeSinceLastAirdrop;
        setNextAirdropIn(Math.ceil(timeRemaining / 1000)); // Convert to seconds
      } else {
        setNextAirdropIn(0);
      }
    };

    checkAirdropCooldown();
    const interval = setInterval(checkAirdropCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastAirdropTime]);

  // Format time remaining as HH:MM:SS
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  // Fetch balance using Helius RPC with automatic fallback
  const fetchBalance = useCallback(async () => {
    if (!connected || !walletAddress) {
      setBalance(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Use robust connection with Helius + fallbacks
      const network = isDevnet ? 'devnet' : 'mainnet-beta';
      const connection = getSolanaConnection(network);
      
      // Fetch balance with automatic retry and fallback
      const balanceInSol = await connection.getBalance(walletAddress);
      
      setBalance(balanceInSol);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance. Please try again later.');
      
      // If we have a cached balance, show warning but keep it
      if (balance > 0) {
        toast.info('Showing cached balance. Some features may be limited.');
      } else {
        setBalance(0);
      }
    } finally {
      setLoading(false);
    }
  }, [connected, walletAddress, balance, isDevnet]);

  useEffect(() => {
    fetchBalance();
    // Set up interval to refresh balance every 30 seconds
    const intervalId = setInterval(fetchBalance, 30000);
    
    return () => clearInterval(intervalId);
  }, [connected, walletAddress, isDevnet, fetchBalance]);

  const requestAirdrop = async () => {
    if (!walletAddress || (nextAirdropIn !== null && nextAirdropIn > 0)) return;
    
    setIsRequestingAirdrop(true);
    try {
      // Use a more reliable devnet RPC endpoint
      const connection = new Connection(
        'https://api.devnet.solana.com', 
        { commitment: 'confirmed', confirmTransactionInitialTimeout: 60000 }
      );
      const publicKey = new PublicKey(walletAddress);
      
      console.log('Requesting airdrop to:', walletAddress);
      
      // Add retry logic for airdrop requests
      let signature;
      let retries = 3;
      
      while (retries > 0) {
        try {
          signature = await connection.requestAirdrop(
            publicKey,
            1 * LAMPORTS_PER_SOL
          );
          break;
        } catch (retryError) {
          retries--;
          if (retries === 0) throw retryError;
          
          console.log(`Airdrop failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        }
      }
      
      if (signature) {
        console.log('Airdrop signature:', signature);
        
        // Wait for confirmation with timeout
        const confirmation = await Promise.race([
          connection.confirmTransaction(signature, 'confirmed'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Transaction confirmation timeout')), 30000)
          )
        ]);
        
        if (confirmation) {
          const now = Date.now();
          setLastAirdropTime(now);
          localStorage.setItem('lastAirdropTime', now.toString());
          await fetchBalance();
          toast.success('1 SOL airdropped to your wallet!');
        }
      }
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      
      // More specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage?.includes('Internal error')) {
        toast.error('Devnet is currently experiencing issues. Please try again in a few minutes.');
      } else if (errorMessage?.includes('429') || errorMessage?.includes('rate limit')) {
        toast.error('Rate limit exceeded. Please wait before requesting another airdrop.');
      } else if (errorMessage?.includes('timeout')) {
        toast.error('Transaction timed out. Please check your wallet balance.');
      } else {
        toast.error('Failed to request airdrop. Please try again.');
      }
    } finally {
      setIsRequestingAirdrop(false);
    }
  };
  
  const formatSol = (value: number) => {
    return value.toFixed(4) + ' SOL';
  };

  const formatAmount = (sol: number) => {
    const usdPrice = solToUsdPrice || 150.0; // Fallback price if CoinGecko fails
    return `$${(sol * usdPrice).toFixed(2)} USD`;
  };

  const copyWalletAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success('Wallet address copied to clipboard!');
    }
  };



  return (
    <div>
      {/* User Header */}
      <div className="p-3 flex items-center gap-3 justify-between sm:p-4 bg-white dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700">
        <div className="flex items-center gap-3">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="User Avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-700 dark:text-white font-semibold text-sm">
                {userProfile?.fullName?.[0] || userProfile?.email?.[0] || 'U'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-md text-gray-900 dark:text-white">
              {userProfile?.fullName || userProfile?.email || 'User'}
            </h3>
            <div className="flex items-center gap-2">
              {walletAddress ? (
                <>
                  <span className="font-mono text-xs">
                    {`${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`}
                  </span>
                  <button
                    onClick={copyWalletAddress}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">Wallet not generated</span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={fetchBalance}
          disabled={loading}
        >
          <RotateCw className="h-4 w-4" />
          <span className="font-medium">REFRESH</span>
        </Button>
      </div>

      {/* Wallet Card */}
      <div className={`bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-white overflow-hidden ${className}`}>
        <div className="p-4 sm:p-6">
          {/* Balance Display */}
          <div className="mb-6">
            {/* {connected && account?.address ? (
              <div className="flex items-center gap-2 text-sm">
                <WalletIcon className="h-4 w-4" />
                
                <button onClick={copyWalletAddress} className="text-yellow-400 hover:text-yellow-300">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-sm text-yellow-200">
                Connect your wallet to view balance
              </div>
            )} */}
            <div className="grid grid-cols-2 gap-4">
              {/* USD Balance */}
              <div>
                <div className="text-yellow-100 text-xs mb-1">
                  USD Balance
                </div>
                <div className="text-2xl sm:text-3xl font-bold">
                  {loading || priceLoading ? '...' : formatAmount(balance)}
                </div>
                <div className="text-yellow-200 text-xs mt-1">
                  {priceError ? 'Price unavailable' : `$${(solToUsdPrice || 150.0).toFixed(2)} USD/SOL`}
                </div>
              </div>
              {/* SOL Balance */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-yellow-100 text-xs">SOL Balance</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isDevnet 
                      ? 'bg-yellow-500 text-yellow-900' 
                      : 'bg-green-500 text-green-900'
                  }`}>
                    {isDevnet ? 'DEVNET' : 'MAINNET'}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold">
                  {loading ? '...' : formatSol(balance)}
                </div>
                <div className="text-yellow-200 text-xs mt-1">
                  Updated: {isClient && lastUpdated ? lastUpdated.toLocaleTimeString() : '...'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {isDevnet && connected && (
              <button
                onClick={requestAirdrop}
                disabled={isRequestingAirdrop || (nextAirdropIn !== null && nextAirdropIn > 0)}
                className={`font-bold p-2 transition flex items-center justify-center gap-2 text-xs ${
                  isRequestingAirdrop || (nextAirdropIn !== null && nextAirdropIn > 0)
                    ? 'bg-gray-500 text-gray-200 cursor-not-allowed'
                    : 'bg-yellow-500 text-yellow-900 hover:bg-yellow-400'
                }`}
                title={nextAirdropIn !== null && nextAirdropIn > 0 ? `Next airdrop available in ${formatTimeRemaining(nextAirdropIn)}` : ''}
              >
                {isRequestingAirdrop ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Requesting...
                  </>
                ) : nextAirdropIn !== null && nextAirdropIn > 0 ? (
                  <>
                    <ArrowDownLeft className="h-4 w-4" />
                    NEXT IN {formatTimeRemaining(nextAirdropIn).split(':')[0]}:{formatTimeRemaining(nextAirdropIn).split(':')[1]}
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="h-4 w-4" />
                    GET DEV SOL
                  </>
                )}
              </button>
            )}

            <button
              onClick={onAddMoney}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex  items-center justify-center gap-4 "
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="text-xs font-medium">TRANSFER</span>
            </button>

            {/* <button
              onClick={handleSendSOL}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex  items-center justify-center gap-4 "
            >
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs font-medium">WITHDRAW (Not Available In Demo)</span>
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserWallet;