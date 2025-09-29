import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface UseFranchisersByLocationProps {
  country?: string;
  city?: string;
  industry?: string;
  enabled?: boolean;
}

export const useFranchisersByLocation = ({
  country,
  city,
  industry,
  enabled = true
}: UseFranchisersByLocationProps) => {
  const franchisers = useQuery(
    api.franchises.getFranchisersByLocation,
    enabled && country ? { country, city, industry } : "skip"
  );

  return {
    franchisers: franchisers || [],
    isLoading: franchisers === undefined,
    error: null
  };
};
