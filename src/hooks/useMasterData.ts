import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

// ===== COUNTRIES =====

export function useCountries() {
  return useQuery(api.masterData.getAllCountries);
}

export function useCountryByCode(code: string) {
  return useQuery(api.masterData.getCountryByCode, { code });
}

export function useCreateCountry() {
  return useMutation(api.masterData.createCountry);
}

export function useCreateMultipleCountries() {
  return useMutation(api.masterData.createMultipleCountries);
}

// ===== CITIES =====

export function useCitiesByCountry(countryId: Id<"countries">) {
  return useQuery(api.masterData.getCitiesByCountry, { countryId });
}

export function useCitiesByCountryCode(countryCode: string) {
  return useQuery(api.masterData.getCitiesByCountryCode, { countryCode });
}

export function useCreateCity() {
  return useMutation(api.masterData.createCity);
}

export function useCreateMultipleCities() {
  return useMutation(api.masterData.createMultipleCities);
}

// ===== INDUSTRIES =====

export function useIndustries() {
  return useQuery(api.masterData.getAllIndustries);
}

export function useCreateIndustry() {
  return useMutation(api.masterData.createIndustry);
}

export function useCreateMultipleIndustries() {
  return useMutation(api.masterData.createMultipleIndustries);
}

// ===== CATEGORIES =====

export function useCategoriesByIndustry(industryId: Id<"industries">) {
  return useQuery(api.masterData.getCategoriesByIndustry, { industryId });
}

export function useAllCategories() {
  return useQuery(api.masterData.getAllCategories);
}

export function useCategoryById(categoryId: Id<"categories"> | undefined) {
  return useQuery(
    api.masterData.getCategoryById,
    categoryId ? { categoryId } : "skip"
  );
}

export function useCategoriesByIds(categoryIds: Id<"categories">[]) {
  return useQuery(
    api.masterData.getCategoriesByIds,
    categoryIds.length > 0 ? { categoryIds } : "skip"
  );
}

export function useCreateCategory() {
  return useMutation(api.masterData.createCategory);
}

export function useCreateMultipleCategories() {
  return useMutation(api.masterData.createMultipleCategories);
}

// ===== PRODUCT CATEGORIES =====

export function useProductCategoriesByCategory(categoryId: Id<"categories">) {
  return useQuery(api.masterData.getProductCategoriesByCategory, { categoryId });
}

export function useProductCategoriesByIndustry(industryId: Id<"industries">) {
  return useQuery(api.masterData.getProductCategoriesByIndustry, { industryId });
}

export function useAllProductCategories() {
  return useQuery(api.masterData.getAllProductCategories);
}

export function useCreateProductCategory() {
  return useMutation(api.masterData.createProductCategory);
}

export function useCreateMultipleProductCategories() {
  return useMutation(api.masterData.createMultipleProductCategories);
}

// ===== UTILITY HOOKS =====

export function useMasterData() {
  const countries = useCountries();
  const industries = useIndustries();
  const categories = useAllCategories();
  const productCategories = useAllProductCategories();

  return {
    countries,
    industries,
    categories,
    productCategories,
    isLoading: !countries || !industries || !categories || !productCategories,
  };
}

export function useHierarchicalData() {
  const industries = useIndustries();
  const categories = useAllCategories();
  const productCategories = useAllProductCategories();

  // Build hierarchical structure
  const hierarchicalData = industries?.map(industry => ({
    ...industry,
    categories: categories?.filter(cat => cat.industryId === industry._id).map(category => ({
      ...category,
      productCategories: productCategories?.filter(pc => pc.categoryId === category._id)
    }))
  }));

  return {
    hierarchicalData,
    isLoading: !industries || !categories || !productCategories,
  };
}
