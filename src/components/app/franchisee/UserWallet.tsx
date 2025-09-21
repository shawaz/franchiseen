"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { CreditCard, Wallet as WalletIcon, ArrowUpDown, PlusCircle, Copy, ArrowUpRight, ArrowDownRight, ArrowDownLeft, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletUi, useWalletUiWallet } from '@wallet-ui/react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl, Commitment } from '@solana/web3.js';
import { Button } from '../../ui/button';

interface WalletProps {
  onAddMoney?: () => void;
  className?: string;
  business?: {
    name?: string;
    logoUrl?: string;
  };
}

// Demo data
const DEMO_BALANCE = 12.75;
const DEMO_WALLET = 'HjZ5j...8Xy9z';
const DEMO_RATE = 150.50; // SOL to AED rate

const Wallet: React.FC<WalletProps> = ({
  onAddMoney,
  className = '',
  business = {
    name: 'Shawaz Sharif',
    logoUrl: '/avatar/avatar-m-5.png'
  },
}) => {
  const { account, connected } = useWalletUi();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDevnet, setIsDevnet] = useState<boolean>(false);
  const [selectedCurrency] = useState<string>('aed');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState<boolean>(false);

  // Check if we're on devnet
  useEffect(() => {
    // This is a simple check - you might want to make this more robust
    const checkNetwork = async () => {
      if (connected && account?.address) {
        try {
          const connection = new Connection(clusterApiUrl('devnet'));
          await connection.getBalance(new PublicKey(account.address));
          setIsDevnet(true);
        } catch (e) {
          setIsDevnet(false);
        }
      }
    };
    
    checkNetwork();
  }, [connected, account?.address]);

  // List of reliable RPC endpoints to try
  const MAINNET_RPC_ENDPOINTS = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://solana-api.syndica.io/access-token/YOUR_SYNDICA_TOKEN_HERE/rpc',
    'https://solana-mainnet.rpc.extrnode.com',
  ];

  // Create a connection with retry logic
  const createConnection = async (endpoint: string, retries = 3, delay = 1000): Promise<number> => {
    try {
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
      } as Commitment);
      
      const publicKey = new PublicKey(account!.address);
      const balanceInLamports = await connection.getBalance(publicKey);
      return balanceInLamports / LAMPORTS_PER_SOL;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Failed to fetch balance from ${endpoint}, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return createConnection(endpoint, retries - 1, delay * 2);
      }
      throw error;
    }
  };

  // Fetch SOL balance when account changes
  const fetchBalance = async () => {
    if (!connected || !account?.address) {
      setBalance(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let balance = 0;
      let lastError: Error | null = null;

      // Try each endpoint until one succeeds
      for (const endpoint of isDevnet ? [clusterApiUrl('devnet')] : MAINNET_RPC_ENDPOINTS) {
        try {
          balance = await createConnection(endpoint);
          setBalance(balance);
          setLastUpdated(new Date());
          return; // Success, exit the function
        } catch (error) {
          console.warn(`Failed to fetch balance from ${endpoint}:`, error);
          lastError = error as Error;
        }
      }

      // If we get here, all endpoints failed
      throw lastError || new Error('All RPC endpoints failed');
    } catch (error) {
      console.error('Error fetching balance from all endpoints:', error);
      toast.error('Failed to fetch balance. Please try again later.');
      
      // If we have a cached balance, don't show 0
      if (balance > 0) {
        toast.info('Showing cached balance. Some features may be limited.');
      } else {
        setBalance(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    // Set up interval to refresh balance every 30 seconds
    const intervalId = setInterval(fetchBalance, 30000);
    
    return () => clearInterval(intervalId);
  }, [connected, account?.address, isDevnet]);

  const requestAirdrop = async () => {
    if (!connected || !account?.address) return;
    
    try {
      setIsRequestingAirdrop(true);
      const endpoint = isDevnet ? clusterApiUrl('devnet') : MAINNET_RPC_ENDPOINTS[0];
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
      } as Commitment);
      const publicKey = new PublicKey(account.address);
      
      // Request 1 SOL airdrop (in lamports)
      const signature = await connection.requestAirdrop(
        publicKey,
        1 * LAMPORTS_PER_SOL // 1 SOL
      );
      
      // Confirm the transaction
      await connection.confirmTransaction(signature);
      
      // Refresh balance
      await fetchBalance();
      
      toast.success('Successfully received 1 devnet SOL!');
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      toast.error('Failed to request airdrop');
    } finally {
      setIsRequestingAirdrop(false);
    }
  };
  
  const formatSol = (value: number) => {
    return value.toFixed(4) + ' SOL';
  };

  const formatAmount = (sol: number) => {
    return `${(sol * DEMO_RATE).toFixed(2)} AED`;
  };

  const copyWalletAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      toast.success('Wallet address copied to clipboard!');
    }
  };

  const handleSendSOL = () => {
    toast.info('This is a demo. Send SOL functionality is disabled.');
  };

  const handleRefresh = () => {
    toast.success('Balance refreshed!');
  };

  return (
    <div>
      {/* Brand Header */}
      <div className="p-3 flex items-center gap-3 justify-between sm:p-4 bg-white dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700">
        <div className="flex items-center gap-3">
          {/* Brand Logo */}
          <div className="w-10 h-10 rounded overflow-hidden bg-white/20 flex items-center justify-center">
            {business?.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt="Brand Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-700 dark:text-white font-semibold text-sm">
                {business?.name?.charAt(0) || 'B'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-md text-gray-900 dark:text-white">
              {business?.name || 'Demo Brand'}
            </h3>
            <div className="flex items-center gap-2">
                <span className="font-mono text-xs">
                  {`${account?.address.slice(0, 4)}...${account?.address.slice(-4)}`}
                </span>
              <button
                onClick={copyWalletAddress}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Copy className="h-3 w-3" />
              </button>
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
              {/* AED Balance */}
              <div>
                <div className="text-yellow-100 text-xs mb-1">
                  AED Balance
                </div>
                <div className="text-2xl sm:text-3xl font-bold">
                  {loading ? '...' : formatAmount(balance)}
                </div>
                <div className="text-yellow-200 text-xs mt-1">
                  {DEMO_RATE.toFixed(2)} AED/SOL
                </div>
              </div>
              {/* SOL Balance */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-yellow-100 text-xs">SOL Balance</span>
                  {isDevnet && (
                    <span className="bg-yellow-500 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      DEVNET
                    </span>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl font-bold">
                  {loading ? '...' : formatSol(balance)}
                </div>
                <div className="text-yellow-200 text-xs mt-1">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {isDevnet && connected && (
              <button
                onClick={requestAirdrop}
                disabled={isRequestingAirdrop}
                className={`bg-yellow-500 text-yellow-900 font-bold p-2 hover:bg-yellow-400 transition flex items-center justify-center gap-2 text-xs ${isRequestingAirdrop ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isRequestingAirdrop ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Requesting...
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

            <button
              onClick={handleSendSOL}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex  items-center justify-center gap-4 "
            >
              <ArrowUpRight className="h-4 w-4" />
              <span className="text-xs font-medium">WITHDRAW</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;