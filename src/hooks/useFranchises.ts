import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useFranchises() {
  return useQuery(api.franchises.getAllFranchisers);
}

export function useFranchiserBySlug(slug: string) {
  return useQuery(api.franchises.getFranchiserBySlug, { slug });
}

export function useFranchiserByWallet(walletAddress: string) {
  return useQuery(api.franchises.getFranchiserByWallet, { walletAddress });
}

export function useAllFranchisersByWallet(walletAddress: string) {
  return useQuery(api.franchises.getAllFranchisersByWallet, { walletAddress });
}

export function useFranchiserLocations(franchiserId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery(api.franchises.getFranchiserLocations, { franchiserId } as any);
}

export function useFranchiserProducts(franchiserId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery(api.franchises.getFranchiserProducts, { franchiserId } as any);
}

export function useFranchisersByStatus(status: "draft" | "pending" | "approved" | "rejected") {
  return useQuery(api.franchises.getFranchisersByStatus, { status });
}

export function useFranchisersByCategory(category: string) {
  return useQuery(api.franchises.getFranchisersByCategory, { category });
}

export function useSearchFranchises(searchTerm: string) {
  return useQuery(api.franchises.searchFranchisers, { searchTerm });
}

// Get franchises with stage data
export function useFranchisesWithStages() {
  return useQuery(api.franchiseManagement.getFranchises, { limit: 50 });
}

export function useFranchisesByStage(stage: "funding" | "launching" | "ongoing" | "closed") {
  return useQuery(api.franchiseManagement.getFranchisesByStage, { stage, limit: 50 });
}

// Get fundraising data for a specific franchise
export function useFranchiseFundraisingData(franchiseSlug: string) {
  return useQuery(api.franchiseManagement.getFranchiseFundraisingData, 
    franchiseSlug ? { franchiseSlug } : "skip"
  );
}

// Mutations
export function useCreateFranchiser() {
  return useMutation(api.franchises.createFranchiser);
}

export function useCreateFranchiserWithDetails() {
  return useMutation(api.franchises.createFranchiserWithDetails);
}

export function useUpdateFranchiser() {
  return useMutation(api.franchises.updateFranchiser);
}

export function useCreateFranchiserLocation() {
  return useMutation(api.franchises.createFranchiserLocation);
}

export function useCreateFranchiserProduct() {
  return useMutation(api.franchises.createFranchiserProduct);
}
