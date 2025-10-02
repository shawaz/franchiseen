"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowUpDown, Copy, MoveDownLeft, MoveUpRight } from 'lucide-react';
import { toast } from 'sonner';
import { useFranchiseWallet } from '@/hooks/useFranchiseWallet';
import { getStoredWallet } from '@/lib/solanaWalletUtils';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConvexImageUrl } from '@/hooks/useConvexImageUrl';

interface WalletProps {
  onAddMoney?: () => void;
  className?: string;
  business?: {
    name?: string;
    logoUrl?: string;
  };
  franchiseId?: string;
}

// Demo data
const DEMO_RATE = 150.50; // SOL to USD rate

const FranchiseWallet: React.FC<WalletProps> = ({
  onAddMoney,
  className = '',
  business = {
    name: 'Loading...',
    logoUrl: '/avatar/avatar-m-5.png'
  },
  franchiseId,
}) => {
  const [walletAddress, setWalletAddress] = useState<string>('HjZ5j...8Xy9z');
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [franchiseInfo, setFranchiseInfo] = useState(business);

  // Load franchise data from Convex
  const franchiseData = useQuery(
    api.franchiseManagement.getFranchiseBySlug,
    franchiseId ? { franchiseSlug: franchiseId } : "skip"
  );

  // Get proper image URL using Convex hook
  const logoUrl = useConvexImageUrl(franchiseData?.franchiser?.logoUrl);

  // Use franchise wallet hook if franchiseId is provided
  const { wallet, refreshBalance, requestAirdropToWallet } = useFranchiseWallet({
    franchiseId,
    useDeterministic: true
  });

  // Update franchise info when data loads
  useEffect(() => {
    if (franchiseData) {
      setFranchiseInfo({
        name: franchiseData.franchiseSlug || "Unknown Franchise",
        logoUrl: logoUrl || "/avatar/avatar-m-5.png"
      });
    }
  }, [franchiseData, logoUrl]);

  // Update local state when wallet data changes
  useEffect(() => {
    if (wallet) {
      setWalletAddress(wallet.publicKey);
      setBalance(wallet.balance);
      setLoading(wallet.isLoading);
    } else if (franchiseId) {
      // Try to get stored wallet
      const storedWallet = getStoredWallet(franchiseId);
      if (storedWallet) {
        setWalletAddress(storedWallet.publicKey);
        // Fetch balance for stored wallet
        refreshBalance();
      }
    }
  }, [wallet, franchiseId, refreshBalance]);
  
  const formatSol = (value: number) => {
    return value.toFixed(2) + ' SOL';
  };

  const formatAmount = (sol: number) => {
    return `$${(sol * DEMO_RATE).toFixed(2)}`;
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Wallet address copied to clipboard!');
  };

  const handleSendSOL = () => {
    toast.info('This is a demo. Send SOL functionality is disabled.');
  };

  const handleRefresh = () => {
    if (franchiseId) {
      refreshBalance();
    } else {
      toast.success('Balance refreshed!');
    }
  };

  const handleAirdrop = () => {
    if (franchiseId) {
      requestAirdropToWallet(1);
    } else {
      toast.info('Airdrop only available for franchise wallets');
    }
  };

  // Debug function to check wallet status
  const debugWallet = () => {
    console.log('Debug wallet info:', {
      franchiseId,
      wallet,
      walletAddress,
      balance,
      loading
    });
    toast.info('Check console for wallet debug info');
  };

  return (
    <div>
      {/* Brand Header */}
      <div className="p-3 sm:p-4 bg-white dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700">
        <div className="flex items-center gap-3">
          {/* Brand Logo */}
          <div className="w-10 h-10 rounded overflow-hidden bg-white/20 flex items-center justify-center">
            {franchiseInfo?.logoUrl ? (
              <Image
                src={franchiseInfo.logoUrl}
                alt="Brand Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
            ) : (
              <div className="text-gray-700 dark:text-white font-semibold text-sm">
                {franchiseInfo?.name?.charAt(0) || 'B'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-md text-gray-900 dark:text-white">
              {franchiseInfo?.name || 'Demo Brand'}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono text-gray-600 dark:text-gray-300">
                {walletAddress.length > 20 ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : walletAddress}
              </p>
              <button
                onClick={copyWalletAddress}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className={`bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 text-white overflow-hidden ${className}`}>
        <div className="p-4 sm:p-6">
          {/* Balance Display */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              {/* SOL Balance */}
              <div>
                <div className="text-yellow-100 text-xs mb-1">SOL Balance</div>
                <div className="text-2xl sm:text-3xl font-bold">
                  {loading ? '...' : formatSol(balance)}
                </div>
                <div className="text-yellow-200 text-xs mt-1">
                  Updated: {new Date().toLocaleTimeString()}
                </div>
              </div>

              {/* USD Balance */}
              <div className="text-right">
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
            </div>
          </div>

          {/* Action Buttons */}
          {/* <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleRefresh}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex items-center justify-center gap-1 "
              disabled={loading}
            >
              <MoveDownLeft className="h-4 w-4" />
              <span className="text-xs font-medium">REFRESH</span>
            </button>

            <button
              onClick={franchiseId ? handleAirdrop : onAddMoney}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex  items-center justify-center gap-1 "
              disabled={loading}
            >
              <MoveUpRight className="h-4 w-4" />
              <span className="text-xs font-medium">{franchiseId ? 'AIRDROP' : 'EXPENSE'}</span>
            </button>

            <button
              onClick={handleSendSOL}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex  items-center justify-center gap-1 "
              disabled={loading}
            >
              <ArrowUpDown className="h-4 w-4" />
              <span className="text-xs font-medium">TRANSFER</span>
            </button>

            <button
              onClick={debugWallet}
              className="bg-white/20 border border-white/30 p-2 hover:bg-white/30 transition flex  items-center justify-center gap-1 "
            >
              <span className="text-xs font-medium">DEBUG</span>
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default FranchiseWallet;
