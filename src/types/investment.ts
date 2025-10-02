// Investment-related types
import type { Investment, FranchiseShare, Invoice, InvestmentId, FranchiseShareId, InvoiceId } from "./database";

// Investment data structure
export interface InvestmentData {
  totalInvestment: number;
  totalInvested: number;
  sharesIssued: number;
  sharesPurchased: number;
  sharePrice: number;
  franchiseFee: number;
  setupCost: number;
  workingCapital: number;
  minimumInvestment: number;
  maximumInvestment?: number;
  expectedReturn?: number;
  investmentStartDate?: number;
  investmentEndDate?: number;
}

// Investment with franchise details
export interface InvestmentWithFranchise extends Investment {
  franchise?: {
    _id: string;
    franchiseSlug: string;
    businessName: string;
    franchiserId: string;
  };
}

// Share purchase data
export interface SharePurchaseData {
  franchiseId: string;
  investorId: string;
  sharesPurchased: number;
  sharePrice: number;
  totalAmount: number;
  transactionHash?: string;
}

// Investment progress tracking
export interface InvestmentProgress {
  totalInvestment: number;
  totalInvested: number;
  sharesIssued: number;
  sharesPurchased: number;
  progressPercentage: number;
  sharesRemaining: number;
  isCompleted: boolean;
  isActive: boolean;
}

// Investment statistics
export interface InvestmentStats {
  totalInvestment: number;
  totalInvested: number;
  totalSharesIssued: number;
  totalSharesPurchased: number;
  activeInvestments: number;
  completedInvestments: number;
  totalFranchises: number;
  averageInvestment: number;
  fundingProgress: number;
}

// Franchise fundraising data (used in components)
export interface FranchiseFundraisingData {
  franchiseId: string;
  totalInvestment: number;
  totalInvested: number;
  totalShares: number;
  sharesIssued: number;
  sharesPurchased: number;
  sharesRemaining: number;
  invested: number;
  progressPercentage: number;
  sharePrice: number;
  franchiseFee: number;
  setupCost: number;
  workingCapital: number;
  stage: "funding" | "launching" | "ongoing" | "closed";
  shares: FranchiseShare[];
}

// Investment transaction
export interface InvestmentTransaction {
  id: string;
  franchiseId: string;
  investorId: string;
  sharesPurchased: number;
  sharePrice: number;
  totalAmount: number;
  transactionHash?: string;
  status: "pending" | "confirmed" | "failed";
  timestamp: number;
}

// Investment analytics
export interface InvestmentAnalytics {
  totalRaised: number;
  totalInvestors: number;
  averageInvestment: number;
  fundingVelocity: number; // Amount raised per day
  conversionRate: number; // Percentage of visitors who invest
  topInvestors: Array<{
    investorId: string;
    totalInvested: number;
    sharesOwned: number;
  }>;
}

// Investment milestones
export interface InvestmentMilestone {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  percentage: number;
  isReached: boolean;
  reachedAt?: number;
}

// Investment tier
export interface InvestmentTier {
  id: string;
  name: string;
  minimumAmount: number;
  maximumAmount?: number;
  benefits: string[];
  sharePrice: number;
  isActive: boolean;
}
