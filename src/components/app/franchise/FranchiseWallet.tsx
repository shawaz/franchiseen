"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Copy, Wallet, ArrowUpDown, CreditCard, RefreshCw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useSolPrice } from '@/lib/coingecko';
import { getSolanaExplorerUrl, formatWalletAddress } from '@/lib/franchiseWalletUtils';

interface FranchiseWalletProps {
  franchiseId: Id<"franchises">;
  franchiseName?: string;
  franchiseLogo?: string;
  className?: string;
  onBuyTokens?: () => void;
}

// Solana connection for fetching real balance
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const FALLBACK_RPC_URLS = [
  'https://api.devnet.solana.com',
  'https://devnet.helius-rpc.com/?api-key=',
  'https://rpc.ankr.com/solana_devnet',
];

const FranchiseWallet: React.FC<FranchiseWalletProps> = ({
  franchiseId,
  franchiseName = 'Franchise',
  franchiseLogo = '/logo/logo-4.svg',
  className = '',
  onBuyTokens,
}) => {
  // State for wallet data
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [, setIsDemoBalance] = useState<boolean>(false);
  const [connection] = useState<Connection>(new Connection(SOLANA_RPC_URL));
  
  // Get SOL to USD price from CoinGecko
  const { price: solToUsdPrice, loading: priceLoading, error: priceError } = useSolPrice();

  // Get franchise wallet data from database (includes franchise data)
  const franchiseWallet = useQuery(
    api.franchiseManagement.getFranchiseWallet,
    { franchiseId }
  );

  // Mutation to fix invalid addresses (development only)
  const fixInvalidAddresses = useMutation(api.franchiseWallet.fixInvalidFranchiseWalletAddresses);

  // Get franchise token data for token name and symbol
  const franchiseToken = useQuery(
    api.tokenManagement.getFranchiseToken,
    franchiseId ? { franchiseId } : "skip"
  );

  // Get fundraising data for progress calculations
  const fundraisingData = useQuery(
    api.franchiseManagement.getFranchiseFundraisingDataById,
    franchiseId ? { franchiseId } : "skip"
  );


  // Get wallet address from franchise wallet data
  const walletAddress = franchiseWallet?.walletAddress;



  // Fetch real balance from Solana network
  // Helper function to validate Solana address format
  const isValidSolanaAddress = (address: string): boolean => {
    if (!address || typeof address !== 'string') return false;
    
    // Check length (Solana addresses are typically 32-44 characters)
    if (address.length < 32 || address.length > 44) return false;
    
    // Check for base58 characters only
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (!base58Regex.test(address)) return false;
    
    return true;
  };


  const fetchBalance = useCallback(async (address: string) => {
    // Check if address is a valid Solana public key
    if (!address || !isValidSolanaAddress(address)) {
      // This is a mock wallet address or invalid address
      setBalance(0);
      setIsDemoBalance(true);
      return;
    }

    try {
      const publicKey = new PublicKey(address);
      
      // Try primary RPC first
      try {
        const balanceInLamports = await connection.getBalance(publicKey);
        const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
        setBalance(balanceInSol);
        setIsDemoBalance(false);
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
            setIsDemoBalance(false);
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
          setIsDemoBalance(false);
          return;
        }
        
        setBalance(0); // No balance initially
        setIsDemoBalance(true);
      }
    } catch (error) {
      console.error('Error creating PublicKey from address:', error);
      // If PublicKey creation fails, treat as demo balance
      setBalance(0); // Always set to 0 for new franchise wallets
      setIsDemoBalance(true);
    }
  }, [connection]);

  // Update wallet info from database and fetch real balance
  useEffect(() => {
    if (walletAddress) {
      setLoading(true);
      
      // If franchise is in launching/ongoing stage, use database balance
      if (franchiseWallet?.franchise?.stage === 'launching' || franchiseWallet?.franchise?.stage === 'ongoing') {
        // Use database balance for launched franchises
        setBalance(franchiseWallet.balance || 0); // Use actual SOL balance from database
        setIsDemoBalance(false);
        setLoading(false);
      } else {
        // Fetch real balance from Solana network for funding stage
        fetchBalance(walletAddress).finally(() => setLoading(false));
      }
    } else {
      // No wallet address available
      setLoading(false);
      setBalance(0);
      setIsDemoBalance(true);
    }
  }, [walletAddress, fetchBalance, franchiseWallet]);
  
  const formatSol = (value: number) => {
    return value.toFixed(4) + ' SOL';
  };

  const formatAmount = (sol: number) => {
    const usdPrice = solToUsdPrice || 150.0; // Fallback price if CoinGecko fails
    return `$${(sol * usdPrice).toFixed(2)} USD`;
  };

  const formatUsdAmount = (usd: number) => {
    return `$${usd.toFixed(2)} USD`;
  };

  const copyWalletAddress = () => {
    if (walletAddress) {
    navigator.clipboard.writeText(walletAddress);
    toast.success('Wallet address copied to clipboard!');
    }
  };

  // Removed unused functions: handleRefresh, handleTransfer, handleWithdraw

  // Show loading state if wallet data is not available
  if (franchiseWallet === undefined) {
    return (
      <div className={className}>
        {/* Franchise Header */}
        <div className="p-3 sm:p-4 bg-white dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Franchise Logo */}
              <div className="w-10 h-10 overflow-hidden bg-white/20 flex items-center justify-center">
                <Image
                  src={franchiseLogo}
                  alt="Franchise Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-semibold text-md text-gray-900 dark:text-white">
                  {franchiseName}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-gray-600 dark:text-gray-300">
                    Loading wallet...
                  </p>
                </div>
              </div>
            </div>
            
            {/* Wallet Connection Status */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="default"
                className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
              >
                <Wallet className="h-3 w-3 mr-1" />
                Loading
              </Badge>
            </div>
          </div>
        </div>

        {/* Loading Wallet Card */}
        <div className="bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-4">
              {/* USD Balance */}
              <div>
                <div className="text-gray-100 text-xs mb-1">
                  USD Balance
                </div>
                <div className="text-2xl sm:text-3xl font-bold">
                  Loading...
                </div>
                <div className="text-gray-200 text-xs mt-1">
                  Loading wallet data
                </div>
              </div>
              {/* SOL Balance */}
              <div className="text-right">
                <div className="text-gray-100 text-xs mb-1">SOL Balance</div>
                <div className="text-2xl sm:text-3xl font-bold">
                  Loading...
                </div>
                <div className="text-gray-200 text-xs mt-1">
                  Updated: Loading...
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <button
                disabled
                className="bg-white/20 border border-white/30 p-3 transition flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-xs font-medium">REFRESH</span>
              </button>

              <button
                disabled
                className="bg-white/20 border border-white/30 p-3 transition flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span className="text-xs font-medium">TRANSFER</span>
              </button>

              <button
                disabled
                className="bg-white/20 border border-white/30 p-3 transition flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-xs font-medium">WITHDRAW</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show waiting for approval state if no wallet exists
  if (franchiseWallet === null) {
    return (
      <div className={className}>
        {/* Franchise Header */}
        <div className="p-3 sm:p-4 bg-white dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Franchise Logo */}
              <div className="w-10 h-10 overflow-hidden bg-white/20 flex items-center justify-center">
                <Image
                  src={franchiseLogo}
                  alt="Franchise Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-semibold text-md text-gray-900 dark:text-white">
                  {franchiseName}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Waiting for approval
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="default"
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
              >
                <Wallet className="h-3 w-3 mr-1" />
                Pending Approval
              </Badge>
            </div>
          </div>
        </div>

        {/* Waiting for Approval Card */}
        <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="text-center">
              <div className="mb-4">
                <Wallet className="h-12 w-12 mx-auto text-yellow-200" />
              </div>
              <h4 className="text-lg font-semibold mb-2">Waiting for Approval</h4>
              <p className="text-yellow-100 text-sm mb-4">
                Your franchise application is under review. Once approved, the wallet and token trading will be activated.
              </p>
              <div className="text-xs text-yellow-200 mb-4">
                Approval typically takes 1-3 business days.
              </div>
              
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine current stage from wallet data
  const currentStage = franchiseWallet?.franchise?.stage || 'funding';
  // const franchiseStatus = 'approved'; // If wallet exists, franchise is approved

  // Calculate funding progress
  const totalInvestment = fundraisingData?.totalInvestment || 0;
  const totalInvested = fundraisingData?.totalInvested || 0;
  const fundingProgress = totalInvestment > 0 ? (totalInvested / totalInvestment) * 100 : 0;

  // Calculate days remaining (30 days from franchise creation)
  // Note: We'll need to get createdAt from the franchise data
  // For now, let's use a default calculation
  const franchiseCreatedAt = Date.now() - (15 * 24 * 60 * 60 * 1000); // Assume 15 days ago for demo
  const daysSinceCreation = Math.floor((Date.now() - franchiseCreatedAt) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 30 - daysSinceCreation);

  // Determine card color based on stage
  const getCardColor = () => {
    switch (currentStage) {
      case 'funding': return 'from-blue-600 via-blue-700 to-blue-800';
      case 'launching': return 'from-purple-600 via-purple-700 to-purple-800';
      case 'ongoing': return 'from-green-600 via-green-700 to-green-800';
      case 'closed': return 'from-red-600 via-red-700 to-red-800';
      default: return 'from-blue-600 via-blue-700 to-blue-800';
    }
  };

  // Get stage-specific content
  const getStageContent = () => {
    switch (currentStage) {
      case 'funding':
        return {
          title: 'Funding Phase',
          subtitle: `${daysRemaining} days remaining`,
          progress: fundingProgress,
          goal: `$${totalInvestment.toLocaleString()}`,
          raised: `$${totalInvested.toLocaleString()}`,
          showBuyShares: true
        };
      case 'launching':
        return {
          title: 'Launching Phase',
          subtitle: 'Setup in Progress',
          startDate: new Date(franchiseCreatedAt + (30 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
          endDate: new Date(franchiseCreatedAt + (75 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
          showBuyShares: false
        };
      case 'ongoing':
        const workingCapital = (franchiseWallet as { workingCapital?: number } | null)?.workingCapital || 0;
        const currentBalance = franchiseWallet?.usdBalance || 0;
        const usedAmount = workingCapital - currentBalance;
        return {
          title: 'Operational Phase',
          subtitle: 'Franchise is Live',
          totalBudget: `$${workingCapital.toLocaleString()}`,
          remainingBudget: `$${currentBalance.toLocaleString()}`,
          usedAmount: `$${usedAmount.toLocaleString()}`,
          remainingPercentage: workingCapital > 0 ? (currentBalance / workingCapital) * 100 : 0,
          showBuyShares: false
        };
      case 'closed':
        return {
          title: 'Closed',
          subtitle: 'Franchise operations ended',
          showBuyShares: false
        };
      default:
        return {
          title: 'Funding Phase',
          subtitle: 'Active',
          showBuyShares: true
        };
    }
  };

  const stageContent = getStageContent();

  return (
    <div className={className}>
      {/* Franchise Header */}
      <div className="p-3 sm:p-4 bg-white dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            {/* Franchise Logo */}
            <div className="w-10 h-10 overflow-hidden bg-white/20 flex items-center justify-center">
              <Image
                src={franchiseLogo}
                alt="Franchise Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized
              />
          </div>
          <div>
            <h3 className="font-semibold text-md text-gray-900 dark:text-white">
                {franchiseToken?.tokenSymbol || franchiseWallet.walletName || franchiseName}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono text-gray-600 dark:text-gray-300">
                  {walletAddress ? formatWalletAddress(walletAddress) : 'No wallet address'}
              </p>
                {walletAddress && (
                  <>
              <button
                onClick={copyWalletAddress}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Copy className="h-3 w-3" />
              </button>
                    <button
                      onClick={() => window.open(getSolanaExplorerUrl(walletAddress), '_blank')}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side - Buy Tokens button for funding stage */}
          <div className="flex items-center gap-2">
            {stageContent.showBuyShares && (
              <button
                onClick={() => {
                  if (onBuyTokens) {
                    onBuyTokens();
                  } else {
                    toast.info('Buy tokens functionality will be implemented');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Buy Tokens
              </button>
            )}
            
            {/* Development only: Fix invalid addresses button */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={async () => {
                  try {
                    const result = await fixInvalidAddresses();
                    toast.success(`Fixed ${result.results.filter((r: { status: string }) => r.status === 'fixed').length} addresses`);
                    console.log('Fix results:', result);
                  } catch (error) {
                    toast.error('Failed to fix addresses');
                    console.error('Fix error:', error);
                  }
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs font-medium transition"
                title="Fix invalid wallet addresses (dev only)"
              >
                Fix Addr
              </button>
            )}
            
            <Badge 
              variant="default"
              className={`${
                franchiseWallet.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : franchiseWallet.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    : franchiseWallet.status === 'suspended'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}
            >
              <Wallet className="h-3 w-3 mr-1" />
              {currentStage}
            </Badge>
          </div>
        </div>
      </div>

      {/* Wallet Card */}
      <div className={`bg-gradient-to-br ${getCardColor()} text-white overflow-hidden`}>
        <div className="p-4 sm:p-6">
          {/* Balance Display */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* USD Balance */}
            <div>
              <div className="text-white/80 text-xs mb-1">
                USD Balance
              </div>
              <div className="text-2xl sm:text-3xl font-bold">
                {loading || priceLoading ? '...' : (
                  franchiseWallet.usdBalance > 0 ? 
                    formatUsdAmount(franchiseWallet.usdBalance) : 
                    formatAmount(balance)
                )}
              </div>
              <div className="text-white/70 text-xs mt-1">
                {priceError ? 'Price unavailable' : `$${(solToUsdPrice || 150.0).toFixed(2)} USD/SOL`}
              </div>
            </div>
              {/* SOL Balance */}
            <div className="text-right">
              <div className="text-white/80 text-xs mb-1">SOL Balance</div>
                <div className="text-2xl sm:text-3xl font-bold">
                {loading ? '...' : formatSol(franchiseWallet.balance || balance)}
              </div>
              <div className="text-white/70 text-xs mt-1">
                Updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Stage-specific content */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold">{stageContent.title}</h4>
              <span className="text-sm text-white/80">{stageContent.subtitle}</span>
            </div>

            {/* Progress Bars for All Stages */}
            {currentStage === 'funding' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Funding Progress</span>
                  <span>{fundingProgress.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Raised: {stageContent.raised}</span>
                  <span>Goal: {stageContent.goal}</span>
                </div>
              </div>
            )}

            {/* Launching Progress Bar */}
            {currentStage === 'launching' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Launch Timeline</span>
                  <span>Setup Phase</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: '100%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Start: {stageContent.startDate}</span>
                  <span>End: {stageContent.endDate}</span>
                </div>
              </div>
            )}

            {/* Ongoing Progress Bar */}
            {currentStage === 'ongoing' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget Utilization</span>
                  <span>{stageContent.remainingPercentage?.toFixed(1) || '0.0'}% Remaining</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${100 - (stageContent.remainingPercentage || 0)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Used: {stageContent.usedAmount}</span>
                  <span>Remaining: {stageContent.remainingBudget}</span>
                </div>
              </div>
            )}

            {/* Closed Progress Bar */}
            {currentStage === 'closed' && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Project Completion</span>
                  <span>100%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: '100%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Project Completed</span>
                  <span>Operations Ended</span>
                </div>
              </div>
            )}

            {/* Launching Phase - Start/End Dates */}
            {currentStage === 'launching' && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white/80 text-xs">Start Date</div>
                  <div className="text-white font-semibold">{stageContent.startDate}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white/80 text-xs">End Date</div>
                  <div className="text-white font-semibold">{stageContent.endDate}</div>
                </div>
              </div>
            )}

            {/* Ongoing Phase - Budget Info */}
            {currentStage === 'ongoing' && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white/80 text-xs">Total Budget</div>
                  <div className="text-white font-semibold">{stageContent.totalBudget}</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white/80 text-xs">Remaining</div>
                  <div className="text-white font-semibold">
                    {stageContent.remainingBudget} ({stageContent.remainingPercentage?.toFixed(1) || '0.0'}%)
                  </div>
                </div>
              </div>
            )}

            {/* Closed Phase */}
            {currentStage === 'closed' && (
              <div className="text-center py-4">
                <div className="text-white/80 text-sm">
                  Franchise operations have ended
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FranchiseWallet;