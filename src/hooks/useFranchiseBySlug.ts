import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface FranchiseData {
  franchiser: {
    _id: Id<"franchiser">;
    ownerUserId: Id<"userProfiles">;
    logoUrl?: Id<"_storage">;
    name: string;
    slug: string;
    description: string;
    industry: string;
    category: string;
    website?: string;
    interiorImages: Id<"_storage">[];
    status: "draft" | "pending" | "approved" | "rejected";
    createdAt: number;
    updatedAt: number;
  };
  locations: Array<{
    _id: Id<"franchiserLocations">;
    franchiserId: Id<"franchiser">;
    country: string;
    isNationwide: boolean;
    city?: string;
    registrationCertificate: string;
    minArea: number;
    franchiseFee: number;
    setupCost: number;
    workingCapital: number;
    status: "draft" | "active" | "inactive";
    createdAt: number;
  }>;
  products: Array<{
    _id: Id<"franchiserProducts">;
    franchiserId: Id<"franchiser">;
    name: string;
    description?: string;
    cost: number;
    price: number;
    images: Id<"_storage">[];
    category: string;
    status: "draft" | "active" | "archived";
    stockQuantity: number;
    minStockLevel?: number;
    maxStockLevel?: number;
    unit?: string;
    createdAt: number;
  }>;
}

export const useFranchiseBySlug = (slug: string) => {
  const franchiser = useQuery(api.franchises.getFranchiserBySlug, { slug });
  
  const locations = useQuery(
    api.franchises.getFranchiserLocations,
    franchiser ? { franchiserId: franchiser._id } : "skip"
  );
  
  const products = useQuery(
    api.franchises.getFranchiserProducts,
    franchiser ? { franchiserId: franchiser._id } : "skip"
  );

  const isLoading = franchiser === undefined || locations === undefined || products === undefined;
  const error = franchiser === null ? "Franchise not found" : null;

  const franchiseData: FranchiseData | null = franchiser && locations && products ? {
    franchiser,
    locations,
    products
  } : null;

  return {
    franchiseData,
    isLoading,
    error
  };
};
