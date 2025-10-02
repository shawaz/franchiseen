# Types Documentation

This directory contains comprehensive TypeScript type definitions for the FranchiseSeen application. The types are organized into logical modules for better maintainability and reusability.

## File Structure

```
src/types/
├── index.ts           # Main export file
├── database.ts        # Database entity types from Convex
├── investment.ts      # Investment-related types
├── franchise.ts       # Franchise management types
├── ui.ts             # UI component types
├── api.ts            # API request/response types
├── google.maps.d.ts  # Google Maps API types
└── README.md         # This documentation
```

## Type Categories

### 1. Database Types (`database.ts`)

Core entity types that mirror the Convex database schema:

- **Entities**: `Franchiser`, `Franchise`, `Investment`, `FranchiseLocation`, etc.
- **IDs**: `FranchiserId`, `FranchiseId`, `InvestmentId`, etc.
- **Status Enums**: `FranchiseStatus`, `FranchiseStage`, `InvestmentStatus`, etc.
- **Utility Types**: `ContactInfo`, `Coordinates`, `LeaseTerms`, etc.

```typescript
import type { Franchise, Investment, FranchiseId } from "@/types/database";

const franchise: Franchise = {
  _id: "franchise123" as FranchiseId,
  franchiserId: "franchiser456",
  // ... other properties
};
```

### 2. Investment Types (`investment.ts`)

Types for investment tracking and management:

- **Investment Data**: `InvestmentData`, `InvestmentProgress`
- **Analytics**: `InvestmentStats`, `InvestmentAnalytics`
- **Transactions**: `InvestmentTransaction`, `SharePurchaseData`
- **UI Data**: `FranchiseFundraisingData`

```typescript
import type { InvestmentData, FranchiseFundraisingData } from "@/types/investment";

const investmentData: InvestmentData = {
  totalInvestment: 500000,
  totalInvested: 125000,
  sharesIssued: 100000,
  sharesPurchased: 25000,
  // ... other properties
};
```

### 3. Franchise Types (`franchise.ts`)

Types for franchise management and operations:

- **Franchise Data**: `FranchiseWithDetails`, `CreateFranchiseData`
- **Filters**: `FranchiseFilters`, `FranchiseSearchFilters`
- **Analytics**: `FranchiseAnalytics`, `FranchisePerformance`
- **Validation**: `FranchiseValidation`

```typescript
import type { FranchiseWithDetails, CreateFranchiseData } from "@/types/franchise";

const newFranchise: CreateFranchiseData = {
  franchiserId: "franchiser123",
  businessName: "McDonald's Downtown",
  // ... other properties
};
```

### 4. UI Types (`ui.ts`)

Component-specific types for the user interface:

- **Component Props**: `FranchiseCardProps`, `WalletProps`, `FranchiseStoreProps`
- **Display Data**: `FranchiseDisplayData`
- **Form Types**: `ValidationResult`, `LoadingState`
- **Utility Types**: `SearchFilters`, `PaginationProps`

```typescript
import type { FranchiseCardProps, FranchiseDisplayData } from "@/types/ui";

const franchiseCard: FranchiseCardProps = {
  type: "fund",
  stage: "funding",
  title: "McDonald's Downtown",
  industry: "Food & Beverage",
  category: "Fast Food",
  // ... other properties
};
```

### 5. API Types (`api.ts`)

Request and response types for API interactions:

- **Response Wrappers**: `ApiResponse`, `PaginatedResponse`
- **Request Types**: `CreateFranchiseRequest`, `UpdateFranchiseRequest`
- **Error Types**: `ApiError`, `ValidationError`
- **Upload Types**: `FileUploadRequest`, `FileUploadResponse`

```typescript
import type { ApiResponse, GetFranchisesResponse } from "@/types/api";

const response: ApiResponse<FranchiseWithDetails> = {
  success: true,
  data: franchiseData,
};
```

## Usage Examples

### Basic Component Usage

```typescript
import type { FranchiseCardProps } from "@/types/ui";

const MyComponent: React.FC = () => {
  const franchiseProps: FranchiseCardProps = {
    type: "fund",
    title: "Sample Franchise",
    industry: "Food & Beverage",
    category: "Fast Food",
    price: 50000,
    image: "/franchise-image.jpg",
    logo: "/logo.png",
    id: "franchise-123"
  };

  return <FranchiseCard {...franchiseProps} />;
};
```

### Database Operations

```typescript
import type { CreateFranchiseData, FranchiseWithDetails } from "@/types/franchise";

const createNewFranchise = async (data: CreateFranchiseData): Promise<FranchiseWithDetails> => {
  const response = await fetch("/api/franchises", {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  return response.json();
};
```

### Investment Tracking

```typescript
import type { InvestmentProgress, FranchiseFundraisingData } from "@/types/investment";

const trackInvestment = (fundraisingData: FranchiseFundraisingData): InvestmentProgress => {
  return {
    totalInvestment: fundraisingData.totalInvestment,
    totalInvested: fundraisingData.totalInvested,
    sharesIssued: fundraisingData.sharesIssued,
    sharesPurchased: fundraisingData.sharesPurchased,
    progressPercentage: fundraisingData.progressPercentage,
    sharesRemaining: fundraisingData.sharesRemaining,
    isCompleted: fundraisingData.progressPercentage >= 100,
    isActive: fundraisingData.stage === "funding"
  };
};
```

## Type Safety Benefits

1. **Compile-time Validation**: Catch type errors before runtime
2. **IntelliSense Support**: Better autocomplete and documentation
3. **Refactoring Safety**: Safe renaming and restructuring
4. **API Consistency**: Consistent data structures across the app
5. **Database Alignment**: Types match the Convex schema exactly

## Best Practices

1. **Import Specific Types**: Use specific imports instead of wildcard imports
2. **Use Type Guards**: Implement type guards for runtime validation
3. **Extend Base Types**: Create extended types for specific use cases
4. **Document Complex Types**: Add JSDoc comments for complex type definitions
5. **Keep Types Updated**: Update types when database schema changes

## Migration Guide

When updating existing components to use the new types:

1. Replace local interfaces with imported types
2. Update prop types to use the new type definitions
3. Remove duplicate type definitions
4. Update imports to use the new type system
5. Test components to ensure type compatibility

Example migration:

```typescript
// Before
interface FranchiseCardProps {
  title: string;
  price: number;
  // ... other props
}

// After
import type { FranchiseCardProps } from "@/types/ui";
```

## Contributing

When adding new types:

1. Choose the appropriate file based on the type's purpose
2. Follow the existing naming conventions
3. Add JSDoc comments for complex types
4. Update the main index.ts file if needed
5. Add usage examples to this documentation

This type system provides comprehensive coverage of the application's data structures and ensures type safety throughout the codebase.
