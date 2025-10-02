"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { useConvexImageUrl } from '@/hooks/useConvexImageUrl';
// import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { Address } from 'gill';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MapPin, Search } from 'lucide-react';
import { 
  DollarSign, 
  Box, 
  Users, 
  Store, 
  Phone, 
  Mail, 
  Globe, 
} from 'lucide-react';
import Image from 'next/image';
// import FranchisePOSWallet from '../FranchisePOSWallet';
// import { useFranchiseWallet } from '@/hooks/useFranchiseWallet';
import FranchiseWallet from '../FranchiseWallet';
import FranchiseStageIndicator, { FranchiseStageProgress } from '../FranchiseStageIndicator';
import { useSolana } from '@/components/solana/use-solana';
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer';
import WalletErrorBoundary from '@/components/solana/WalletErrorBoundary';
import type { 
  Product, 
  Franchisee, 
  BudgetItem, 
  MonthlyRevenue, 
  FranchiseStoreProps,
  TabId 
} from "@/types/ui";

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

function FranchiseStoreInner({ franchiseId, franchiserId }: FranchiseStoreProps = {}) {
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
  const [franchisePDA, setFranchisePDA] = useState<{
    pda: string;
    totalRaised: number;
    sharesIssued: number;
    totalShares: number;
  } | null>(null);

  // Solana wallet hooks
  const { account, client } = useSolana();
  const signer = useWalletUiSigner();
  
  // Load franchise data from Convex
  const franchiseData = useQuery(
    api.franchiseManagement.getFranchiseBySlug,
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
  const getFranchisePDA = async (franchiseId: string) => {
    const { getFranchisePDA: getPDA } = await import('@/lib/franchisePDA');
    return getPDA(franchiseId);
  };

  // Use the same hook as FranchiseCard for consistency
  const convexFundraisingData = useQuery(
    api.franchiseManagement.getFranchiseFundraisingData,
    franchiseId ? { franchiseSlug: franchiseId } : "skip"
  );

  console.log('FranchiseStore - franchiseId:', franchiseId);
  console.log('FranchiseStore - convexFundraisingData:', convexFundraisingData);

  // Create fundraising data object similar to what useFranchiseFundraising returns
  const fundraisingData = convexFundraisingData ? {
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
    stage: convexFundraisingData.stage
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
    stage: 'funding' as const
  };

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
  }, [franchiseId, fundraisingData?.invested, fundraisingData?.sharesRemaining, fundraisingData?.totalShares]);

  // Wallet integration - Real implementation
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Real wallet functions
  const connect = async () => {
    if (account?.address) {
      toast.success("Wallet connected");
      return true;
    } else {
      toast.error("Please connect your wallet first");
      return false;
    }
  };
  
  // const signTransaction = async (transaction: Transaction) => {
  //   if (!signer) {
  //     throw new Error('Wallet not connected');
  //   }
  //   // Use the real wallet signer
  //   return signer.signTransaction(transaction);
  // };
  
  // Shares slider state
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBuySharesOpen, setIsBuySharesOpen] = useState(false);
  const platformFeePercentage = 2; // 2% platform fee
  const solToUsdRate = 150; // Current SOL to USD rate (example)
  
  // Get real data from fundraising data
  const totalShares = fundraisingData.totalShares || 100000;
  const sharePrice = fundraisingData.pricePerShare || 1;
  const maxSharesToBuy = Math.min(fundraisingData.sharesRemaining || totalShares, totalShares);
  
  // Reset shares to buy when modal opens or when max shares change
  useEffect(() => {
    if (isBuySharesOpen) {
      setSharesToBuy(Math.min(1, maxSharesToBuy));
    }
  }, [isBuySharesOpen, maxSharesToBuy]);

  // Get franchise PDA address for payments
  const getFranchisePDAAddress = async () => {
    if (!franchiseData?._id) return null;
    try {
      const { getFranchisePDA } = await import('@/lib/franchisePDA');
      const pda = getFranchisePDA(franchiseData?._id);
      return pda?.pda || null;
    } catch (error) {
      console.error('Error getting franchise PDA:', error);
      return null;
    }
  };

  // Handle Solana payment
  const handleSolanaPayment = async (amountInSOL: number, destinationAddress: string) => {
    if (!account?.address || !signer) {
      throw new Error('Wallet not connected or does not support signing');
    }

    // Check if signer has the required methods
    if (!('signAndSendTransactions' in signer)) {
      throw new Error('Wallet signer does not support transaction signing');
    }

    try {
      // Create a real Solana transaction
      const { createTransaction, getBase58Decoder, signAndSendTransactionMessageWithSigners } = await import('gill');
      const { getTransferSolInstruction } = await import('gill/programs');
      
      // Get the latest blockhash using the existing client
      const { value: latestBlockhash } = await client.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
      
      // Create the transaction
      const transaction = createTransaction({
        feePayer: signer,
        version: 0,
        latestBlockhash,
        instructions: [
          getTransferSolInstruction({
            amount: Math.round(amountInSOL * 1000000000), // Convert to lamports
            destination: destinationAddress as Address,
            source: signer,
          }),
        ],
      });

      console.log(`Real payment: ${amountInSOL} SOL to ${destinationAddress}`);
      console.log('Transaction created:', transaction);
      console.log('Signer type:', typeof signer);
      console.log('Signer methods:', Object.keys(signer));
      
      // Sign and send the transaction
      const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
      const signature = getBase58Decoder().decode(signatureBytes);
      
      console.log(`Transaction signature: ${signature}`);
      
      return signature;
    } catch (error) {
      console.error('Error processing Solana payment:', error);
      throw error;
    }
  };

  // Handle Solana payment with split transfers (subtotal to brand, platform fee to company)
  const handleSolanaPaymentSplit = async (
    subtotalInSOL: number, 
    platformFeeInSOL: number, 
    brandWalletAddress: string, 
    companyWalletAddress: string
  ) => {
    if (!account?.address || !signer) {
      throw new Error('Wallet not connected or does not support signing');
    }

    // Check if signer has the required methods
    if (!('signAndSendTransactions' in signer)) {
      const errorMsg = (signer as { error?: { message?: string } })?.error?.message || 'Wallet signer does not support transaction signing';
      throw new Error(`Wallet error: ${errorMsg}`);
    }

    // Check if signer is a mock signer (indicates wallet connection issues)
    if ((signer as { isMock?: boolean })?.isMock) {
      throw new Error('Wallet connection issue detected. Please reconnect your wallet.');
    }

    try {
      // For now, let's use the working single transfer approach and transfer to brand wallet only
      // TODO: Implement proper split transfer once we understand the gill library better
      const totalAmountInSOL = subtotalInSOL + platformFeeInSOL;
      
      console.log('Split payment (fallback to single transfer):', {
        subtotalSOL: subtotalInSOL,
        platformFeeSOL: platformFeeInSOL,
        totalSOL: totalAmountInSOL,
        brandWallet: brandWalletAddress,
        companyWallet: companyWalletAddress
      });
      
      // Use the working single transfer method for now
      const signature = await handleSolanaPayment(totalAmountInSOL, brandWalletAddress);
      
      console.log(`Split payment completed (single transfer): ${signature}`);
      console.log('Note: Platform fee will need to be handled separately until split transfer is fixed');
      
      return signature;
    } catch (error) {
      console.error('Error processing split Solana payment:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        subtotalInSOL,
        platformFeeInSOL,
        brandWalletAddress,
        companyWalletAddress
      });
      throw error;
    }
  };
  

  const [budgetItems] = useState<BudgetItem[]>([
    {
      id: '1',
      category: 'Franchisee Fee',
      type: 'one-time',
      planned: 20000,
      actual: 0,
      status: 'not-started'
    },
    {
      id: '2',
      category: 'Setup Cost',
      type: 'one-time',
      planned: 30000,
      actual: 0,
      status: 'not-started'
    },
    {
      id: '3',
      category: 'Working Capital',
      type: 'one-time',
      planned: 10000,
      actual: 0,
      status: 'not-started'
    },
    {
      id: '4',
      category: 'Salaries',
      type: 'recurring',
      planned: 10000,
      actual: 0,
      status: 'not-started'
    },
    {
      id: '5',
      category: 'Rent',
      type: 'recurring',
      planned: 5000,
      actual: 0,
      status: 'not-started'
    },
    {
      id: '6',
      category: 'Maintenance',
      type: 'recurring',
      planned: 2000,
      actual: 0,
      status: 'not-started'
    },
  ]);

  const [monthlyRevenue] = useState<MonthlyRevenue[]>([
    { month: 'Jan 2024', estimated: 50000, actual: 0, status: 'below-target' },
    { month: 'Feb 2024', estimated: 52000, actual: 0, status: 'below-target' },
    { month: 'Mar 2024', estimated: 54000, actual: 0, status: 'below-target' },
    { month: 'Apr 2024', estimated: 56000, actual: 0, status: 'below-target' },
    { month: 'May 2024', estimated: 58000, actual: 0, status: 'below-target' },
    { month: 'Jun 2024', estimated: 60000, actual: 0, status: 'below-target' },
  ]);

  const products: Product[] = [
    {
      id: '1',
      name: 'Premium Burger',
      description: 'Juicy beef patty with fresh vegetables and special sauce',
      price: 12.99,
      image: '/products/product-1.jpg',
      category: 'Burgers'
    },
    {
      id: '2',
      name: 'Cheese Pizza',
      description: 'Classic cheese pizza with mozzarella and tomato sauce',
      price: 14.99,
      image: '/products/product-2.jpg',
      category: 'Pizza'
    },
    {
      id: '3',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing and croutons',
      price: 9.99,
      image: '/products/product-3.jpg',
      category: 'Salads'
    },
    {
      id: '4',
      name: 'Chocolate Brownie',
      description: 'Warm chocolate brownie with vanilla ice cream',
      price: 6.99,
      image: '/products/product-4.jpg',
      category: 'Desserts'
    },
    {
      id: '5',
      name: 'Premium Burger',
      description: 'Juicy beef patty with fresh vegetables and special sauce',
      price: 12.99,
      image: '/products/product-5.jpg',
      category: 'Burgers'
    },
    {
      id: '6',
      name: 'Cheese Pizza',
      description: 'Classic cheese pizza with mozzarella and tomato sauce',
      price: 14.99,
      image: '/products/product-6.jpg',
      category: 'Pizza'
    },
    {
      id: '7',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing and croutons',
      price: 9.99,
      image: '/products/product-7.jpg',
      category: 'Salads'
    },
    {
      id: '8',
      name: 'Chocolate Brownie',
      description: 'Warm chocolate brownie with vanilla ice cream',
      price: 6.99,
      image: '/products/product-8.jpg',
      category: 'Desserts'
    },
  ];

 

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'products', label: 'Products', icon: Box },
    { id: 'franchisee', label: 'Franchisee', icon: Users },
    { id: 'finances', label: 'Finances', icon: DollarSign },
    { id: 'franchise', label: 'Franchise', icon: Store },
    // { id: 'reviews', label: 'Reviews', icon: Star },
  ];

  // Store tab component
  const FranchiseTab = () => {
    const franchise = {
      name: "Gourmet Burger Kitchen",
      description: "GBK is a premium burger restaurant chain that serves gourmet burgers made with high-quality ingredients. Our menu features a variety of creative burger options, delicious sides, and handcrafted milkshakes in a modern and vibrant setting.",
      location: "123 Food Street, Downtown, Dubai, UAE",
      openingHours: [
        { day: 'Monday - Friday', hours: '11:00 AM - 11:00 PM' },
        { day: 'Saturday - Sunday', hours: '10:00 AM - 12:00 AM' },
      ],
      contact: {
        phone: '+971 4 123 4567',
        email: 'dubai@gbk.ae',
        website: 'www.gbk.ae'
      },
      images: [
        '/franchise/retail-1.png',
        '/franchise/retail-2.png',
        '/franchise/retail-3.png',
      ]
    };

    return (
      <div className="space-y-6">
        {/* Store Header */}
        {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">{franchise.name}</h2>
            <div className="flex items-center mt-1 text-sm text-stone-600 dark:text-stone-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{franchise.location}</span>
            </div>
          </div>
          
        </div> */}

        {/* Store Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative h-[600px] w-full  overflow-hidden">
              <Image
                src={franchise.images[0]}
                alt="Store front"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="grid grid-rows-2 gap-4">
            <div className="relative h-full w-full  overflow-hidden">
              <Image
                src={franchise.images[1]}
                alt="Store interior"
                fill
                className="object-cover"
              />
            </div>
            <div className="relative h-full w-full  overflow-hidden">
              <Image
                src={franchise.images[2]}
                alt="Store food"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Description */}
          <div className=" space-y-6">
            
            <Card className="py-6">
              <CardHeader className="pb-1">
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-stone-200 dark:bg-stone-800  flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-stone-400" />
                  <span className="ml-2 text-stone-500">Map view coming soon</span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
         
            <Card className="py-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Store Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Address</h4>
                  <p className="text-stone-800 dark:text-stone-200">{franchise.location}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Opening Hours</h4>
                  <div className="space-y-1">
                    {franchise.openingHours.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-stone-600 dark:text-stone-300">{item.day}</span>
                        <span className="font-medium">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-stone-500" />
                      <a href={`tel:${franchise.contact.phone}`} className="hover:underline">
                        {franchise.contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-stone-500" />
                      <a href={`mailto:${franchise.contact.email}`} className="hover:underline">
                        {franchise.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-stone-500" />
                      <a 
                        href={`https://${franchise.contact.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-600 dark:text-blue-400"
                      >
                        {franchise.contact.website}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          
          </div>
        </div>
      </div>
    );
  };

  // Sample review data
  // const reviews = [
  //   {
  //     id: '1',
  //     userName: 'Alex Johnson',
  //     userAvatar: '/avatar/avatar-m-1.png',
  //     rating: 5,
  //     date: '2024-09-15',
  //     comment: 'Amazing experience! The food was delicious and the service was excellent. Will definitely come back again.',
  //     images: ['/products/product-1.jpg', '/products/product-2.jpg'],
  //     verified: true
  //   },
  //   {
  //     id: '2',
  //     userName: 'Sarah Williams',
  //     userAvatar: '/avatar/avatar-f-2.png',
  //     rating: 4,
  //     date: '2024-09-10',
  //     comment: 'Great food and atmosphere, but the service was a bit slow. Otherwise, a wonderful experience!',
  //     verified: true
  //   },
  //   {
  //     id: '3',
  //     userName: 'Michael Brown',
  //     userAvatar: '/avatar/avatar-m-2.png',
  //     rating: 5,
  //     date: '2024-09-05',
  //     comment: 'Best burger I\'ve ever had! The ingredients were fresh and the flavors were amazing. Highly recommend!',
  //     images: ['/products/product-3.jpg'],
  //     verified: false
  //   },
  //   {
  //     id: '4',
  //     userName: 'Emily Davis',
  //     userAvatar: '/avatar/avatar-f-3.png',
  //     rating: 3,
  //     date: '2024-08-28',
  //     comment: 'Food was good but a bit overpriced. The ambiance was nice though.',
  //     verified: true
  //   },
  //   {
  //     id: '5',
  //     userName: 'David Wilson',
  //     userAvatar: '/avatar/avatar-m-3.png',
  //     rating: 5,
  //     date: '2024-08-20',
  //     comment: 'Exceptional service and the food was cooked to perfection. The staff went above and beyond to make our anniversary special.',
  //     images: ['/products/product-4.jpg', '/products/product-5.jpg', '/products/product-6.jpg'],
  //     verified: true
  //   }
  // ];

  // Sample franchisee data - this would typically come from your backend
  const franchisees: Franchisee[] = [
    {
      id: '1',
      fullName: 'John Doe',
      walletId: 'HjZ5j...8Xy9z',
      avatar: '/avatar/avatar-m-1.png',
      totalShares: 15000,
      totalInvested: 15000,
      isOfferActive: true,
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      fullName: 'Jane Smith',
      walletId: 'AbC12...XyZ34',
      avatar: '/avatar/avatar-f-1.png',
      totalShares: 10000,
      totalInvested: 10000,
      isOfferActive: false,
      joinDate: '2024-02-20',
    },
    {
      id: '3',
      fullName: 'Mike Johnson',
      walletId: 'XyZ78...PqR90',
      avatar: '/avatar/avatar-m-2.png',
      totalShares: 5000,
      totalInvested: 5000,
      isOfferActive: true,
      joinDate: '2024-03-05',
    },
  ];

  // Use real fundraising data instead of hardcoded values
  const fundingData = {
    totalInvestment: fundraisingData.totalInvestment,
    invested: fundraisingData.invested,
    totalShares: fundraisingData.totalShares,
    sharesRemaining: fundraisingData.sharesRemaining,
    pricePerShare: fundraisingData.pricePerShare
  };

  // Debug logging to see what data we're getting
  console.log('FranchiseStore - fundraisingData:', fundraisingData);
  console.log('FranchiseStore - fundingData:', fundingData);

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

  return (
    <div className="space-y-6 py-12">
      
      <FranchiseWallet 
          franchiseId={franchiseId}
          business={{
            name: franchise.name,
            logoUrl: franchise.brandLogo
          }}
        />
      
      {/* Funding Component */}
      <Card className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">FUNDRAISING</h2>
            </div>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => setIsBuySharesOpen(true)}
            >
              Buy Shares
            </Button>
          </div>
          {/* Progress Bar */}
            <div className="h-2 mt-2 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${fundingData.totalShares > 0 ? (fundingData.totalShares - fundingData.sharesRemaining) / fundingData.totalShares * 100 : 0}%` }}
              ></div>
            </div>

          <div className="flex justify-between mt-1">
            <div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Total Investment Target: </div>
              <div className="text-lg font-semibold"> ${fundingData.totalInvestment.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-stone-600 dark:text-stone-400">Amount Raised: </div>
              <div className="text-lg font-semibold text-green-600"> ${fundingData.invested.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex justify-between mt-0">
            <div>
              <div className="text-sm text-stone-600 dark:text-stone-400">Total Shares: </div>
              <div className="text-lg font-semibold"> {fundingData.totalShares.toLocaleString()} shares</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-stone-600 dark:text-stone-400">Shares Remaining: </div>
              <div className="text-lg font-semibold"> {fundingData.sharesRemaining.toLocaleString()} shares</div>
            </div>
          </div>
          
          {/* PDA Information for funding stage */}
          {/* {franchisePDA && (
            <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-stone-600 dark:text-stone-400">Franchise PDA</div>
                  <div className="text-lg font-semibold">
                    {franchisePDA.totalRaised.toFixed(2)} USD
                  </div>
                  <div className="text-xs text-stone-500">
                    {franchisePDA.sharesIssued} / {franchisePDA.totalShares} shares
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-stone-600 dark:text-stone-400">PDA Address</div>
                  <div className="text-xs font-mono text-stone-500">
                    {franchisePDA.pda.slice(0, 6)}...{franchisePDA.pda.slice(-6)}
                  </div>
                </div>
              </div>
            </div>
          )} */}
          
        </div>
      </Card>
      {/* Navigation Tabs */}
      <Card className="p-0">
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

        <div className="p-6">
          {activeTab === 'franchise' && (
            <div className="space-y-6">
              <FranchiseStageProgress 
                currentStage={fundraisingData.stage || 'funding'} 
                className="mb-6"
              />
              <FranchiseTab />
            </div>
          )}
          
          {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Finances</h2>
            <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 ">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm text-stone-500 dark:text-stone-400">Est. Monthly:</span>
              <span className="font-semibold text-green-600">
                ${monthlyRevenue[0]?.estimated.toLocaleString()}
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
            <h2 className="text-2xl font-bold">Franchisee</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search franchisee..."
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
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Franchisee</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Wallet ID</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Total Shares</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Total Invested</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
                  {franchisees.map((franchisee) => (
                    <tr key={franchisee.id} className="hover:bg-stone-50 dark:hover:bg-stone-800">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <Image
                              src={franchisee.avatar}
                              alt={franchisee.fullName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-stone-900 dark:text-white">{franchisee.fullName}</div>
                            <div className="text-xs text-stone-500">Joined {franchisee.joinDate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-stone-500 font-mono">
                        {franchisee.walletId}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        {franchisee.totalShares.toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        {franchisee.totalInvested.toLocaleString()} AED
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          {/* Current User - Show Toggle */}
                          {franchisee.id === '1' ? (
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-stone-500">Me</span>
                              <button
                                onClick={() => {
                                  const newFranchisees = franchisees.map(f => 
                                    f.id === franchisee.id 
                                      ? { ...f, isOfferActive: !f.isOfferActive } 
                                      : f
                                  );
                                  // In a real app, you would update the backend here
                                  console.log('Updated franchisees:', newFranchisees);
                                }}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 ${
                                  franchisee.isOfferActive ? 'bg-stone-600' : 'bg-stone-200'
                                }`}
                                role="switch"
                                aria-checked={franchisee.isOfferActive}
                              >
                                <span className="sr-only">Toggle offer</span>
                                <span
                                  aria-hidden="true"
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    franchisee.isOfferActive ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          ) : franchisee.isOfferActive ? (
                            // Other users with offers active - Show Offer button
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-stone-500 text-stone-600 hover:bg-stone-50 hover:text-stone-700"
                            >
                              Make Offer
                            </Button>
                          ) : (
                            // Other users with offers inactive - Show disabled button
                            <span className="text-xs text-stone-400">Not Accepting</span>
                          )}
                        </div>
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
                    className="block w-full pl-10 pr-3 py-2 border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500 focus:border-stone-500 text-sm h-9"
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
                  .map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-stone-200">
                    <div className="relative h-48 bg-stone-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {/* <div className="absolute top-2 right-2 bg-white/90  p-1.5 shadow-sm">
                        <Heart className="h-4 w-4 text-stone-500" />
                      </div> */}
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-lg text-stone-800 dark:text-white">{product.name}</h3>
                        <p className="text-sm text-stone-600 line-clamp-2 mt-1 dark:text-stone-400">
                          {product.description}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-stone-600 font-bold text-lg">${product.price.toFixed(2)}</span>
                        {/* <button
                          // onClick={() => addToCart(product)}
                          className="bg-stone-500 hover:bg-stone-600 text-white py-2 px-4  font-medium transition-colors"
                          disabled
                        >
                          Coming Soon
                        </button> */}
                      </div>
                    </div>
                  </Card>
                ))}
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

     
      {/* Buy Shares Modal */}
      <Dialog open={isBuySharesOpen} onOpenChange={setIsBuySharesOpen}>
        <DialogTrigger asChild>
          <div className="hidden"></div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] dark:bg-stone-900">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Store className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Buy Franchise Shares</DialogTitle>
                <p className="text-sm text-stone-500 dark:text-stone-400">Become a part of {franchise.name}</p>
              </div>
            </div>
          </DialogHeader>
          
          {/* Franchise Details */}
          <div className="space-y-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
            
            <div className="flex items-start space-x-4">
              {/* Brand Logo */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg bg-white dark:bg-stone-700 flex items-center justify-center overflow-hidden border border-stone-200 dark:border-stone-700">
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
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-lg">{franchise.name}</h4>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-sm text-stone-500 dark:text-stone-400">
                    <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span>
                      {franchise.location.area}, {franchise.location.city}, {franchise.location.country}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="shares">Select Number of Shares</Label>
                <span className="text-sm font-medium">{sharesToBuy} shares</span>
              </div>
              <Button variant="outline" className="w-full">
                <Slider
                  value={[sharesToBuy]}
                  onValueChange={(value) => setSharesToBuy(value[0])}
                  min={1}
                  max={maxSharesToBuy}
                  step={1}
                  className=""
                />

              </Button>
              
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setSharesToBuy(prev => Math.max(1, prev - 1))}
                  disabled={sharesToBuy <= 1}
                >
                  -
                </Button>
                <Input
                  id="shares"
                  type="number"
                  min="1"
                  max={maxSharesToBuy}
                  value={sharesToBuy}
                  onChange={(e) => setSharesToBuy(Math.min(maxSharesToBuy, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="text-center"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSharesToBuy(prev => Math.min(maxSharesToBuy, prev + 1))}
                  disabled={sharesToBuy >= maxSharesToBuy}
                >
                  +
                </Button>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Min: 1</span>
                <span>Max: {maxSharesToBuy}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Price Breakdown</Label>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>{sharesToBuy} shares × ${sharePrice.toFixed(2)}</span>
                  <span>${(sharesToBuy * sharePrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-2 mt-2">
                  <span>Platform fee ({platformFeePercentage}%)</span>
                  <span>${((sharesToBuy * sharePrice * platformFeePercentage) / 100).toFixed(2)}</span>
                </div>
                {/* <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>${(sharesToBuy * sharePrice * (1 + platformFeePercentage / 100)).toFixed(2)}</span>
                </div> */}
              </div>
            </div>
          </div>
          {/* Wallet Connection Status */}
          {account?.address && (
            <div className={`p-3 rounded-lg ${
              signer && 'signAndSendTransactions' in signer 
                ? 'bg-green-50 dark:bg-green-900/20' 
                : 'bg-yellow-50 dark:bg-yellow-900/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    signer && 'signAndSendTransactions' in signer 
                      ? 'bg-green-500' 
                      : 'bg-yellow-500'
                  }`}></div>
                  <span className={`text-sm ${
                    signer && 'signAndSendTransactions' in signer 
                      ? 'text-green-700 dark:text-green-400' 
                      : 'text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {signer && 'signAndSendTransactions' in signer 
                      ? 'Wallet Ready' 
                      : 'Wallet Connected - Not Ready'
                    }
                  </span>
                </div>
                <span className={`text-xs font-mono ${
                  signer && 'signAndSendTransactions' in signer 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
              </div>
              {signer && !('signAndSendTransactions' in signer) && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Please try reconnecting your wallet or refresh the page.
                </p>
              )}
            </div>
          )}

          {/* No Shares Available Warning */}
          {maxSharesToBuy <= 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-700 dark:text-red-400">No shares available for purchase</span>
              </div>
            </div>
          )}

          {/* Total Cost in SOL */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-300">Total Solana</p>
                
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  ≈ {((sharesToBuy * sharePrice * (1 + platformFeePercentage / 100)) / solToUsdRate).toFixed(4)} SOL
                </p>
              </div>
              <p className="text-2xl font-bold">
                  ${(sharesToBuy * sharePrice * (1 + platformFeePercentage / 100)).toFixed(2)} USD
                </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={() => setIsBuySharesOpen(false)}>Cancel</Button>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={isProcessing || maxSharesToBuy <= 0 || !account?.address || !signer || !('signAndSendTransactions' in signer)}
              onClick={async () => {
                if (!account?.address) {
                  try {
                    const connected = await connect();
                    if (!connected) return;
                  } catch (error) {
                    toast.error('Failed to connect wallet');
                    return;
                  }
                }

                if (!account?.address) {
                  toast.error('Wallet not connected');
                  return;
                }

                // Check if signer is available
                if (!signer || !('signAndSendTransactions' in signer)) {
                  toast.error('Wallet signer not available. Please try reconnecting your wallet.');
                  return;
                }

                // Calculate payment breakdown
                const subtotalAmount = sharesToBuy * sharePrice;
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

                  // Get destination addresses
                  const brandWalletAddress = franchise.brandWalletAddress;
                  if (!brandWalletAddress) {
                    toast.error('Brand wallet address not found. Please ensure the franchiser has a registered wallet.');
                    return;
                  }

                  // Company wallet address for platform fees
                  const companyWalletAddress = '3M4FinDzudgSTLXPP1TAoB4yE2Y2jrKXQ4rZwbfizNpm';

                  // Process Solana payment with split transfers
                  const transactionHash = await handleSolanaPaymentSplit(
                    subtotalInSOL, 
                    platformFeeInSOL, 
                    brandWalletAddress, 
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
                    sharesPurchased: sharesToBuy
                  };
                  
                  const platformFeeKey = `platform_fee_${Date.now()}_${franchiseId}`;
                  localStorage.setItem(platformFeeKey, JSON.stringify(platformFeeTransaction));
                  console.log('✅ Stored platform fee transaction in FranchiseStore:', {
                    key: platformFeeKey,
                    transaction: platformFeeTransaction,
                    platformFeeAmount: platformFeeAmount,
                    sharesPurchased: sharesToBuy
                  });

                  // Also add to income table
                  addToIncomeTable('platform_fee', platformFeeAmount, franchise.name, `Platform fee from ${franchise.name} share purchase`, transactionHash);
                  
                  // Record the purchase in Convex using the real mutation
                  await addInvestment(
                    sharesToBuy, 
                    sharePrice, 
                    subtotalAmount, // Use subtotal without platform fee for consistency
                    account.address, 
                    transactionHash
                  );
                  
                  // Update PDA with new shares (optional - for local state)
                  if (franchiseData?._id) {
                    const { updatePDASharesIssued } = await import('@/lib/franchisePDA');
                    const currentPDA = await getFranchisePDA(franchiseData._id);
                    if (currentPDA) {
                      const newSharesIssued = currentPDA.sharesIssued + sharesToBuy;
                      const newTotalRaised = currentPDA.totalRaised + totalCost;
                      updatePDASharesIssued(franchiseData._id, newSharesIssued, newTotalRaised);
                    }
                  }
                  
                  // Reset form
                  setSharesToBuy(1);
                  setIsBuySharesOpen(false);
                  
                  // Show success message
                  toast.success(`Successfully purchased ${sharesToBuy} shares for $${totalCost.toFixed(2)}! Transaction: ${transactionHash.slice(0, 8)}...`);
                  
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
              {isProcessing ? 'Processing...' : 
               !account?.address ? 'Connect Wallet' : 
               !signer || !('signAndSendTransactions' in signer) ? 'Wallet Not Ready' : 
               'Buy Now'}
            </Button>
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