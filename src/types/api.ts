// API response types and request types
import type { 
  FranchiseWithDetails, 
  CreateFranchiseData, 
  UpdateFranchiseData,
  FranchiseFilters 
} from "./franchise";
import type { 
  InvestmentData, 
  SharePurchaseData, 
  InvestmentProgress,
  InvestmentStats 
} from "./investment";
import type { 
  Franchiser, 
  FranchiseLocation, 
  FranchiseProduct,
  FranchiseId,
  FranchiserId,
  InvestmentId
} from "./database";

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Franchise API types
export interface GetFranchisesRequest {
  filters?: FranchiseFilters;
  limit?: number;
  offset?: number;
}

export type GetFranchisesResponse = PaginatedResponse<FranchiseWithDetails>;

export type GetFranchiseResponse = ApiResponse<FranchiseWithDetails>;

export type CreateFranchiseRequest = CreateFranchiseData;

export type CreateFranchiseResponse = ApiResponse<FranchiseId>;

export interface UpdateFranchiseRequest {
  franchiseId: FranchiseId;
  data: UpdateFranchiseData;
}

export type UpdateFranchiseResponse = ApiResponse<FranchiseId>;

export interface DeleteFranchiseRequest {
  franchiseId: FranchiseId;
}

export type DeleteFranchiseResponse = ApiResponse<boolean>;

// Investment API types
export interface GetInvestmentRequest {
  franchiseId: FranchiseId;
}

export type GetInvestmentResponse = ApiResponse<InvestmentData>;

export interface CreateInvestmentRequest {
  franchiseId: FranchiseId;
  data: InvestmentData;
}

export type CreateInvestmentResponse = ApiResponse<InvestmentId>;

export interface UpdateInvestmentRequest {
  investmentId: InvestmentId;
  data: Partial<InvestmentData>;
}

export type UpdateInvestmentResponse = ApiResponse<InvestmentId>;

export type PurchaseSharesRequest = SharePurchaseData;

export type PurchaseSharesResponse = ApiResponse<string>;

export type GetInvestmentStatsResponse = ApiResponse<InvestmentStats>;

export interface GetInvestmentProgressRequest {
  franchiseId: FranchiseId;
}

export type GetInvestmentProgressResponse = ApiResponse<InvestmentProgress>;

// Franchiser API types
export interface GetFranchisersRequest {
  status?: "draft" | "pending" | "approved" | "rejected";
  category?: string;
  industry?: string;
  limit?: number;
  offset?: number;
}

export type GetFranchisersResponse = PaginatedResponse<Franchiser>;

export interface GetFranchiserRequest {
  franchiserId: FranchiserId;
}

export type GetFranchiserResponse = ApiResponse<Franchiser>;

export interface CreateFranchiserRequest {
  walletAddress: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  category: string;
  website?: string;
  logoUrl?: string;
  interiorImages?: string[];
}

export type CreateFranchiserResponse = ApiResponse<FranchiserId>;

// Location API types
export interface GetFranchiseLocationsRequest {
  franchiserId: FranchiserId;
}

export type GetFranchiseLocationsResponse = ApiResponse<FranchiseLocation[]>;

export interface CreateFranchiseLocationRequest {
  franchiserId: FranchiserId;
  country: string;
  isNationwide: boolean;
  city?: string;
  registrationCertificate: string;
  minArea: number;
  franchiseFee: number;
  setupCost: number;
  workingCapital: number;
}

export type CreateFranchiseLocationResponse = ApiResponse<string>;

// Product API types
export interface GetFranchiseProductsRequest {
  franchiserId: FranchiserId;
}

export type GetFranchiseProductsResponse = ApiResponse<FranchiseProduct[]>;

export interface CreateFranchiseProductRequest {
  franchiserId: FranchiserId;
  name: string;
  description?: string;
  cost: number;
  price: number;
  images: string[];
  category: string;
}

export type CreateFranchiseProductResponse = ApiResponse<string>;

// Search API types
export interface SearchFranchisesRequest {
  query: string;
  filters?: FranchiseFilters;
  limit?: number;
  offset?: number;
}

export type SearchFranchisesResponse = PaginatedResponse<FranchiseWithDetails>;

export interface SearchFranchisersRequest {
  query: string;
  industry?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export type SearchFranchisersResponse = PaginatedResponse<Franchiser>;

// Analytics API types
export interface GetFranchiseAnalyticsRequest {
  franchiserId?: FranchiserId;
  dateRange?: {
    start: number;
    end: number;
  };
}

export type GetFranchiseAnalyticsResponse = ApiResponse<{
  totalFranchises: number;
  activeFranchises: number;
  totalInvestment: number;
  totalRaised: number;
  successRate: number;
}>;

export interface GetInvestmentAnalyticsRequest {
  franchiseId?: FranchiseId;
  dateRange?: {
    start: number;
    end: number;
  };
}

export type GetInvestmentAnalyticsResponse = ApiResponse<{
  totalRaised: number;
  totalInvestors: number;
  averageInvestment: number;
  fundingVelocity: number;
  conversionRate: number;
}>;

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
}

export interface ValidationError extends ApiError {
  field: string;
  value: unknown;
  constraint: string;
}

// Upload types
export interface FileUploadRequest {
  file: File;
  type: 'logo' | 'interior' | 'product' | 'document';
  franchiserId?: FranchiserId;
  franchiseId?: FranchiseId;
}

export type FileUploadResponse = ApiResponse<{
  fileId: string;
  url: string;
  size: number;
  type: string;
}>;

// Webhook types
export interface WebhookEvent {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
  signature?: string;
}

export interface InvestmentWebhookEvent extends WebhookEvent {
  type: 'investment.created' | 'investment.updated' | 'investment.completed';
  data: {
    franchiseId: string;
    investmentId: string;
    amount: number;
    investorId: string;
  };
}
