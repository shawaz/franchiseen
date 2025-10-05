import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface UseFranchiseWalletProps {
  franchiseId?: Id<"franchises"> | string; // Accept both types for backward compatibility
  franchiseSlug?: string;
  franchiserId?: Id<"franchiser">;
  useDeterministic?: boolean; // For backward compatibility
}

interface FranchiseWallet {
  _id: string;
  franchiseId: Id<"franchises">;
  franchiserId: Id<"franchiser">;
  walletAddress: string;
  publicKey?: string; // For backward compatibility
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended';
  isLoading?: boolean; // For backward compatibility
  franchise?: {
    _id: string;
    franchiseSlug: string;
    title: string;
    stage: string;
  };
  franchiser?: {
    _id: string;
    name: string;
    slug: string;
  };
  recentTransactions?: Array<{
    _id: string;
    type: string;
    amount: number;
    description: string;
    status: string;
    createdAt: number;
  }>;
  transactionCount?: number;
}

interface UseFranchiseWalletReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallet: any;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  refreshBalance?: () => void; // For backward compatibility
}

interface UseFranchiseWalletSingleReturn {
  wallet: FranchiseWallet | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  refreshBalance?: () => void; // For backward compatibility
}

export function useFranchiseWallet({ franchiseId, franchiseSlug, franchiserId }: UseFranchiseWalletProps = {}): UseFranchiseWalletReturn {
  // Get wallet by franchise ID
  const walletById = useQuery(
    api.franchiseManagement.getFranchiseWallet,
    franchiseId ? { franchiseId: franchiseId as Id<"franchises"> } : "skip"
  );

  // Get wallet by franchise slug
  const walletBySlug = useQuery(
    api.franchiseManagement.getFranchiseWalletBySlug,
    franchiseSlug ? { franchiseSlug } : "skip"
  );

  // Get all wallets for franchiser
  const walletsByFranchiser = useQuery(
    api.franchiseManagement.getFranchiseWalletsByFranchiser,
    franchiserId ? { franchiserId } : "skip"
  );

  // Determine which data to return
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wallet: any = null;
  let isLoading = false;
  const error: string | null = null;

  if (franchiseId) {
    wallet = walletById || null;
    isLoading = walletById === undefined;
  } else if (franchiseSlug) {
    wallet = walletBySlug || null;
    isLoading = walletBySlug === undefined;
  } else if (franchiserId) {
    wallet = walletsByFranchiser ? walletsByFranchiser.filter(w => w !== null) : null;
    isLoading = walletsByFranchiser === undefined;
  }

  // Mock refetch function (Convex handles this automatically)
  const refetch = () => {
    // Convex queries automatically refetch when dependencies change
  };

  const refreshBalance = () => {
    // For backward compatibility - same as refetch
    refetch();
  };

  // Add compatibility properties to wallet if it exists
  // For franchiseId queries, we expect a single wallet object, not an array
  const walletWithCompatibility = wallet && !Array.isArray(wallet) ? {
    ...wallet,
    publicKey: wallet.walletAddress, // Use walletAddress as publicKey for compatibility
    isLoading: isLoading
  } : null;

  return {
    wallet: walletWithCompatibility,
    isLoading,
    error,
    refetch,
    refreshBalance
  };
}

// Hook specifically for single franchise wallet (for backward compatibility)
export function useFranchiseWalletSingle({ franchiseId, franchiseSlug, useDeterministic }: { franchiseId?: string; franchiseSlug?: string; useDeterministic?: boolean } = {}): UseFranchiseWalletSingleReturn {
  const { wallet, isLoading, error, refetch, refreshBalance } = useFranchiseWallet({ franchiseId, franchiseSlug, useDeterministic });
  
  return {
    wallet: Array.isArray(wallet) ? null : wallet,
    isLoading,
    error,
    refetch,
    refreshBalance
  };
}

// Hook specifically for franchise wallet transactions
export function useFranchiseWalletTransactions(franchiseId?: Id<"franchises">, limit?: number) {
  const transactions = useQuery(
    api.franchiseManagement.getFranchiseWalletTransactions,
    franchiseId ? { franchiseId, limit } : "skip"
  );

  return {
    transactions: transactions || [],
    isLoading: transactions === undefined,
    error: null
  };
}