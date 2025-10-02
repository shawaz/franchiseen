import { useState, useEffect, useCallback, useRef } from 'react';
import { useFranchiseWallet } from './useFranchiseWallet';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface FranchiseFundraisingData {
  totalInvestment: number;
  invested: number;
  totalShares: number;
  sharesIssued: number;
  sharesRemaining: number;
  pricePerShare: number;
  franchiseFee: number;
  setupCost: number;
  workingCapital: number;
  progressPercentage: number;
  stage?: 'funding' | 'launching' | 'ongoing' | 'closed';
}

interface UseFranchiseFundraisingProps {
  franchiseId?: string; // Can be either franchise slug or Convex document ID
  franchiserId?: string;
  initialData?: Partial<FranchiseFundraisingData>;
}

export function useFranchiseFundraising({ 
  franchiseId, 
  franchiserId, 
  initialData 
}: UseFranchiseFundraisingProps = {}) {
  
  // Load real fundraising data from Convex
  // Check if franchiseId is a Convex document ID (starts with 'j') or a slug
  const isConvexId = franchiseId && franchiseId.startsWith('j');
  
  console.log('useFranchiseFundraising - franchiseId:', franchiseId);
  console.log('useFranchiseFundraising - isConvexId:', isConvexId);
  
  const convexFundraisingData = useQuery(
    isConvexId 
      ? api.franchiseManagement.getFranchiseFundraisingDataById
      : api.franchiseManagement.getFranchiseFundraisingData,
    franchiseId 
      ? (isConvexId 
          ? { franchiseId: franchiseId as string }
          : { franchiseSlug: franchiseId }
        )
      : "skip"
  );
  
  console.log('useFranchiseFundraising - convexFundraisingData:', convexFundraisingData);
  
  const [fundraisingData, setFundraisingData] = useState<FranchiseFundraisingData>({
    totalInvestment: 0,
    invested: 0,
    totalShares: 0,
    sharesIssued: 0,
    sharesRemaining: 0,
    pricePerShare: 1,
    franchiseFee: 0,
    setupCost: 0,
    workingCapital: 0,
    progressPercentage: 0,
    ...initialData
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store initial data to avoid circular dependency
  const initialDataRef = useRef(initialData);
  
  // Use ref to store the latest loadFundraisingData function
  const loadFundraisingDataRef = useRef<() => Promise<void>>();

  // Get wallet data for balance
  const { wallet } = useFranchiseWallet({
    franchiseId,
    franchiserId,
    useDeterministic: true
  });

  // Purchase shares mutation
  const purchaseShares = useMutation(api.franchiseManagement.purchaseShares);

  // Update fundraising data when Convex data loads
  useEffect(() => {
    if (convexFundraisingData) {
      console.log('Updating fundraising data from Convex:', {
        franchiseId,
        convexData: convexFundraisingData,
        invested: convexFundraisingData.invested,
        sharesIssued: convexFundraisingData.sharesIssued
      });
      
      setFundraisingData({
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
        stage: convexFundraisingData.stage as 'funding' | 'launching' | 'live'
      });
    }
  }, [convexFundraisingData, franchiseId]);

  // Load fundraising data from localStorage or API
  const loadFundraisingData = useCallback(async () => {
    if (!franchiseId) return;

    setIsLoading(true);
    setError(null);

    try {
      // If we have Convex data, use it as the source of truth
      if (convexFundraisingData) {
        console.log('Using Convex fundraising data:', convexFundraisingData);
        return; // The useEffect above will handle setting the data
      }

      // Only use localStorage as fallback if no Convex data is available
      const storedData = localStorage.getItem(`franchise_fundraising_${franchiseId}`);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setFundraisingData(parsedData);
        console.log('Loaded fundraising data from localStorage:', parsedData);
      } else {
        // If no stored data, use initial data or create default
        const defaultData = {
          totalInvestment: 100000,
          invested: 0,
          totalShares: 100000,
          sharesIssued: 0,
          sharesRemaining: 100000,
          pricePerShare: 1,
          franchiseFee: 20000,
          setupCost: 50000,
          workingCapital: 30000,
          progressPercentage: 0,
          stage: 'funding' as const,
          // Apply initial data overrides if provided
          ...(initialDataRef.current || {})
        };
        
        setFundraisingData(defaultData);
        // Store the default data
        localStorage.setItem(`franchise_fundraising_${franchiseId}`, JSON.stringify(defaultData));
      }
    } catch (err) {
      console.error('Error loading fundraising data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load fundraising data');
    } finally {
      setIsLoading(false);
    }
  }, [franchiseId, convexFundraisingData]);

  // Store the latest loadFundraisingData function in ref
  loadFundraisingDataRef.current = loadFundraisingData;

  // Update fundraising data
  const updateFundraisingData = useCallback((updates: Partial<FranchiseFundraisingData>) => {
    setFundraisingData(prev => {
      const newData = { ...prev, ...updates };
      
      // Recalculate derived values
      newData.sharesRemaining = newData.totalShares - newData.sharesIssued;
      newData.progressPercentage = newData.totalShares > 0 ? (newData.sharesIssued / newData.totalShares) * 100 : 0;
      newData.invested = newData.sharesIssued * newData.pricePerShare;
      
      // Store updated data
      if (franchiseId) {
        localStorage.setItem(`franchise_fundraising_${franchiseId}`, JSON.stringify(newData));
      }
      
      return newData;
    });
  }, [franchiseId]);

  // Add investment (when someone buys shares) - now uses real Convex mutation
  const addInvestment = useCallback(async (sharesPurchased: number, sharePrice: number, totalAmount: number, investorId: string, transactionHash?: string) => {
    if (!franchiseId) {
      throw new Error('Franchise ID is required');
    }

    try {
      // Record the purchase in Convex using franchise ID
      await purchaseShares({
        franchiseId: franchiseId as string,
        investorId,
        sharesPurchased,
        sharePrice,
        totalAmount,
        transactionHash
      });

      // Update local state optimistically
      setFundraisingData(prev => {
        const newData = {
          ...prev,
          sharesIssued: prev.sharesIssued + sharesPurchased,
          invested: prev.invested + totalAmount,
          sharesRemaining: prev.totalShares - (prev.sharesIssued + sharesPurchased),
          progressPercentage: ((prev.sharesIssued + sharesPurchased) / prev.totalShares) * 100
        };
        
        console.log('Added investment:', { sharesPurchased, totalAmount, newData });
        return newData;
      });
    } catch (error) {
      console.error('Failed to record share purchase:', error);
      throw error;
    }
  }, [franchiseId, purchaseShares]);

  // Initialize fundraising data
  useEffect(() => {
    if (franchiseId && loadFundraisingDataRef.current) {
      loadFundraisingDataRef.current();
    }
  }, [franchiseId]); // Stable dependency array

  // Note: PDA data loading removed - now using real Convex data from franchiseShares table

  return {
    fundraisingData,
    isLoading,
    error,
    updateFundraisingData,
    addInvestment,
    refreshData: loadFundraisingData
  };
}
