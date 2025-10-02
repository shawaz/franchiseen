// Main types export file
export * from "./database";
export * from "./investment";
export * from "./franchise";
export * from "./ui";
export * from "./api";
export * from "./google.maps";

// Re-export commonly used types for convenience
export type {
  FranchiseWithDetails,
  FranchiseDisplayData,
  FranchiseCardProps,
  FranchiseCardWithDataProps,
  InvestmentData,
  InvestmentProgress,
  FranchiseFundraisingData,
  ApiResponse,
  PaginatedResponse,
} from "./franchise";

export type {
  InvestmentData as Investment,
  InvestmentProgress,
  FranchiseFundraisingData,
  InvestmentStats,
  InvestmentTransaction,
  InvestmentAnalytics,
} from "./investment";

export type {
  FranchiseCardProps,
  FranchiseCardWithDataProps,
  FranchiseDisplayData,
  WalletProps,
  FranchiseStoreProps,
  Product,
  Franchisee,
  BudgetItem,
  MonthlyRevenue,
  ValidationResult,
  LoadingState,
  SearchFilters,
  AlertProps,
  ProgressBarProps,
  StageIndicatorProps,
} from "./ui";

export type {
  GetFranchisesResponse,
  GetFranchiseResponse,
  CreateFranchiseRequest,
  UpdateFranchiseRequest,
  GetInvestmentResponse,
  CreateInvestmentRequest,
  PurchaseSharesRequest,
  GetInvestmentStatsResponse,
  ApiError,
  ValidationError,
} from "./api";
