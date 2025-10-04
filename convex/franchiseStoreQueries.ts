import { query } from "./_generated/server";
import { v } from "convex/values";

// Get franchiser products for a franchise by slug
export const getFranchiserProductsByFranchiseSlug = query({
  args: { franchiseSlug: v.string() },
  handler: async (ctx, { franchiseSlug }) => {
    // Get the franchise by slug first
    const franchise = await ctx.db
      .query("franchises")
      .withIndex("by_slug", (q) => q.eq("franchiseSlug", franchiseSlug))
      .first();
    
    if (!franchise) return [];
    
    // Get franchiser products
    const products = await ctx.db
      .query("franchiserProducts")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchise.franchiserId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    
    // Get all product categories to resolve category names
    const allCategories = await ctx.db
      .query("productCategories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    // Create a map of category ID to name
    const categoryMap = new Map();
    allCategories.forEach(category => {
      categoryMap.set(category._id, category.name);
    });
    
    // Resolve category names for products
    const productsWithCategoryNames = products.map(product => ({
      ...product,
      categoryName: categoryMap.get(product.category) || product.category
    }));
    
    return productsWithCategoryNames;
  },
});

// Get franchiser details for a franchise by slug
export const getFranchiserDetailsByFranchiseSlug = query({
  args: { franchiseSlug: v.string() },
  handler: async (ctx, { franchiseSlug }) => {
    // Get the franchise by slug first
    const franchise = await ctx.db
      .query("franchises")
      .withIndex("by_slug", (q) => q.eq("franchiseSlug", franchiseSlug))
      .first();
    
    if (!franchise) return null;
    
    // Get franchiser details
    const franchiser = await ctx.db.get(franchise.franchiserId);
    if (!franchiser) return null;
    
    // Get franchiser locations
    const locations = await ctx.db
      .query("franchiserLocations")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchise.franchiserId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    
    // Resolve industry and category names if they are IDs
    let industryName = franchiser.industry;
    let categoryName = franchiser.category;
    
    // Try to resolve industry name if it's an ID
    if (franchiser.industry && (franchiser.industry.startsWith('j') || franchiser.industry.startsWith('k'))) {
      try {
        const industry = await ctx.db.get(franchiser.industry as any);
        if (industry && 'name' in industry) {
          industryName = (industry as any).name;
        }
      } catch (e) {
        console.log("Could not fetch industry:", e);
      }
    }
    
    // Try to resolve category name if it's an ID
    if (franchiser.category && (franchiser.category.startsWith('j') || franchiser.category.startsWith('k'))) {
      try {
        const category = await ctx.db.get(franchiser.category as any);
        if (category && 'name' in category) {
          categoryName = (category as any).name;
        }
      } catch (e) {
        console.log("Could not fetch category:", e);
      }
    }
    
    return {
      ...franchiser,
      industryName,
      categoryName,
      locations
    };
  },
});

// Get investors for a franchise by slug with aggregated data
export const getFranchiseInvestorsBySlug = query({
  args: { franchiseSlug: v.string() },
  handler: async (ctx, { franchiseSlug }) => {
    // Get the franchise by slug first
    const franchise = await ctx.db
      .query("franchises")
      .withIndex("by_slug", (q) => q.eq("franchiseSlug", franchiseSlug))
      .first();
    
    if (!franchise) return [];
    
    const franchiseId = franchise._id;

    // Get all confirmed shares for this franchise
    const shares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    // Group shares by investor and aggregate data
    const investorMap = new Map();
    
    shares.forEach(share => {
      const investorId = share.investorId;
      if (!investorMap.has(investorId)) {
        investorMap.set(investorId, {
          investorId,
          totalShares: 0,
          totalInvested: 0,
          firstPurchaseDate: share.purchasedAt,
          lastPurchaseDate: share.purchasedAt,
          transactions: []
        });
      }
      
      const investor = investorMap.get(investorId);
      investor.totalShares += share.sharesPurchased;
      investor.totalInvested += share.totalAmount;
      investor.firstPurchaseDate = Math.min(investor.firstPurchaseDate, share.purchasedAt);
      investor.lastPurchaseDate = Math.max(investor.lastPurchaseDate, share.purchasedAt);
      investor.transactions.push(share);
    });

    // Convert map to array and get user profile data for each investor
    const investors = await Promise.all(
      Array.from(investorMap.values()).map(async (investor) => {
        // Get user profile by wallet address
        const userProfile = await ctx.db
          .query("userProfiles")
          .withIndex("by_walletAddress", (q) => q.eq("walletAddress", investor.investorId))
          .first();

        return {
          ...investor,
          firstPurchaseDate: new Date(investor.firstPurchaseDate).toISOString().split('T')[0],
          lastPurchaseDate: new Date(investor.lastPurchaseDate).toISOString().split('T')[0],
          // Calculate earned amount (simplified - in real app this would be based on franchise performance)
          totalEarned: investor.totalInvested * 0.1, // 10% return for demo
          // Add user profile data
          userProfile: userProfile ? {
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            avatar: userProfile.avatar,
            email: userProfile.email
          } : null
        };
      })
    );

    // Sort by total invested (descending)
    return investors.sort((a, b) => b.totalInvested - a.totalInvested);
  },
});
