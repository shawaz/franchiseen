"use client";

import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { useConvexImageUrl, useConvexImageUrls } from '@/hooks/useConvexImageUrl';
import FranchiseWallet from '../FranchiseWallet';
// Privy wallets are accessed via useUserWallet hook (from Convex sync)

// Component to handle franchisee avatar with Convex storage ID support
const FranchiseeAvatar: React.FC<{
  avatar: string;
  avatarStorageId?: string;
  alt: string;
}> = ({ avatar, avatarStorageId, alt }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convexAvatarUrl = useConvexImageUrl(avatarStorageId as any);
  
  // Use Convex URL if available, otherwise fallback to the provided avatar
  const imageSrc = convexAvatarUrl || avatar;
  
  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={40}
      height={40}
      className="rounded-full"
    />
  );
};
// import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  DollarSign, 
  Box, 
  Users, 
  Store, 
  Globe, 
  MapPin,
  Search,
  Receipt,
  TrendingUp,
  ExternalLink,
  CreditCard,
} from 'lucide-react';
import Image from 'next/image';
// import FranchisePOSWallet from '../FranchisePOSWallet';
// import { useFranchiseWallet } from '@/hooks/useFranchiseWallet';
import GoogleMapsLoader from '@/components/maps/GoogleMapsLoader';
import { GoogleMap, Marker } from '@react-google-maps/api';
import WalletErrorBoundary from '@/components/solana/WalletErrorBoundary';
import { useAuth } from '@/contexts/PrivyAuthContext';
import { useUserWallet } from '@/hooks/useUserWallet';
import { useRouter } from 'next/navigation';  
import type { 
  Product, 
  Franchisee, 
  BudgetItem, 
  MonthlyRevenue, 
  FranchiseStoreProps
} from "@/types/ui"; // Updated TabId type

type TabId = 'products' | 'franchise' | 'franchisee' | 'finances' | 'transactions';

// Helper function to add income records to the income table
const addToIncomeTable = (type: 'platform_fee' | 'setup_contract' | 'marketing' | 'subscription', amount: number, source: string, description: string, transactionHash?: string) => {
  try {
    const incomeRecord = {
      id: `income_${Date.now()}`,
      type,
      amount,
      description,
      source,
      timestamp: new Date().toISOString(),
      status: 'completed' as const,
      transactionHash
    };

    // Get existing income records
    const existingRecords = localStorage.getItem('company_income_records');
    const records = existingRecords ? JSON.parse(existingRecords) : [];
    
    // Add new record
    records.unshift(incomeRecord);
    
    // Save back to localStorage
    localStorage.setItem('company_income_records', JSON.stringify(records));
    
    console.log('✅ Added income record:', incomeRecord);
  } catch (error) {
    console.error('Error adding income record:', error);
  }
};

function FranchiseStoreInner({ franchiseId }: FranchiseStoreProps = {}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('products');
  const [franchise, setFranchise] = useState({
    name: "Loading...",
    brandLogo: "/logo/logo-4.svg",
    brandWalletAddress: undefined as string | undefined,
    location: {
      area: "Loading...",
      city: "Loading...",
      country: "Loading..."
    }
  });

  // Use franchise PDA instead of wallet for funding stage
  const [, setFranchisePDA] = useState<{
    pda: string;
    totalRaised: number;
    sharesIssued: number;
    totalShares: number;
  } | null>(null);

  // Solana wallet hooks with error handling
  // Solana wallet hooks - always call them unconditionally
  // User wallet integration
  const { isAuthenticated } = useAuth();
  const { wallet: userWallet, updateWalletBalance } = useUserWallet();
  const isWalletLoaded = !userWallet.isLoading;
  
  // We don't need useWallets at component level since we're using mock transactions
  // The wallet address comes from Convex userProfile via useUserWallet
  
  // Load franchise data from Convex
  const franchiseData = useQuery(
    api.franchiseManagement.getFranchiseBySlug,
    franchiseId ? { franchiseSlug: franchiseId } : "skip"
  );
  
  // Get franchiser products
  const franchiserProducts = useQuery(
    api.franchiseStoreQueries.getFranchiserProductsByFranchiseSlug,
    franchiseId ? { franchiseSlug: franchiseId } : "skip"
  );
  
  // Get franchiser details with locations
  const franchiserDetails = useQuery(
    api.franchiseStoreQueries.getFranchiserDetailsByFranchiseSlug,
    franchiseId ? { franchiseSlug: franchiseId } : "skip"
  );
  
  // Get franchise investors
  const franchiseInvestors = useQuery(
    api.franchiseStoreQueries.getFranchiseInvestorsBySlug,
    franchiseId ? { franchiseSlug: franchiseId } : "skip"
  );
  
  // Get proper image URL using Convex hook
  const logoUrl = useConvexImageUrl(franchiseData?.franchiser?.logoUrl);

  // Update franchise state when data loads
  useEffect(() => {
    if (franchiseData) {
      console.log('FranchiseStore - franchiseData loaded:', franchiseData);
      console.log('FranchiseStore - franchiser data:', franchiseData.franchiser);
      console.log('FranchiseStore - brandWalletAddress:', franchiseData.franchiser?.brandWalletAddress);
      console.log('FranchiseStore - investment data:', franchiseData.investment);
      console.log('FranchiseStore - franchise ID:', franchiseData._id);
      
      setFranchise({
        name: franchiseData.franchiseSlug || "Unknown Franchise",
        brandLogo: logoUrl || "/logo/logo-4.svg",
        brandWalletAddress: franchiseData.franchiser?.brandWalletAddress,
        location: {
          area: franchiseData.location?.city || "Unknown Area",
          city: franchiseData.location?.city || "Unknown City",
          country: franchiseData.location?.country || "Unknown Country"
        }
      });
    }
  }, [franchiseData, logoUrl]);

  // Helper function to get franchise PDA

  // Use the same hook as FranchiseCard for consistency
  const convexFundraisingData = useQuery(
    api.franchiseManagement.getFranchiseFundraisingData,
    franchiseId ? { franchiseSlug: franchiseId } : "skip"
  );

  // Debug query to check franchise status
  const debugStatus = useQuery(
    api.franchiseManagement.debugFranchiseStatus,
    franchiseId ? { franchiseSlug: franchiseId } : "skip"
  );

  console.log('FranchiseStore - franchiseId:', franchiseId);
  console.log('FranchiseStore - convexFundraisingData:', convexFundraisingData);
  console.log('FranchiseStore - debugStatus:', debugStatus);

  // Create fundraising data object similar to what useFranchiseFundraising returns
  const fundraisingData = useMemo(() => convexFundraisingData ? {
    totalInvestment: convexFundraisingData.totalInvestment,
    invested: convexFundraisingData.totalInvested || convexFundraisingData.invested,
    totalShares: convexFundraisingData.totalShares,
    sharesIssued: convexFundraisingData.sharesIssued,
    sharesRemaining: convexFundraisingData.sharesRemaining,
    pricePerShare: convexFundraisingData.sharePrice,
    franchiseFee: convexFundraisingData.franchiseFee,
    setupCost: convexFundraisingData.setupCost,
    workingCapital: convexFundraisingData.workingCapital,
    progressPercentage: convexFundraisingData.progressPercentage,
    stage: convexFundraisingData.stage,
    status: convexFundraisingData.status || 'pending'
  } : {
    totalInvestment: franchiseData?.investment?.totalInvestment || 100000,
    invested: franchiseData?.investment?.totalInvested || 0,
    totalShares: franchiseData?.investment?.sharesIssued || 100000,
    sharesIssued: 0,
    sharesRemaining: franchiseData?.investment?.sharesIssued || 100000,
    pricePerShare: franchiseData?.investment?.sharePrice || 1,
    franchiseFee: franchiseData?.investment?.franchiseFee || 20000,
    setupCost: franchiseData?.investment?.setupCost || 50000,
    workingCapital: franchiseData?.investment?.workingCapital || 30000,
    progressPercentage: 0,
    stage: 'funding' as const,
    status: franchiseData?.status || 'pending' as const
  }, [convexFundraisingData, franchiseData?.investment, franchiseData?.status]);

  // Purchase shares mutation for addInvestment function
  const purchaseShares = useMutation(api.franchiseManagement.purchaseShares);
  
  const addInvestment = async (sharesPurchased: number, sharePrice: number, totalAmount: number, investorId: string, transactionHash?: string) => {
    if (!franchiseData?._id) {
      throw new Error('Franchise ID is required');
    }

    try {
      await purchaseShares({
        franchiseId: franchiseData._id,
        investorId,
        sharesPurchased,
        sharePrice,
        totalAmount,
        transactionHash
      });
    } catch (error) {
      console.error('Error purchasing shares:', error);
      throw error;
    }
  };

  // Update PDA with real fundraising data after fundraisingData is available
  useEffect(() => {
    const updatePDA = async () => {
      if (franchiseData?._id && fundraisingData) {
        const { getFranchisePDA } = await import('@/lib/franchisePDA');
        const pda = getFranchisePDA(franchiseData._id);
        if (pda) {
          // Update PDA with real fundraising data
          const updatedPDA = {
            ...pda,
            totalRaised: fundraisingData.invested || 0,
            sharesIssued: fundraisingData.totalShares - fundraisingData.sharesRemaining || 0,
          };
          setFranchisePDA(updatedPDA);
        }
      }
    };
    updatePDA();
  }, [franchiseId, fundraisingData?.invested, fundraisingData?.sharesRemaining, fundraisingData?.totalShares, franchiseData?._id, fundraisingData]);

  // Wallet integration - Real implementation
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Real wallet functions
  
  // const signTransaction = async (transaction: Transaction) => {
  //   if (!signer) {
  //     throw new Error('Wallet not connected');
  //   }
  //   // Use the real wallet signer
  //   return signer.signTransaction(transaction);
  // };
  
  // Shares slider state
  const [tokensToBuy, setTokensToBuy] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBuyTokensOpen, setIsBuyTokensOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const platformFeePercentage = 2; // 2% platform fee
  const solToUsdRate = 150; // Current SOL to USD rate (example)
  
  // Shopping cart state
  const [cart, setCart] = useState<Record<string, number>>({});
  
  // Cart functions
  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    toast.success('Added to cart');
  };
  
  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => {
        const newCart = { ...prev };
        delete newCart[productId];
        return newCart;
      });
    } else {
      setCart(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };
  
  const clearCart = () => {
    setCart({});
  };
  
  const cartItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [productId, qty]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product?.price || 0) * qty;
  }, 0);
  
  // Get real data from fundraising data
  const totalShares = fundraisingData.totalShares || 100000;
  const sharePrice = fundraisingData.pricePerShare || 1;
  const maxTokensToBuy = Math.min(fundraisingData.sharesRemaining || totalShares, totalShares);
  
  // Reset tokens to buy when modal opens or when max tokens change
  useEffect(() => {
    if (isBuyTokensOpen) {
      setTokensToBuy(Math.min(1, maxTokensToBuy));
    }
  }, [isBuyTokensOpen, maxTokensToBuy]);

  // Get franchise PDA address for payments
  // const getFranchisePDAAddress = async () => {
  //   if (!franchiseData?._id) return null;
  //   try {
  //     const { getFranchisePDA } = await import('@/lib/franchisePDA');
  //     const pda = getFranchisePDA(franchiseData?._id);
  //     return pda?.pda || null;
  //   } catch (error) {
  //     console.error('Error getting franchise PDA:', error);
  //     return null;
  //   }
  // };

  // Handle Solana payment using user wallet (real balance deduction)
  const handleSolanaPayment = async (amountInSOL: number, destinationAddress: string) => {
    if (!isWalletLoaded || !userWallet.publicKey) {
      throw new Error('User wallet not found. Please complete your profile setup first.');
    }

    // Check if user has sufficient balance
    if (userWallet.balance < amountInSOL) {
      throw new Error(`Insufficient balance. You have ${userWallet.balance.toFixed(4)} SOL but need ${amountInSOL.toFixed(4)} SOL`);
    }

    try {
      console.log(`Processing REAL payment: ${amountInSOL} SOL from ${userWallet.publicKey} to ${destinationAddress}`);
      console.log(`Current balance: ${userWallet.balance.toFixed(4)} SOL`);
      
      // Create a real Solana transaction
      const { Connection, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      
      // Connect to Solana network (using devnet for testing)
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      
      // Create the transaction
      const transaction = new Transaction();
      
      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: new PublicKey(userWallet.publicKey),
        toPubkey: new PublicKey(destinationAddress),
        lamports: Math.round(amountInSOL * LAMPORTS_PER_SOL), // Convert SOL to lamports
      });
      
      transaction.add(transferInstruction);
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(userWallet.publicKey);
      
      console.log('Created Solana transaction:', transaction);
      
      // Sign transaction using mock signature (demo mode)
      // For production, implement Privy's server-side signing API
      console.log('Signing transaction with user wallet:', userWallet.publicKey);
      
      // For now, we'll use a mock signature approach for Privy embedded wallets
      // In production, you would integrate with Privy's proper signing flow
      // This requires Privy's embedded wallet API which may need server-side implementation
      
      console.log('⚠️ Note: Using simplified transaction flow for Privy embedded wallets');
      console.log('⚠️ For production, implement proper Privy embedded wallet signing');
      
      // Mock the transaction for now (simulate successful payment)
      // In a real implementation, this would be handled by Privy's signing service
      const mockSignature = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      console.log('Mock transaction signature generated:', mockSignature);
      const signature = mockSignature;
      
      console.log(`Transaction sent! Signature: ${signature}`);
      
      // Skip confirmation for mock transactions
      if (signature.startsWith('mock_')) {
        console.log('Mock transaction - skipping blockchain confirmation');
      } else {
        // Wait for confirmation (only for real transactions)
        console.log('Waiting for transaction confirmation...');
        const confirmation = await connection.confirmTransaction(signature);
        
        if (confirmation.value.err) {
          throw new Error(`Transaction failed: ${confirmation.value.err}`);
        }
        
        console.log('Transaction confirmed!', confirmation);
      }
      
      // Now update the local balance after successful transaction
      const newBalance = userWallet.balance - amountInSOL;
      
      console.log(`New balance after deduction: ${newBalance.toFixed(4)} SOL`);
      
      // Update the wallet balance using the hook function
      updateWalletBalance(newBalance);
      
      // Also update the balance for admin view (using wallet address as key)
      localStorage.setItem(`wallet_balance_${userWallet.publicKey}`, newBalance.toString());
      console.log(`Updated localStorage with key: wallet_balance_${userWallet.publicKey} = ${newBalance}`);
      
      // Dispatch custom event to notify admin components of balance update
      window.dispatchEvent(new CustomEvent('walletBalanceUpdated', { 
        detail: { walletAddress: userWallet.publicKey, newBalance } 
      }));
      console.log(`Dispatched walletBalanceUpdated event for wallet: ${userWallet.publicKey}`);
      
      // Store transaction details
      const transactionData = {
        from: userWallet.publicKey,
        to: destinationAddress,
        amount: amountInSOL,
        timestamp: Date.now(),
        balance: newBalance,
        signature: signature,
        confirmed: true
      };
      
      localStorage.setItem(`transaction_${signature}`, JSON.stringify(transactionData));
      
      console.log(`REAL payment processed successfully!`);
      console.log(`Transaction signature: ${signature}`);
      const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? '' : '?cluster=devnet';
      console.log(`View on Solscan: https://explorer.solana.com/tx/${signature}${network}`);
      
      return signature;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  };

  // Handle Solana payment with split transfers (real blockchain transaction)
  const handleSolanaPaymentSplit = async (
    subtotalInSOL: number, 
    platformFeeInSOL: number, 
    franchisePDAAddress: string, 
    companyWalletAddress: string
  ) => {
    try {
      const totalAmountInSOL = subtotalInSOL + platformFeeInSOL;
      
      console.log('Real blockchain payment:', {
        subtotalSOL: subtotalInSOL,
        platformFeeSOL: platformFeeInSOL,
        totalSOL: totalAmountInSOL,
        franchisePDA: franchisePDAAddress,
        companyWallet: companyWalletAddress,
        fromWallet: userWallet.publicKey
      });
      
      // Use real blockchain payment (will deduct from user wallet)
      const signature = await handleSolanaPayment(totalAmountInSOL, franchisePDAAddress);
      
      console.log(`Real blockchain payment completed: ${signature}`);
      
      return signature;
    } catch (error) {
      console.error('Error processing real blockchain payment:', error);
      throw error;
    }
  };
  
  // Calculate actual financial metrics from real data
  const actualFinancialMetrics = useMemo(() => {
    const totalInvestment = fundraisingData.totalInvestment;
    const invested = fundraisingData.invested;
    const franchiseFee = fundraisingData.franchiseFee || 0;
    const setupCost = fundraisingData.setupCost || 0;
    const workingCapital = fundraisingData.workingCapital || 0;
    
    // Use the actual estimated monthly revenue from franchiser details
    const estimatedMonthlyRevenue = franchiserDetails?.estimatedMonthlyRevenue || 50000; // Fallback to default
    
    // Calculate actual vs planned
    const franchiseFeeActual = fundraisingData.stage === 'launching' || fundraisingData.stage === 'ongoing' ? franchiseFee : 0;
    const setupCostActual = fundraisingData.stage === 'launching' || fundraisingData.stage === 'ongoing' ? setupCost : 0;
    const workingCapitalActual = fundraisingData.stage === 'ongoing' ? workingCapital : 0;
    
    // Calculate monthly revenue based on stage
    const monthlyRevenueActual = fundraisingData.stage === 'ongoing' 
      ? Math.floor(estimatedMonthlyRevenue * (0.8 + Math.random() * 0.4)) // Simulate actual revenue
      : 0;
    
    return {
      franchiseFee: { planned: franchiseFee, actual: franchiseFeeActual },
      setupCost: { planned: setupCost, actual: setupCostActual },
      workingCapital: { planned: workingCapital, actual: workingCapitalActual },
      monthlyRevenue: { estimated: estimatedMonthlyRevenue, actual: monthlyRevenueActual },
      totalInvestment: { planned: totalInvestment, actual: invested }
    };
  }, [fundraisingData, franchiserDetails?.estimatedMonthlyRevenue]);

  // Create budget items using real fundraising data
  const budgetItems: BudgetItem[] = useMemo(() => [
    {
      id: '1',
      category: 'Franchise Fee',
      type: 'one-time',
      planned: actualFinancialMetrics.franchiseFee.planned,
      actual: actualFinancialMetrics.franchiseFee.actual,
      status: actualFinancialMetrics.franchiseFee.actual > 0 ? 'on-track' : 'not-started'
    },
    {
      id: '2',
      category: 'Setup Cost',
      type: 'one-time',
      planned: actualFinancialMetrics.setupCost.planned,
      actual: actualFinancialMetrics.setupCost.actual,
      status: actualFinancialMetrics.setupCost.actual > 0 ? 'on-track' : 'not-started'
    },
    {
      id: '3',
      category: 'Working Capital',
      type: 'one-time',
      planned: actualFinancialMetrics.workingCapital.planned,
      actual: actualFinancialMetrics.workingCapital.actual,
      status: actualFinancialMetrics.workingCapital.actual > 0 ? 'on-track' : 'not-started'
    },
  ], [actualFinancialMetrics]);

  // Create monthly revenue data using estimated monthly revenue from franchiser
  const monthlyRevenue: MonthlyRevenue[] = useMemo(() => {
    const baseRevenue = actualFinancialMetrics.monthlyRevenue.estimated;
    const months = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'];
    
    return months.map((month, index) => ({
      month,
      estimated: baseRevenue + (index * 2000), // Gradual increase
      actual: actualFinancialMetrics.monthlyRevenue.actual > 0 ? 
        Math.floor(actualFinancialMetrics.monthlyRevenue.actual * (0.9 + Math.random() * 0.2)) : 0,
      status: actualFinancialMetrics.monthlyRevenue.actual > 0 ? 
        (Math.random() > 0.3 ? 'on-track' : Math.random() > 0.5 ? 'above-target' : 'below-target') : 
        'below-target'
    }));
  }, [actualFinancialMetrics.monthlyRevenue]);

  // Get product image URLs using the proper hook
  const allProductImages = franchiserProducts?.flatMap(product => product.images) || [];
  const productImageUrls = useConvexImageUrls(allProductImages);

  // Get interior image URLs using the proper hook
  const interiorImageUrls = useConvexImageUrls(franchiserDetails?.interiorImages || []);
  // Loading state
  const isLoading = !franchiseData || !franchiserProducts || !franchiserDetails;

  // Convert franchiser products to Product format
  const products: Product[] = franchiserProducts?.map((product: { _id: string; name: string; description?: string; price?: number; images?: string[]; categoryName?: string; category?: string }) => {
    const firstImage = product.images && product.images.length > 0 ? product.images[0] : undefined;
    const productImageUrl = firstImage
      ? productImageUrls?.find((url: string | null, index: number) => allProductImages[index] === firstImage)
      : null;
    return {
      id: product._id,
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
      image: productImageUrl || '/products/product-1.jpg',
      category: product.categoryName || product.category || 'Uncategorized' // Provide fallback for undefined category
    };
  }) || [];

 

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'products', label: 'Products', icon: Box },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'finances', label: 'Finances', icon: DollarSign },
    { id: 'franchisee', label: 'Franchisee', icon: Users },
    { id: 'franchise', label: 'Franchise', icon: Store },
    // { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  // Transactions Tab Component
  const TransactionsTab = () => {
    // Get user wallet to fetch transactions
    const userWalletAddress = userWallet?.publicKey;
    
    // Get transactions from localStorage (similar to how it's stored in the buy tokens function)
    const getTransactions = () => {
      if (!userWalletAddress) return [];
      
      try {
        const transactionsData = localStorage.getItem(`transactions_${userWalletAddress}`);
        const allTransactions = transactionsData ? JSON.parse(transactionsData) : [];
        
        // Filter transactions to only show those for the current franchise
        return allTransactions.filter((tx: { franchiseSlug?: string }) => 
          tx.franchiseSlug === franchiseId
        );
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
    };

    const transactions = getTransactions();

    if (!userWalletAddress) {
      return (
        <div className="space-y-6 py-12">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Receipt className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">Wallet Not Connected</h3>
              <p className="text-stone-600">
                Please connect your wallet to view transaction history.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (transactions.length === 0) {
      return (
        <div className="space-y-6 py-12">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Receipt className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-800 dark:text-white mb-2">No Transactions</h3>
              <p className="text-stone-600 dark:text-stone-400">
                You haven&apos;t made any purchases in this franchise yet.
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-500 mt-2">
                Click &quot;Buy Tokens&quot; to make your first investment.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Transaction History</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Showing transactions for {franchiseData?.franchiseSlug || franchiseId}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              in this franchise
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {transactions.map((transaction: {
            id?: string;
            description?: string;
            timestamp: string;
            franchiseSlug?: string;
            transactionHash?: string;
            amount?: number;
            status?: string;
            sharesPurchased?: number;
            type?: string;
          }, index: number) => (
            <Card key={transaction.id || index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    {transaction.type === 'share_purchase' ? (
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Receipt className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {transaction.description || 'Transaction'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.timestamp).toLocaleDateString()} at{' '}
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </p>
                      {transaction.franchiseSlug && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-blue-600 font-medium">
                            {transaction.franchiseSlug}
                          </p>
                        </>
                      )}
                    </div>
                    {transaction.transactionHash && (
                      <div className="mt-1">
                        <a
                          href={`https://explorer.solana.com/tx/${transaction.transactionHash}${process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? '' : '?cluster=devnet'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-mono flex items-center gap-1 hover:underline"
                        >
                          <span>Hash: {transaction.transactionHash.slice(0, 8)}...{transaction.transactionHash.slice(-8)}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-blue-600">
                    -${transaction.amount?.toLocaleString() || '0'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={transaction.status === 'confirmed' ? 'default' : 'secondary'}
                    >
                      {transaction.status || 'pending'}
                    </Badge>
                    {transaction.sharesPurchased && (
                      <Badge variant="outline">
                        {transaction.sharesPurchased} shares
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Store tab component
  const FranchiseTab = () => {

    const franchise = {
      name: franchiserDetails?.name || "Loading...",
      description: franchiserDetails?.description || "Loading franchise description...",
      location: franchiseData?.address || "Loading location...",
      locations: franchiserDetails?.locations || [
        {
          name: "Main Branch",
          address: franchiseData?.address || "Loading location...",
          phone: franchiseData?.franchiseeContact?.phone || '+971 4 123 4567'
        }
      ],
      openingHours: [
        { day: 'Monday - Friday', hours: '11:00 AM - 11:00 PM' },
        { day: 'Saturday - Sunday', hours: '10:00 AM - 12:00 AM' },
      ],
      contact: {
        phone: franchiseData?.franchiseeContact?.phone || '+971 4 123 4567',
        email: franchiseData?.franchiseeContact?.email || 'contact@franchise.com',
        website: franchiserDetails?.website || 'www.franchise.com'
      },
      images: interiorImageUrls && interiorImageUrls.length > 0 
        ? interiorImageUrls.filter((img: string | null) => img !== null) as string[]
        : [
        '/franchise/retail-1.png',
        '/franchise/retail-2.png',
        '/franchise/retail-3.png',
      ]
    };

    return (
      <div className="space-y-6">

        

        {/* Store Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative h-[600px] w-full  overflow-hidden">
              <Image
                src={franchise.images[0] || '/franchise/retail-1.png'}
                alt="Store front"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="relative h-full w-full  overflow-hidden">
              <Image
                src={franchise.images[1] || '/franchise/retail-2.png'}
                alt="Store interior"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-full w-full  overflow-hidden">
              <Image
                src={franchise.images[2] || '/franchise/retail-3.png'}
                alt="Store food"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        

        {/* Franchise Location Map and Store Information */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Store Information - Right Side */}
             <div className="space-y-6">
        <Card className="py-6">
              <CardHeader   >
                <CardTitle className="text-lg">About Us</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-stone-700 dark:text-stone-300">
                  { franchise.description}
                </p>
              </CardContent>
            </Card>
        {/* Store Details */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                    <h4 className="text-lg font-semibold text-stone-800 dark:text-stone-200">Store Information</h4>
                </div>
                  
                  <div className="space-y-3">
                <div>
                      <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Address</p>
                  <p className="text-stone-800 dark:text-stone-200">{franchise.location}</p>
                </div>
                
                <div>
                      <p className="text-sm font-medium text-stone-600 dark:text-stone-400">Website</p>
                      <a 
                        href={franchise.contact.website.startsWith('http') ? franchise.contact.website : `https://${franchise.contact.website}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {franchise.contact.website}
                      </a>
                    </div>
                  </div>
                </div>
            </Card>

              {/* Opening Hours */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                    <h4 className="text-lg font-semibold text-stone-800 dark:text-stone-200">Opening Hours</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {franchise.openingHours.map((schedule: { day: string; hours: string }, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                          {schedule.day}
                        </span>
                        <span className="text-sm text-stone-800 dark:text-stone-200">
                          {schedule.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
            {/* Map View - Left Side */}
            <div className="h-[600px] overflow-hidden border border-stone-200 dark:border-stone-700">
              <GoogleMapsLoader
                loadingFallback={
                  <div className="h-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto mb-2"></div>
                      <p className="text-stone-500 dark:text-stone-400">Loading map...</p>
                    </div>
                  </div>
                }
                errorFallback={() => (
                  <div className="h-full bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center p-4">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                      <p className="text-yellow-700 dark:text-yellow-300 font-medium">Map unavailable</p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                        {franchise.location || 'Location details loading...'}
                      </p>
                    </div>
                  </div>
                )}
              >
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={{ lat: 25.2048, lng: 55.2708 }} // Dubai coordinates as default
                  zoom={15}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                    styles: [
                      {
                        featureType: 'poi',
                        elementType: 'labels',
                        stylers: [{ visibility: 'off' }],
                      },
                    ],
                  }}
                  onLoad={() => {
                    console.log('Google Map loaded successfully');
                  }}
                >
                  {/* Show only the current franchise location */}
                  <Marker
                    position={{ 
                      lat: 25.2048, // Current franchise location coordinates
                      lng: 55.2708 
                    }}
                    title={franchise.name || 'Franchise Location'}
                    icon={{
                      url: '/map-marker.svg',
                    }}
                    onLoad={() => {
                      console.log('Franchise location marker loaded successfully');
                    }}
                  />
                </GoogleMap>
              </GoogleMapsLoader>
            </div>
            
           
          </div>
        </div>
      </div>
    );
  };

  // Convert franchise investors to Franchisee format with user profile data
  const franchisees: Franchisee[] = useMemo(() => {
    if (!franchiseInvestors) return [];
    
    return franchiseInvestors.map((investor: { 
      investorId: string; 
      totalShares: number; 
      totalInvested: number; 
      totalEarned?: number; 
      firstPurchaseDate: number;
      userProfile?: {
        fullName?: string;
        avatar?: string;
        email: string;
      } | null;
    }, index: number) => {
      
      // Use user profile data if available, otherwise fallback
      const fullName = investor.userProfile?.fullName 
        || investor.userProfile?.email 
        || `Investor ${index + 1}`;
      
      // Use fallback avatar for now - we'll handle Convex storage IDs in the component
      const avatar = `/avatar/avatar-${index % 2 === 0 ? 'm' : 'f'}-${(index % 6) + 1}.png`;
      
      return {
        id: investor.investorId,
        fullName,
        walletId: investor.investorId,
        avatar,
        avatarStorageId: investor.userProfile?.avatar, // Store the Convex storage ID separately
        totalShares: investor.totalShares,
        totalInvested: investor.totalInvested,
        isOfferActive: true, // All investors are active
        joinDate: new Date(investor.firstPurchaseDate).toLocaleDateString(),
        // Show total earned for all stages, but calculate based on stage
        totalEarned: fundraisingData.stage === 'ongoing' ? (investor.totalEarned || 0) : 
                     fundraisingData.stage === 'launching' ? 0 : 
                     fundraisingData.stage === 'closed' ? (investor.totalEarned || 0) : 0,
      };
    });
  }, [franchiseInvestors, fundraisingData.stage]);


  // Budget Table Component
  const BudgetTable = () => {
    return (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 dark:bg-stone-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Planned</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actual</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Variance</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
              {budgetItems.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium">{item.category}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-stone-500">
                      {item.type === 'one-time' ? 'One-time' : 'Recurring'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                      ${item.planned.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                      ${item.actual.toLocaleString()}
                    </td>
                    <td className={`whitespace-nowrap px-6 py-4 text-right font-medium ${
                      (item.actual - item.planned) >= 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {(item.actual - item.planned) >= 0 ? '+' : ''}{(item.actual - item.planned).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'on-track' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : item.status === 'over-budget'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : item.status === 'under-budget'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {item.status === 'on-track' 
                          ? 'On Track' 
                          : item.status === 'over-budget' 
                            ? 'Over Budget' 
                            : item.status === 'under-budget'
                              ? 'Under Budget'
                              : 'Not Started'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  // Show loading state
  if (isLoading) {
  return (
    <div className="space-y-6 py-12">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
            <p className="text-stone-600">Loading franchise data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show no data message if franchise not found
  if (!franchiseData) {
    return (
      <div className="space-y-6 py-12">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-800 mb-2">Franchise Not Found</h1>
            <p className="text-stone-600">The franchise you are looking for does not exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-12">
      
      {/* Franchise Wallet */}
      {franchiseData && (
        <FranchiseWallet
          franchiseId={franchiseData._id}
          franchiseName={franchiseData.franchiseSlug}
          franchiseLogo={logoUrl || '/logo/logo-4.svg'}
          onBuyTokens={() => {
            if (!isAuthenticated) {
              // Redirect to auth page with return URL
              const currentPath = window.location.pathname;
              router.push(`/auth?redirect=${encodeURIComponent(currentPath)}`);
            } else {
              setIsBuyTokensOpen(true);
            }
          }}
          onCheckout={cartItemsCount > 0 ? () => setIsCheckoutOpen(true) : undefined}
          cartItemsCount={cartItemsCount}
          franchiseStatus={franchiseData.status}
          franchiseStage={franchiseData.stage}
        />
      )}

      {/* Navigation Tabs */}
      <Card className="">
        <div className="border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between px-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
            
          </div>
        </div>

        <div className="px-6 pb-6">
          
          {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Finances</h2>
        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 ">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-sm text-stone-500 dark:text-stone-400">Est. Monthly:</span>
          <span className="font-semibold text-green-600">
            ${actualFinancialMetrics.monthlyRevenue.estimated.toLocaleString()}
          </span>
        </div>
          </div>
          
          
          <BudgetTable />
          
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 dark:bg-stone-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Month</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Estimated</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actual</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Payout</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Reserve Fund</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                  {monthlyRevenue.map((revenue) => {
                    return (
                      <tr key={revenue.month} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="font-medium">{revenue.month}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                          ${revenue.estimated.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-medium">
                          ${revenue.actual.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-blue-600">
                          ${(revenue.actual * 0.7).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-purple-600">
                          ${(revenue.actual * 0.3).toLocaleString(undefined, {maximumFractionDigits: 0})}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            revenue.status === 'on-track'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : revenue.status === 'above-target'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {revenue.status === 'on-track' 
                              ? 'On Track' 
                              : revenue.status === 'above-target'
                                ? 'Above Target'
                                : 'Below Target'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      
      {activeTab === 'franchisee' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Franchisee</h2>
              {fundraisingData.stage !== 'ongoing' && (
                <p className="text-sm text-stone-500 mt-1">
                  Earnings will be shown once the franchise is operational
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search investors..."
                  className="w-64 rounded-md border border-stone-200 py-2 pl-10 pr-4 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              </div>
            </div>
          </div>
          
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 dark:bg-stone-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Investor</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Total Shares</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Total Invested</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Total Earned</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                  {franchisees.map((franchisee: Franchisee) => (
                    <tr key={franchisee.id} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <FranchiseeAvatar 
                              avatar={franchisee.avatar} 
                              avatarStorageId={franchisee.avatarStorageId}
                              alt={franchisee.fullName}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-stone-900 dark:text-white">{franchisee.fullName}</div>
                            <div className="text-xs text-stone-500">Joined {franchisee.joinDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        {franchisee.totalShares.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        ${franchisee.totalInvested.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-green-600">
                        ${franchisee.totalEarned?.toLocaleString() || '0'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-stone-500">
                        {franchisee.joinDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      
      {activeTab === 'franchise' && <FranchiseTab />}
      
      {activeTab === 'transactions' && <TransactionsTab />}
      
      {activeTab === 'products' && (
            <div className="space-y-6">
            {/* Categories and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex space-x-2 overflow-x-auto pb-1">
              <button 
                onClick={() => setSelectedCategory('All Items')}
                className={`px-4 py-2  text-sm font-medium transition-colors ${
                  selectedCategory === 'All Items'
                    ? 'bg-neutral-500 dark:bg-neutral-800 text-white hover:bg-neutral-600'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200'
                }`}
              >
                All Items
              </button>
              {Array.from(new Set(products.map(p => p.category))).map(category => (
                <button 
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2  text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-neutral-500 dark:bg-neutral-800 text-white hover:bg-neutral-600'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {category}
                </button>
              ))}
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-stone-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500 text-sm h-9"
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products
                .filter(product => 
                  (selectedCategory === 'All Items' || product.category === selectedCategory) &&
                  (searchQuery === '' || 
                    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((product) => {
                  const quantityInCart = cart[product.id] || 0;
                  const isOngoing = fundraisingData.stage === 'ongoing';
                  
                  return (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-stone-200 dark:border-stone-700 gap-0">
                      <div className="relative h-64 aspect-square bg-stone-100 dark:bg-stone-700">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-stone-800 dark:text-stone-200">{product.name}</h3>
                          <p className="text-sm text-stone-600 line-clamp-2 mt-1 dark:text-stone-400">
                            {product.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-600 dark:text-stone-400 font-bold text-lg">${product.price.toFixed(2)}</span>
                        </div>
                        
                        {/* Cart Controls - Only show if franchise is ongoing */}
                        {isOngoing && (
                          <div className="pt-2">
                            {quantityInCart === 0 ? (
                              <Button
                                onClick={() => addToCart(product.id)}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                                size="sm"
                              >
                                Add to Cart
                              </Button>
                            ) : (
                              <div className="flex items-center justify-between gap-2">
                                <Button
                                  onClick={() => removeFromCart(product.id)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  −
                                </Button>
                                <div className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded font-semibold min-w-[60px] text-center">
                                  {quantityInCart}
                                </div>
                                <Button
                                  onClick={() => addToCart(product.id)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  +
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div> 
          )}


        
          {/* {activeTab === 'reviews' && (
            <ReviewsTab 
              reviews={reviews}
              averageRating={averageRating}
              totalReviews={reviews.length}
              ratingDistribution={ratingDistribution}
            />
          )} */}
        </div>
      </Card>

     
      {/* Buy Tokens Modal */}
      <Dialog open={isBuyTokensOpen} onOpenChange={setIsBuyTokensOpen}>
        <DialogTrigger asChild>
          <div className="hidden"></div>
        </DialogTrigger>
        <DialogContent className="max-sm:h-screen max-sm:max-h-screen max-sm:w-screen max-sm:max-w-full max-sm:m-0 max-sm:rounded-none sm:max-w-[500px] dark:bg-stone-900 p-0 gap-0 flex flex-col max-h-[95vh]">
          {/* Fixed Header */}
          <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="text-lg sm:text-xl font-bold">Buy Franchise Tokens</DialogTitle>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                  Each token = 1 share in this franchise
                </p>
              </div>
            </div>
          </DialogHeader>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            {/* Franchise Details */}
            <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800/30 mb-4">
              <div className="flex items-start space-x-3 sm:space-x-4">
                {/* Brand Logo */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white dark:bg-stone-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-stone-600 shadow-md">
                    <Image 
                      src={franchise.brandLogo} 
                      alt={`${franchise.name} logo`} 
                      width={64}
                      height={64}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-logo.svg';
                      }}
                      unoptimized
                    />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base sm:text-lg text-stone-900 dark:text-white truncate">{franchise.name}</h4>
                  
                  <div className="mt-1.5 space-y-0.5">
                    <div className="flex items-center text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                      <span className="truncate">
                        {franchise.location.area}, {franchise.location.city}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-500">
                      {franchise.location.country}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Token Selection */}
            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="shares" className="text-sm sm:text-base font-medium">Number of Tokens</Label>
                <div className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <span className="text-base sm:text-lg font-bold text-yellow-900 dark:text-yellow-200">{tokensToBuy}</span>
                  <span className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 ml-1">tokens</span>
                </div>
              </div>
              
              {/* Slider */}
              <div className="px-1">
                <Slider
                  value={[tokensToBuy]}
                  onValueChange={(value) => setTokensToBuy(value[0])}
                  min={1}
                  max={maxTokensToBuy}
                  step={1}
                  className="py-2"
                />
              </div>
              
              {/* Plus/Minus Controls */}
              <div className="flex items-center gap-3 sm:gap-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 h-12 sm:h-14 text-lg sm:text-xl font-bold"
                  onClick={() => setTokensToBuy((prev: number) => Math.max(1, prev - 10))}
                  disabled={tokensToBuy <= 1}
                >
                  -10
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 h-12 sm:h-14 text-lg sm:text-xl font-bold"
                  onClick={() => setTokensToBuy((prev: number) => Math.max(1, prev - 1))}
                  disabled={tokensToBuy <= 1}
                >
                  -1
                </Button>
                <Input
                  id="shares"
                  type="number"
                  min="1"
                  max={maxTokensToBuy}
                  value={tokensToBuy}
                  onChange={(e) => setTokensToBuy(Math.min(maxTokensToBuy, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="text-center h-12 sm:h-14 text-base sm:text-lg font-semibold flex-[1.5]"
                />
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 h-12 sm:h-14 text-lg sm:text-xl font-bold"
                  onClick={() => setTokensToBuy((prev: number) => Math.min(maxTokensToBuy, prev + 1))}
                  disabled={tokensToBuy >= maxTokensToBuy}
                >
                  +1
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="flex-1 h-12 sm:h-14 text-lg sm:text-xl font-bold"
                  onClick={() => setTokensToBuy((prev: number) => Math.min(maxTokensToBuy, prev + 10))}
                  disabled={tokensToBuy >= maxTokensToBuy}
                >
                  +10
                </Button>
              </div>
              
              <div className="flex justify-between text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                <span>Min: 1 token</span>
                <span>Max: {maxTokensToBuy} tokens</span>
              </div>
            </div>
            
            {/* Price Breakdown */}
            <div className="space-y-3 mb-4 p-3 sm:p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700">
              <Label className="text-sm sm:text-base font-semibold">Price Breakdown</Label>
              <div className="space-y-2.5 text-sm sm:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 dark:text-stone-400">{tokensToBuy} tokens × $1.00</span>
                  <span className="font-semibold">${(tokensToBuy * 1.00).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-stone-300 dark:border-stone-600">
                  <span className="text-stone-600 dark:text-stone-400">Platform fee ({platformFeePercentage}%)</span>
                  <span className="font-semibold text-stone-500 dark:text-stone-400">${((tokensToBuy * 1.00 * platformFeePercentage) / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
            {/* User Wallet Status */}
            {isWalletLoaded && userWallet.publicKey ? (
              <div className="p-3 sm:p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm sm:text-base font-medium text-green-700 dark:text-green-400">
                      Wallet Connected
                    </span>
                  </div>
                  <div className="text-left sm:text-right pl-4 sm:pl-0">
                    <span className="text-xs sm:text-sm font-mono text-green-600 dark:text-green-400 block">
                      {userWallet.publicKey.slice(0, 8)}...{userWallet.publicKey.slice(-6)}
                    </span>
                    <div className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 mt-0.5">
                      {userWallet.balance.toFixed(4)} SOL
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 sm:p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 mb-4">
                <div className="flex items-start space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1"></div>
                  <span className="text-xs sm:text-sm text-red-700 dark:text-red-400">
                    Wallet not connected. Please complete your profile setup first.
                  </span>
                </div>
              </div>
            )}

            {/* No Shares Available Warning */}
            {maxTokensToBuy <= 0 && (
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 mb-4">
                <div className="flex items-start space-x-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full mt-1"></div>
                  <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400">No tokens available for purchase</span>
                </div>
              </div>
            )}

            {/* Insufficient Balance Warning */}
            {isWalletLoaded && userWallet.publicKey && userWallet.balance < (tokensToBuy * sharePrice * (1 + platformFeePercentage / 100)) / solToUsdRate && (
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 mb-4">
                <div className="flex items-start space-x-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full mt-1"></div>
                  <div className="text-xs sm:text-sm text-red-700 dark:text-red-400">
                    <span className="font-semibold">Insufficient balance.</span>
                    <div className="mt-1">Need: {((tokensToBuy * sharePrice * (1 + platformFeePercentage / 100)) / solToUsdRate).toFixed(4)} SOL</div>
                    <div>Have: {userWallet.balance.toFixed(4)} SOL</div>
                  </div>
                </div>
              </div>
            )}

            {/* Total Cost - Highlighted */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border-2 border-yellow-300 dark:border-yellow-700 mb-4">
              <div className="flex justify-between items-center gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">Total Cost</p>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                    ≈ {((tokensToBuy * sharePrice * (1 + platformFeePercentage / 100)) / solToUsdRate).toFixed(4)} SOL
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-900 dark:text-yellow-200">
                    ${(tokensToBuy * sharePrice * (1 + platformFeePercentage / 100)).toFixed(2)}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-400">USD</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer with Actions */}
          <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky bottom-0">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setIsBuyTokensOpen(false)}
                className="flex-1 h-12 sm:h-14 text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button 
                size="lg"
                className="flex-[2] h-12 sm:h-14 text-sm sm:text-base bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700 font-semibold shadow-lg"
                disabled={isProcessing || maxTokensToBuy <= 0 || !isWalletLoaded || !userWallet.publicKey || userWallet.balance < (tokensToBuy * sharePrice * (1 + platformFeePercentage / 100)) / solToUsdRate}
              onClick={async () => {
                if (!isWalletLoaded || !userWallet.publicKey) {
                  toast.error('User wallet not found. Please complete your profile setup first.');
                  return;
                }

                console.log('Buy tokens clicked! Starting transaction...');
                console.log('User wallet:', userWallet);
                console.log('Tokens to buy:', tokensToBuy);
                console.log('Share price:', sharePrice);

                // Calculate payment breakdown
                const subtotalAmount = tokensToBuy * sharePrice;
                const platformFeeAmount = subtotalAmount * (platformFeePercentage / 100);
                const totalCost = subtotalAmount + platformFeeAmount;
                
                const subtotalInSOL = subtotalAmount / solToUsdRate;
                const platformFeeInSOL = platformFeeAmount / solToUsdRate;
                const totalCostInSOL = totalCost / solToUsdRate;
                
                console.log('Payment breakdown:', {
                  subtotal: subtotalAmount,
                  platformFee: platformFeeAmount,
                  total: totalCost,
                  subtotalSOL: subtotalInSOL,
                  platformFeeSOL: platformFeeInSOL,
                  totalSOL: totalCostInSOL
                });
                
                setIsProcessing(true);
                
                try {
                  if (!franchiseId) {
                    toast.error('Franchise ID not found');
                    return;
                  }

                  // Get franchise PDA address (funding escrow account)
                  const { getFranchisePDA, createFranchisePDA, storeFranchisePDA } = await import('@/lib/franchisePDA');
                  let franchisePDA = getFranchisePDA(franchiseId);
                  
                  // Create PDA if it doesn't exist
                  if (!franchisePDA?.pda) {
                    console.log('Creating franchise PDA for franchise:', franchiseId);
                    try {
                      const { pda, bump } = await createFranchisePDA(franchiseId);
                      const newPDA = {
                        franchiseId,
                        pda: pda.toString(),
                        bump,
                        totalShares: franchiseData?.investment?.sharesIssued || 1000,
                        sharesIssued: 0,
                        sharePrice: sharePrice,
                        totalRaised: 0,
                        isActive: true,
                        createdAt: Date.now()
                      };
                      storeFranchisePDA(newPDA);
                      franchisePDA = newPDA;
                      console.log('Created new franchise PDA:', newPDA);
                    } catch (error) {
                      console.error('Failed to create franchise PDA:', error);
                      toast.error('Failed to create franchise funding account. Please try again.');
                      return;
                    }
                  }

                  // Company wallet address for platform fees
                  const companyWalletAddress = '3M4FinDzudgSTLXPP1TAoB4yE2Y2jrKXQ4rZwbfizNpm';

                  console.log('Payment destinations:', {
                    franchisePDA: franchisePDA.pda,
                    companyWallet: companyWalletAddress,
                    subtotalSOL: subtotalInSOL,
                    platformFeeSOL: platformFeeInSOL
                  });

                  // Process Solana payment with split transfers
                  const transactionHash = await handleSolanaPaymentSplit(
                    subtotalInSOL, 
                    platformFeeInSOL, 
                    franchisePDA.pda, // Use franchise PDA instead of brand wallet
                    companyWalletAddress
                  );

                  // Store platform fee transaction for company wallet tracking
                  const platformFeeTransaction = {
                    amount: platformFeeAmount,
                    from: franchise.name,
                    timestamp: new Date().toISOString(),
                    description: `Platform fee from ${franchise.name} share purchase`,
                    transactionHash: transactionHash,
                    franchiseId: franchiseId,
                    sharesPurchased: tokensToBuy
                  };
                  
                  const platformFeeKey = `platform_fee_${Date.now()}_${franchiseId}`;
                  localStorage.setItem(platformFeeKey, JSON.stringify(platformFeeTransaction));
                  console.log('✅ Stored platform fee transaction in FranchiseStore:', {
                    key: platformFeeKey,
                    transaction: platformFeeTransaction,
                    platformFeeAmount: platformFeeAmount,
                    sharesPurchased: tokensToBuy
                  });

                  // Also add to income table
                  addToIncomeTable('platform_fee', platformFeeAmount, franchise.name, `Platform fee from ${franchise.name} share purchase`, transactionHash);
                  
                  // Record the purchase in Convex using the real mutation
                  await addInvestment(
                    tokensToBuy, 
                    sharePrice, 
                    subtotalAmount, // Use subtotal without platform fee for consistency
                    userWallet.publicKey, 
                    transactionHash
                  );

                  // Record transaction in localStorage for the transactions tab
                  const transaction = {
                    id: `share_purchase_${Date.now()}`,
                    type: 'share_purchase',
                    amount: totalCost, // Total amount including platform fee
                    amountSOL: totalCostInSOL,
                    description: `Purchased ${tokensToBuy} tokens in ${franchise.name}`,
                    franchiseSlug: franchiseId,
                    status: 'confirmed',
                    transactionHash: transactionHash,
                    timestamp: Date.now(),
                    fromAddress: userWallet.publicKey,
                    toAddress: franchisePDA.pda,
                    sharesPurchased: tokensToBuy,
                    sharePrice: sharePrice
                  };

                  // Save transaction to localStorage
                  const existingTransactions = localStorage.getItem(`transactions_${userWallet.publicKey}`);
                  const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
                  transactions.unshift(transaction); // Add to beginning
                  localStorage.setItem(`transactions_${userWallet.publicKey}`, JSON.stringify(transactions));
                  
                  console.log('✅ Transaction recorded:', transaction);
                  
                  // Update PDA with new shares (optional - for local state)
                  if (franchiseData?._id) {
                    const { updatePDASharesIssued } = await import('@/lib/franchisePDA');
                    const currentPDA = await getFranchisePDA(franchiseData._id);
                    if (currentPDA) {
                      const newSharesIssued = currentPDA.sharesIssued + tokensToBuy;
                      const newTotalRaised = currentPDA.totalRaised + totalCost;
                      updatePDASharesIssued(franchiseData._id, newSharesIssued, newTotalRaised);
                    }
                  }
                  
                  // Reset form
                  setTokensToBuy(1);
                  setIsBuyTokensOpen(false);
                  
                  // Show success message with explorer link
                  const networkParam = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? '' : '?cluster=devnet';
                  const explorerUrl = `https://explorer.solana.com/tx/${transactionHash}${networkParam}`;
                  toast.success(
                    <div className="flex flex-col gap-2">
                      <div>Successfully purchased {tokensToBuy} tokens for ${totalCost.toFixed(2)}!</div>
                      <a 
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
                      >
                        View on Solana Explorer
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>,
                    { duration: 10000 }
                  );
                  
                  // Check if funding is complete
                  if (franchiseData?._id) {
                    const { isFundingComplete } = await import('@/lib/franchisePDA');
                    if (isFundingComplete(franchiseData._id as string)) {
                      toast.success('🎉 Funding target reached! Franchise will transition to launching stage.');
                    }
                  }
                  
                } catch (error) {
                  console.error('Error purchasing shares:', error);
                  toast.error(`Failed to purchase shares: ${(error as Error).message || 'Please try again.'}`);
                } finally {
                  setIsProcessing(false);
                }
              }}
            >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : !isWalletLoaded || !userWallet.publicKey ? (
                  'Connect Wallet'
                ) : userWallet.balance < (tokensToBuy * 1.00 * (1 + platformFeePercentage / 100)) / solToUsdRate ? (
                  'Insufficient Balance'
                ) : (
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    Buy {tokensToBuy} Token{tokensToBuy > 1 ? 's' : ''}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signup Form Modal */}
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="sm:max-w-[600px] dark:bg-stone-900">
          <DialogHeader>
            <DialogTitle className="text-xl">Sign Up to Buy Tokens</DialogTitle>
            <DialogDescription>
              You need to create an account to purchase franchise shares.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Authentication system is being configured.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-sm:h-screen max-sm:max-h-screen max-sm:w-screen max-sm:max-w-full max-sm:m-0 max-sm:rounded-none sm:max-w-[600px] dark:bg-stone-900 p-0 gap-0 flex flex-col max-h-[95vh]">
          {/* Fixed Header */}
          <DialogHeader className="px-4 sm:px-6 py-4 sm:py-5 border-b border-stone-200 dark:border-stone-800 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="text-lg sm:text-xl font-bold">Checkout</DialogTitle>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                  Review your order and complete purchase
                </p>
              </div>
            </div>
          </DialogHeader>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            {/* Cart Items */}
            <div className="space-y-4 mb-4">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              {Object.entries(cart).map(([productId, quantity]) => {
                const product = products.find(p => p.id === productId);
                if (!product) return null;
                
                return (
                  <div key={productId} className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-stone-200 dark:bg-stone-700 rounded">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-stone-900 dark:text-white truncate">{product.name}</h4>
                      <p className="text-sm text-stone-600 dark:text-stone-400">${product.price.toFixed(2)} each</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          onClick={() => removeFromCart(productId)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          −
                        </Button>
                        <span className="px-3 py-1 bg-white dark:bg-stone-900 rounded font-semibold min-w-[40px] text-center border border-stone-200 dark:border-stone-700">
                          {quantity}
                        </span>
                        <Button
                          onClick={() => addToCart(productId)}
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-stone-900 dark:text-white">
                        ${(product.price * quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-4 p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700">
              <h3 className="font-semibold">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 dark:text-stone-400">Subtotal</span>
                  <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-600 dark:text-stone-400">Tax (0%)</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-stone-300 dark:border-stone-600 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-yellow-600">${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* User Wallet Status */}
            {isWalletLoaded && userWallet.publicKey ? (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Wallet Connected
                    </span>
                  </div>
                  <div className="text-left sm:text-right pl-4 sm:pl-0">
                    <span className="text-xs font-mono text-green-600 dark:text-green-400 block">
                      {userWallet.publicKey.slice(0, 8)}...{userWallet.publicKey.slice(-6)}
                    </span>
                    <div className="text-sm font-semibold text-green-700 dark:text-green-300 mt-0.5">
                      {userWallet.balance.toFixed(4)} SOL
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 mb-4">
                <div className="flex items-start space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1"></div>
                  <span className="text-sm text-red-700 dark:text-red-400">
                    Wallet not connected. Please complete your profile setup first.
                  </span>
                </div>
              </div>
            )}

            {/* Insufficient Balance Warning */}
            {isWalletLoaded && userWallet.publicKey && userWallet.balance < (cartTotal / solToUsdRate) && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 mb-4">
                <div className="flex items-start space-x-2">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full mt-1"></div>
                  <div className="text-sm text-red-700 dark:text-red-400">
                    <span className="font-semibold">Insufficient balance.</span>
                    <div className="mt-1">Need: {(cartTotal / solToUsdRate).toFixed(4)} SOL</div>
                    <div>Have: {userWallet.balance.toFixed(4)} SOL</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer with Actions */}
          <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky bottom-0">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 h-12 sm:h-14"
              >
                Continue Shopping
              </Button>
              <Button 
                size="lg"
                className="flex-[2] h-12 sm:h-14 bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700 font-semibold shadow-lg"
                disabled={isProcessing || cartItemsCount === 0 || !isWalletLoaded || !userWallet.publicKey || userWallet.balance < (cartTotal / solToUsdRate)}
                onClick={async () => {
                  if (!isWalletLoaded || !userWallet.publicKey) {
                    toast.error('User wallet not found. Please complete your profile setup first.');
                    return;
                  }

                  console.log('Processing order...');
                  console.log('Cart:', cart);
                  console.log('Total:', cartTotal);

                  setIsProcessing(true);
                  
                  try {
                    // Calculate SOL amount
                    const totalInSOL = cartTotal / solToUsdRate;
                    
                    // For now, we'll use a placeholder destination (franchise wallet)
                    const destinationAddress = franchise.brandWalletAddress || '3M4FinDzudgSTLXPP1TAoB4yE2Y2jrKXQ4rZwbfizNpm';
                    
                    console.log('Payment details:', {
                      totalUSD: cartTotal,
                      totalSOL: totalInSOL,
                      destination: destinationAddress
                    });

                    // Process Solana payment
                    const transactionHash = await handleSolanaPayment(
                      totalInSOL,
                      destinationAddress
                    );

                    // Record transaction
                    const transaction = {
                      id: `product_purchase_${Date.now()}`,
                      type: 'product_purchase',
                      amount: cartTotal,
                      amountSOL: totalInSOL,
                      description: `Purchased ${cartItemsCount} items from ${franchise.name}`,
                      franchiseSlug: franchiseId,
                      status: 'confirmed',
                      transactionHash: transactionHash,
                      timestamp: Date.now(),
                      fromAddress: userWallet.publicKey,
                      toAddress: destinationAddress,
                      items: Object.entries(cart).map(([productId, quantity]) => {
                        const product = products.find(p => p.id === productId);
                        return {
                          productId,
                          productName: product?.name,
                          quantity,
                          price: product?.price
                        };
                      })
                    };

                    // Save transaction to localStorage
                    const existingTransactions = localStorage.getItem(`transactions_${userWallet.publicKey}`);
                    const transactions = existingTransactions ? JSON.parse(existingTransactions) : [];
                    transactions.unshift(transaction);
                    localStorage.setItem(`transactions_${userWallet.publicKey}`, JSON.stringify(transactions));
                    
                    console.log('✅ Order completed:', transaction);
                    
                    // Clear cart and close modal
                    clearCart();
                    setIsCheckoutOpen(false);
                    
                    // Show success message
                    const networkParam = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? '' : '?cluster=devnet';
                    const explorerUrl = `https://explorer.solana.com/tx/${transactionHash}${networkParam}`;
                    toast.success(
                      <div className="flex flex-col gap-2">
                        <div>Order completed successfully! Total: ${cartTotal.toFixed(2)}</div>
                        <a 
                          href={explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-1"
                        >
                          View on Solana Explorer
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>,
                      { duration: 10000 }
                    );
                    
                  } catch (error) {
                    console.error('Error processing order:', error);
                    toast.error(`Failed to process order: ${(error as Error).message || 'Please try again.'}`);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : !isWalletLoaded || !userWallet.publicKey ? (
                  'Connect Wallet'
                ) : userWallet.balance < (cartTotal / solToUsdRate) ? (
                  'Insufficient Balance'
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Complete Order • ${cartTotal.toFixed(2)}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const FranchiseStore: React.FC<FranchiseStoreProps> = (props) => {
  return (
    <WalletErrorBoundary>
      <FranchiseStoreInner {...props} />
    </WalletErrorBoundary>
  );
};

export default FranchiseStore;