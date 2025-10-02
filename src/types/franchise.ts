// Franchise-related types
import type { 
  Franchise, 
  Franchiser, 
  Investment, 
  FranchiseLocation, 
  FranchiseProduct,
  FranchiserId,
  FranchiseLocationId,
} from "./database";
import type { InvestmentData, InvestmentProgress } from "./investment";

// Franchise with related data
export interface FranchiseWithDetails extends Franchise {
  franchiser?: Franchiser;
  investment?: Investment;
  location?: FranchiseLocation;
  products?: FranchiseProduct[];
}

// Franchise creation data
export interface CreateFranchiseData {
  franchiserId: FranchiserId;
  franchiseeId: string;
  locationId: FranchiseLocationId;
  franchiseSlug: string;
  businessName: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  buildingName?: string;
  doorNumber?: string;
  sqft: number;
  isOwned: boolean;
  landlordContact?: {
    name: string;
    phone: string;
    email: string;
  };
  franchiseeContact: {
    name: string;
    phone: string;
    email: string;
  };
  investment: InvestmentData;
}

// Franchise update data
export interface UpdateFranchiseData {
  businessName?: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  buildingName?: string;
  doorNumber?: string;
  sqft?: number;
  isOwned?: boolean;
  landlordContact?: {
    name: string;
    phone: string;
    email: string;
  };
  franchiseeContact?: {
    name: string;
    phone: string;
    email: string;
  };
  status?: "pending" | "approved" | "active" | "suspended" | "terminated";
  stage?: "funding" | "launching" | "ongoing" | "closed";
}

// Franchise search filters
export interface FranchiseFilters {
  franchiserId?: FranchiserId;
  franchiseeId?: string;
  status?: "pending" | "approved" | "active" | "suspended" | "terminated";
  stage?: "funding" | "launching" | "ongoing" | "closed";
  location?: {
    country?: string;
    city?: string;
  };
  industry?: string;
  category?: string;
  minInvestment?: number;
  maxInvestment?: number;
  limit?: number;
  offset?: number;
}

// Franchise analytics
export interface FranchiseAnalytics {
  totalFranchises: number;
  activeFranchises: number;
  fundingFranchises: number;
  launchingFranchises: number;
  ongoingFranchises: number;
  totalInvestment: number;
  totalRaised: number;
  averageInvestment: number;
  successRate: number;
  topPerformingFranchises: Array<{
    franchiseId: string;
    businessName: string;
    totalRaised: number;
    progressPercentage: number;
  }>;
}

// Franchise performance metrics
export interface FranchisePerformance {
  franchiseId: string;
  businessName: string;
  stage: "funding" | "launching" | "ongoing" | "closed";
  investmentProgress: InvestmentProgress;
  revenue?: {
    monthly: number;
    yearly: number;
    projected: number;
  };
  expenses?: {
    monthly: number;
    yearly: number;
    projected: number;
  };
  profitability?: {
    monthly: number;
    yearly: number;
    projected: number;
  };
  kpis: {
    customerSatisfaction?: number;
    employeeRetention?: number;
    operationalEfficiency?: number;
  };
}

// Franchise location data
export interface FranchiseLocationData {
  country: string;
  isNationwide: boolean;
  city?: string;
  registrationCertificate: string;
  minArea: number;
  franchiseFee: number;
  setupCost: number;
  workingCapital: number;
  status: "draft" | "active" | "inactive";
}

// Franchise product data
export interface FranchiseProductData {
  name: string;
  description?: string;
  cost: number;
  price: number;
  images: string[];
  category: string;
  status: "draft" | "active" | "archived";
}

// Franchise stage progress
export interface FranchiseStageProgress {
  stage: "funding" | "launching" | "ongoing" | "closed";
  progress: number; // 0-100
  milestones: Array<{
    id: string;
    name: string;
    description: string;
    isCompleted: boolean;
    completedAt?: number;
  }>;
  nextMilestone?: {
    id: string;
    name: string;
    description: string;
    estimatedCompletion: number;
  };
}

// Franchise validation
export interface FranchiseValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredFields: string[];
  missingFields: string[];
}
