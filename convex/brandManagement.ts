import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all brands with pagination and filtering
export const getBrands = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
    category: v.optional(v.string()),
    industry: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 50, status, category, industry, search }) => {
    let query = ctx.db.query("franchiser");

    // Apply filters
    if (status) {
      query = query.filter((q) => q.eq(q.field("status"), status));
    }

    if (category) {
      query = query.filter((q) => q.eq(q.field("category"), category));
    }

    if (industry) {
      query = query.filter((q) => q.eq(q.field("industry"), industry));
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      query = query.filter((q) => 
        q.or(
          q.eq(q.field("name"), searchTerm),
          q.eq(q.field("description"), searchTerm),
          q.eq(q.field("slug"), searchTerm)
        )
      );
    }

    const brands = await query
      .order("desc")
      .take(limit);

    // Get all categories and industries for lookup
    const [allCategories, allIndustries] = await Promise.all([
      ctx.db.query("categories").collect(),
      ctx.db.query("industries").collect(),
    ]);

    // Create lookup maps - franchiser stores industry/category as IDs, 
    // we need to map by ID to get the names
    const categoryMap = new Map(allCategories.map(cat => [cat._id, cat.name]));
    const industryMap = new Map(allIndustries.map(ind => [ind._id, ind.name]));

    // Get additional details for each brand
    const brandsWithDetails = await Promise.all(
      brands.map(async (brand) => {
        // Get franchise count for this brand
        const franchises = await ctx.db
          .query("franchises")
          .withIndex("by_franchiser", (q) => q.eq("franchiserId", brand._id))
          .collect();

        // Get location count
        const locations = await ctx.db
          .query("franchiserLocations")
          .withIndex("by_franchiser", (q) => q.eq("franchiserId", brand._id))
          .collect();

        // Get product count
        const products = await ctx.db
          .query("franchiserProducts")
          .withIndex("by_franchiser", (q) => q.eq("franchiserId", brand._id))
          .collect();

        return {
          ...brand,
          categoryName: categoryMap.get(brand.category as any) || brand.category,
          industryName: industryMap.get(brand.industry as any) || brand.industry,
          franchiseCount: franchises.length,
          locationCount: locations.length,
          productCount: products.length,
        };
      })
    );

    return brandsWithDetails;
  },
});

// Get brand statistics
export const getBrandStats = query({
  args: {},
  handler: async (ctx) => {
    const allBrands = await ctx.db.query("franchiser").collect();
    
    const stats = {
      total: allBrands.length,
      draft: allBrands.filter(b => b.status === "draft").length,
      pending: allBrands.filter(b => b.status === "pending").length,
      approved: allBrands.filter(b => b.status === "approved").length,
      rejected: allBrands.filter(b => b.status === "rejected").length,
    };

    return stats;
  },
});

// Get brand by ID with full details
export const getBrandById = query({
  args: { id: v.id("franchiser") },
  handler: async (ctx, args) => {
    const brand = await ctx.db.get(args.id);
    if (!brand) return null;

    // Get associated data
    const [locations, products, franchises] = await Promise.all([
      ctx.db
        .query("franchiserLocations")
        .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.id))
        .collect(),
      ctx.db
        .query("franchiserProducts")
        .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.id))
        .collect(),
      ctx.db
        .query("franchises")
        .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.id))
        .collect(),
    ]);

    return {
      ...brand,
      locations,
      products,
      franchises,
    };
  },
});

// Create a new brand
export const createBrand = mutation({
  args: {
    ownerUserId: v.id("users"),
    brandWalletAddress: v.string(),
    logoUrl: v.optional(v.id("_storage")),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    industry: v.string(),
    category: v.string(),
    website: v.optional(v.string()),
    interiorImages: v.array(v.id("_storage")),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if slug already exists
    const existingBrand = await ctx.db
      .query("franchiser")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();
    
    if (existingBrand) {
      throw new Error("Brand slug already exists");
    }

    return await ctx.db.insert("franchiser", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update brand
export const updateBrand = mutation({
  args: {
    id: v.id("franchiser"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    industry: v.optional(v.string()),
    category: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.id("_storage")),
    interiorImages: v.optional(v.array(v.id("_storage"))),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    // If updating slug, check if it already exists
    if (updateData.slug) {
      const existingBrand = await ctx.db
        .query("franchiser")
        .filter((q) => q.eq(q.field("slug"), updateData.slug))
        .first();
      
      if (existingBrand && existingBrand._id !== id) {
        throw new Error("Brand slug already exists");
      }
    }
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(id, {
      ...cleanUpdateData,
      updatedAt: Date.now(),
    });
    
    return id;
  },
});

// Delete brand
export const deleteBrand = mutation({
  args: { id: v.id("franchiser") },
  handler: async (ctx, args) => {
    // Check if brand has active franchises
    const franchises = await ctx.db
      .query("franchises")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.id))
      .collect();

    if (franchises.length > 0) {
      throw new Error("Cannot delete brand with active franchises");
    }

    // Delete associated locations
    const locations = await ctx.db
      .query("franchiserLocations")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.id))
      .collect();
    
    for (const location of locations) {
      await ctx.db.delete(location._id);
    }
    
    // Delete associated products
    const products = await ctx.db
      .query("franchiserProducts")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.id))
      .collect();
    
    for (const product of products) {
      await ctx.db.delete(product._id);
    }
    
    // Delete the brand
    await ctx.db.delete(args.id);
    
    return args.id;
  },
});

// Update brand status
export const updateBrandStatus = mutation({
  args: {
    id: v.id("franchiser"),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    
    return args.id;
  },
});

// Approve brand (set status to approved)
export const approveBrand = mutation({
  args: {
    id: v.id("franchiser"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "approved",
      updatedAt: Date.now(),
    });
    
    return args.id;
  },
});

// Get brands by category
export const getBrandsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiser")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

// Get brands by industry
export const getBrandsByIndustry = query({
  args: { industry: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiser")
      .filter((q) => q.eq(q.field("industry"), args.industry))
      .collect();
  },
});

// Search brands
export const searchBrands = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { searchTerm, limit = 20 }) => {
    const search = searchTerm.toLowerCase();
    
    return await ctx.db
      .query("franchiser")
      .filter((q) => 
        q.or(
          q.eq(q.field("name"), search),
          q.eq(q.field("description"), search),
          q.eq(q.field("slug"), search),
          q.eq(q.field("industry"), search),
          q.eq(q.field("category"), search)
        )
      )
      .take(limit);
  },
});

// Get brand analytics
export const getBrandAnalytics = query({
  args: { id: v.id("franchiser") },
  handler: async (ctx, args) => {
    const brand = await ctx.db.get(args.id);
    if (!brand) return null;

    // Get franchise data
    const franchises = await ctx.db
      .query("franchises")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.id))
      .collect();

    // Get investment data
    const franchiseIds = franchises.map(f => f._id);
    const investments = await Promise.all(
      franchiseIds.map(id => 
        ctx.db
          .query("investments")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", id))
          .first()
      )
    );

    const totalInvestment = investments
      .filter((inv): inv is NonNullable<typeof inv> => inv !== null)
      .reduce((sum, inv) => sum + (inv.totalInvestment || 0), 0);

    const totalInvested = investments
      .filter((inv): inv is NonNullable<typeof inv> => inv !== null)
      .reduce((sum, inv) => sum + (inv.totalInvested || 0), 0);

    // Get location data
    const locations = await ctx.db
      .query("franchiserLocations")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.id))
      .collect();

    // Get product data
    const products = await ctx.db
      .query("franchiserProducts")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.id))
      .collect();

    return {
      brand,
      franchiseCount: franchises.length,
      locationCount: locations.length,
      productCount: products.length,
      totalInvestment,
      totalInvested,
      fundingProgress: totalInvestment > 0 ? (totalInvested / totalInvestment) * 100 : 0,
      averageFranchiseValue: franchises.length > 0 ? totalInvestment / franchises.length : 0,
    };
  },
});

