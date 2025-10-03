// UI component types
import type { FranchiseStage } from "./database";

// Tab types for franchise cards
export type FranchiseTabType = "fund" | "launch" | "live";

// Franchise card props
export interface FranchiseCardProps {
  type: FranchiseTabType;
  stage?: FranchiseStage;
  title: string;
  industry: string;
  industryName?: string; // Resolved industry name
  category: string;
  categoryName?: string; // Resolved category name
  price: number;
  image: string;
  logo: string;
  size?: string | number;
  returnRate?: string | number;
  investorsCount?: number;
  address?: string; // Franchise address
  buildingName?: string; // Building name
  doorNumber?: string; // Door number
  
  // Investment data
  totalInvestment?: number;
  totalInvested?: number;
  sharesIssued?: number;
  sharesPurchased?: number;
  
  // Legacy props for backward compatibility
  fundingGoal?: number;
  fundingProgress?: number;
  
  // Launching specific props
  startDate?: string;
  endDate?: string;
  launchProgress?: number;
  
  // Outlets specific props
  currentBalance?: number;
  totalBudget?: number;
  activeOutlets?: number;
  
  id: string;
  brandSlug?: string;
  franchiseSlug?: string;
}

// Franchise card with data props
export interface FranchiseCardWithDataProps {
  franchise: FranchiseDisplayData;
  activeTab: FranchiseTabType;
}

// Display data for franchise cards (simplified for UI)
export interface FranchiseDisplayData {
  _id: string;
  title: string;
  industry: string;
  category: string;
  logo: string;
  images: string[];
  price: number;
  squareFeet?: number;
  returnRate?: string | number;
  stage?: FranchiseStage;
  type: FranchiseTabType;
  
  // Location and timing
  location?: string; // Address field
  buildingName?: string; // Building name
  doorNumber?: string; // Door number
  availableFrom?: string;
  minimumInvestment?: number;
  yearBuilt?: number;
  
  // Investment display data
  fundingGoal?: number;
  fundingProgress?: number;
  investorsCount?: number;
  
  // Launching data
  startDate?: string;
  endDate?: string;
  launchProgress?: number;
  
  // Outlets data
  currentBalance?: number;
  totalBudget?: number;
  activeOutlets?: number;
  projectedAnnualYield?: number;
}

// Wallet component props
export interface WalletProps {
  onAddMoney?: () => void;
  className?: string;
  franchiseId?: string;
  business?: {
    name: string;
    logoUrl?: string;
  };
}

// Franchise store props
export interface FranchiseStoreProps {
  franchiseId?: string;
  franchiserId?: string;
}

// Tab configuration
export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

// Tab ID type for franchise store
export type TabId = 'products' | 'franchise' | 'franchisee' | 'finances';

// Product interface for franchise store
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

// Franchisee interface for franchise store
export interface Franchisee {
  id: string;
  fullName: string;
  walletId: string;
  avatar: string;
  totalShares: number;
  totalInvested: number;
  totalEarned?: number; // Total amount earned from investment
  isOfferActive: boolean;
  joinDate: string;
}

// Budget item interface
export interface BudgetItem {
  id: string;
  category: string;
  type: 'one-time' | 'recurring';
  planned: number;
  actual: number;
  status: 'on-track' | 'over-budget' | 'under-budget' | 'not-started';
}

// Monthly revenue interface
export interface MonthlyRevenue {
  month: string;
  estimated: number;
  actual: number;
  status: 'on-track' | 'below-target' | 'above-target';
}

// Form validation types
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  data?: unknown;
}

// Pagination
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

// Search filters
export interface SearchFilters {
  query?: string;
  industry?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  stage?: FranchiseStage;
  sortBy?: 'price' | 'date' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// Modal props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Alert types
export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onClose?: () => void;
  duration?: number;
}

// Progress bar props
export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

// Stage indicator props
export interface StageIndicatorProps {
  stage: FranchiseStage;
  progress?: number;
  className?: string;
  showProgress?: boolean;
}

// Stage progress props
export interface StageProgressProps {
  currentStage: FranchiseStage;
  className?: string;
  milestones?: Array<{
    id: string;
    name: string;
    isCompleted: boolean;
  }>;
}
