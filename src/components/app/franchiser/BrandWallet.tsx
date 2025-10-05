"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Copy, Wallet, ArrowUpDown, CreditCard, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useSolPrice } from '@/lib/coingecko';

interface BrandWalletProps {
  franchiserId?: Id<"franchiser">;
  business?: {
    name?: string;
    logoUrl?: string;
  };
  className?: string;
}

// Solana connection for fetching real balance
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const FALLBACK_RPC_URLS = [
  'https://api.devnet.solana.com',
  'https://devnet.helius-rpc.com/?api-key=',
  'https://rpc.ankr.com/solana_devnet',
];
// SOL to USD rate will be fetched from CoinGecko API

const BrandWallet: React.FC<BrandWalletProps> = ({
  franchiserId,
  business = {
    name: 'Citymilana',
    logoUrl: '/logo/logo-2.svg'
  },
  className = '',
}) => {
  // State for wallet data
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [connection] = useState<Connection>(new Connection(SOLANA_RPC_URL));
  
  // Get SOL to USD price from CoinGecko
  const { price: solToUsdPrice, loading: priceLoading, error: priceError } = useSolPrice();

  // Get brand wallet balance from database
  const brandWalletBalance = useQuery(
    api.brandWallet.getBrandWalletBalance,
    franchiserId ? { franchiserId } : "skip"
  );

  
  // Fetch real balance from Solana network
  const fetchBalance = useCallback(async (address: string) => {
    // Check if address is a valid Solana public key
    if (!address || address.startsWith('brand_') || address.length < 32) {
      // This is a brand identifier, not a real Solana address
      setBalance(0);
      return;
    }
    
    try {
      const publicKey = new PublicKey(address);
      
      // Try primary RPC first
      try {
        const balanceInLamports = await connection.getBalance(publicKey);
        const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
        setBalance(balanceInSol);
        return;
      } catch (error) {
        console.warn('Primary RPC failed:', error);
        
        // Try fallback RPCs
        for (const rpcUrl of FALLBACK_RPC_URLS) {
          try {
            console.log(`Trying fallback RPC: ${rpcUrl}`);
            const fallbackConnection = new Connection(rpcUrl);
            const balanceInLamports = await fallbackConnection.getBalance(publicKey);
            const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
            setBalance(balanceInSol);
            console.log(`Successfully fetched balance using fallback RPC: ${rpcUrl}`);
            return;
          } catch (fallbackError) {
            console.warn(`Fallback RPC ${rpcUrl} also failed:`, fallbackError);
          }
        }
        
        // All RPCs failed, use demo balance
        console.error('All RPC endpoints failed, using demo balance');
        console.warn('Wallet address:', address);
        console.warn('Primary RPC URL:', SOLANA_RPC_URL);
        
        if (error instanceof Error && error.message.includes('403')) {
          console.warn('RPC access forbidden - this might be a mainnet address on devnet or RPC restrictions');
        } else if (error instanceof Error && error.message.includes('Invalid public key')) {
          console.warn('Invalid public key format');
          setBalance(0);
          return;
        }
        
        setBalance(0); // Demo balance
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
    }
  }, [connection]);

  // Fetch franchiser data if franchiserId is provided
  const franchiserData = useQuery(
    api.franchises.getFranchiserById,
    franchiserId ? { id: franchiserId } : "skip"
  );

  // Fetch wallet information
  const walletData = useQuery(
    api.brandWallet.getFranchiserWallet,
    franchiserId ? { franchiserId } : "skip"
  );

  // Debug logging
  useEffect(() => {
    console.log('BrandWallet Debug:', {
      franchiserId,
      franchiserData,
      walletData,
      ownerUserId: walletData?.ownerUserId || franchiserData?.ownerUserId,
      brandWalletAddress: walletData?.brandWalletAddress || franchiserData?.brandWalletAddress,
      hasBrandWalletAddress: !!(walletData?.brandWalletAddress || franchiserData?.brandWalletAddress)
    });
  }, [franchiserId, franchiserData, walletData]);

  // Update business info from franchiser data if available
  useEffect(() => {
    if (franchiserData) {
      // Update business info with actual franchiser data
      // This would typically come from the franchiser record
    }
  }, [franchiserData]);

  // Update wallet info from database and fetch real balance
  useEffect(() => {
    // Use the brand wallet address for balance fetching
    const address = walletData?.brandWalletAddress || franchiserData?.brandWalletAddress;
    
    if (address) {
      setWalletAddress(address);
      setLoading(true);
      // Fetch real balance from Solana network
      fetchBalance(address).finally(() => setLoading(false));
    }
  }, [walletData, franchiserData, fetchBalance]);

  const formatSol = (value: number) => {
    return value.toFixed(2) + ' SOL';
  };

  const formatAmount = (sol: number) => {
    const usdPrice = solToUsdPrice || 150.0; // Fallback price if CoinGecko fails
    return `$${(sol * usdPrice).toFixed(2)} USD`;
  };

  const formatUsdAmount = (usd: number) => {
    return `$${usd.toFixed(2)} USD`;
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Wallet address copied to clipboard!');
  };

  const handleRefresh = async () => {
    if (!walletAddress) {
      toast.error('No wallet address available');
      return;
    }
    
    setLoading(true);
    try {
      await fetchBalance(walletAddress);
      toast.success('Balance refreshed!');
    } catch {
      toast.error('Failed to refresh balance');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = () => {
    toast.info('Transfer functionality coming soon!');
  };

  const handleWithdraw = () => {
    toast.info('Withdraw functionality coming soon!');
  };

  return (
    <div className={className}>
      {/* Brand Header */}
      <div className="p-3 sm:p-4 bg-white dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Brand Logo */}
            <div className="w-10 h-10 overflow-hidden bg-white/20 flex items-center justify-center">
              {business?.logoUrl ? (
                <Image
                  src={business.logoUrl}
                  alt="Brand Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
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
                <p className="text-sm font-mono text-gray-600 dark:text-gray-300">
                  {walletAddress ? 
                    (walletAddress.length > 20 ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : walletAddress) :
                    'No wallet address'
                  }
                </p>
                {walletAddress && (
                  <button
                    onClick={copyWalletAddress}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Wallet Connection Status */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="default"
              className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
            >
              <Wallet className="h-3 w-3 mr-1" />
              {walletData?.hasSecretKey ? 'Brand Wallet' : 'System Wallet'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-white overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Balance Display */}
          <div>
            <div className="grid grid-cols-2 gap-4">
              {/* USD Balance */}
              <div>
                <div className="text-yellow-100 text-xs mb-1">
                  USD Balance
                </div>
                <div className="text-2xl sm:text-3xl font-bold">
                  {loading || priceLoading ? '...' : (
                    brandWalletBalance?.balance ? 
                      formatUsdAmount(brandWalletBalance.balance) : 
                      formatAmount(balance)
                  )}
                </div>
                <div className="text-yellow-200 text-xs mt-1">
                  {priceError ? 'Price unavailable' : `$${(solToUsdPrice || 150.0).toFixed(2)} USD/SOL`}
                  {/* {(brandWalletBalance?.balance || 0) > 0 ? (
                    <span className="block text-yellow-300 font-semibold">
                      (From Franchise Funding)
                    </span>
                  ) : isDemoBalance && (
                    <span className="block text-yellow-300 font-semibold">
                      (Demo - RPC Access Restricted)
                    </span>
                  )} */}
                </div>
              </div>
              {/* SOL Balance */}
              <div className="text-right">
                <div className="text-yellow-100 text-xs mb-1">SOL Balance</div>
                <div className="text-2xl sm:text-3xl font-bold">
                  {loading ? '...' : formatSol((brandWalletBalance?.balance || 0) / (solToUsdPrice || 150.0))}
                </div>
                <div className="text-yellow-200 text-xs mt-1">
                  Updated: {new Date().toLocaleTimeString()}
                  {/* {(brandWalletBalance?.balance || 0) > 0 && (
                    <span className="block text-yellow-300 font-semibold">
                      (From Franchise Funding)
                    </span>
                  )} */}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <button
              onClick={handleRefresh}
              disabled={loading || !walletAddress}
              className="bg-white/20 border border-white/30 p-3 hover:bg-white/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-xs font-medium">REFRESH</span>
            </button>

            <button
              onClick={handleTransfer}
              disabled={!walletAddress}
              className="bg-white/20 border border-white/30 p-3 hover:bg-white/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="text-xs font-medium">TRANSFER</span>
            </button>

            <button
              onClick={handleWithdraw}
              disabled={!walletAddress}
              className="bg-white/20 border border-white/30 p-3 hover:bg-white/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-medium">WITHDRAW</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default BrandWallet;