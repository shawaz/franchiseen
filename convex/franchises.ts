import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all franchisers
export const getAllFranchisers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("franchiser").collect();
  },
});

// Query to get franchiser by ID
export const getFranchiserById = query({
  args: { id: v.id("franchiser") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query to get franchiser by owner user ID
export const getFranchiserByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiser")
      .withIndex("by_ownerUser", (q) => q.eq("ownerUserId", args.userId))
      .first();
  },
});

// Query to get all franchisers by owner user ID
export const getAllFranchisersByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiser")
      .withIndex("by_ownerUser", (q) => q.eq("ownerUserId", args.userId))
      .collect();
  },
});

// Legacy query for backward compatibility - get franchiser by wallet address
export const getFranchiserByWallet = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    // First get the user by wallet address
    const user = await ctx.db
      .query("users")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", args.walletAddress))
      .first();
    
    if (!user) {
      return null;
    }
    
    // Then get franchiser by user ID
    return await ctx.db
      .query("franchiser")
      .withIndex("by_ownerUser", (q) => q.eq("ownerUserId", user._id))
      .first();
  },
});

// Legacy query for backward compatibility - get all franchisers by wallet address
export const getAllFranchisersByWallet = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    // First get the user by wallet address
    const user = await ctx.db
      .query("users")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", args.walletAddress))
      .first();
    
    if (!user) {
      return [];
    }
    
    // Then get franchisers by user ID
    return await ctx.db
      .query("franchiser")
      .withIndex("by_ownerUser", (q) => q.eq("ownerUserId", user._id))
      .collect();
  },
});

// Query to get franchiser by slug
export const getFranchiserBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiser")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();
  },
});

// Note: isSlugAvailable query removed as URL availability checking was simplified

// Query to get franchiser locations
export const getFranchiserLocations = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiserLocations")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .collect();
  },
});

// Query to get franchiser products
export const getFranchiserProducts = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiserProducts")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .collect();
  },
});

// Mutation to create a new franchiser
export const createFranchiser = mutation({
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
    type: v.optional(v.union(
      v.literal("FOCO"),
      v.literal("FOFO")
    )),
    royaltyPercentage: v.optional(v.number()),
    estimatedMonthlyRevenue: v.optional(v.number()),
    setupBy: v.optional(v.union(
      v.literal("DESIGN_INTERIOR_BY_BRAND"),
      v.literal("DESIGN_INTERIOR_BY_FRANCHISEEN"),
      v.literal("DESIGN_BY_BRAND_INTERIOR_BY_FRANCHISEEN")
    )),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("franchiser", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation to create franchiser with locations and products
export const createFranchiserWithDetails = mutation({
  args: {
    franchiser: v.object({
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
      type: v.optional(v.union(
        v.literal("FOCO"),
        v.literal("FOFO")
      )),
      royaltyPercentage: v.optional(v.number()),
      estimatedMonthlyRevenue: v.optional(v.number()),
      setupBy: v.optional(v.union(
        v.literal("DESIGN_INTERIOR_BY_BRAND"),
        v.literal("DESIGN_INTERIOR_BY_FRANCHISEEN"),
        v.literal("DESIGN_BY_BRAND_INTERIOR_BY_FRANCHISEEN")
      )),
      status: v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      ),
    }),
    locations: v.array(v.object({
      country: v.string(),
      state: v.optional(v.string()),
      city: v.optional(v.string()),
      area: v.optional(v.string()),
      isNationwide: v.boolean(),
      registrationCertificate: v.string(),
      minArea: v.number(),
      franchiseFee: v.number(),
      setupCost: v.number(),
      workingCapital: v.number(),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("inactive")
      ),
    })),
    products: v.array(v.object({
      name: v.string(),
      description: v.optional(v.string()),
      cost: v.number(),
      price: v.number(),
      images: v.array(v.id("_storage")),
      category: v.string(),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("archived")
      ),
      // Stock/Inventory fields
      stockQuantity: v.number(),
      minStockLevel: v.optional(v.number()),
      maxStockLevel: v.optional(v.number()),
      unit: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create the franchiser first
    const franchiserId = await ctx.db.insert("franchiser", {
      ...args.franchiser,
      createdAt: now,
      updatedAt: now,
    });
    
    // Create locations
    const locationIds = [];
    for (const location of args.locations) {
      const locationId = await ctx.db.insert("franchiserLocations", {
        franchiserId,
        ...location,
        createdAt: now,
      });
      locationIds.push(locationId);
    }
    
    // Create products
    const productIds = [];
    for (const product of args.products) {
      const productId = await ctx.db.insert("franchiserProducts", {
        franchiserId,
        ...product,
        createdAt: now,
      });
      productIds.push(productId);
    }
    
    return {
      franchiserId,
      locationIds,
      productIds,
    };
  },
});

// Mutation to create franchiser location
export const createFranchiserLocation = mutation({
  args: {
    franchiserId: v.id("franchiser"),
    country: v.string(),
    state: v.optional(v.string()),
    city: v.optional(v.string()),
    area: v.optional(v.string()),
    isNationwide: v.boolean(),
    registrationCertificate: v.string(),
    minArea: v.number(),
    franchiseFee: v.number(),
    setupCost: v.number(),
    workingCapital: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("inactive")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("franchiserLocations", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Mutation to create franchiser product
export const createFranchiserProduct = mutation({
  args: {
    franchiserId: v.id("franchiser"),
    name: v.string(),
    description: v.optional(v.string()),
    cost: v.number(),
    price: v.number(),
    images: v.array(v.id("_storage")),
    category: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("archived")
    ),
    // Stock/Inventory fields
    stockQuantity: v.number(),
    minStockLevel: v.optional(v.number()),
    maxStockLevel: v.optional(v.number()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("franchiserProducts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Mutation to update product stock
export const updateProductStock = mutation({
  args: {
    productId: v.id("franchiserProducts"),
    stockQuantity: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.productId, {
      stockQuantity: args.stockQuantity,
    });
  },
});

// Query to get franchisers by status
export const getFranchisersByStatus = query({
  args: { status: v.union(
    v.literal("draft"),
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  ) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiser")
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();
  },
});

// Query to get franchisers by category
export const getFranchisersByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiser")
      .filter((q) => q.eq(q.field("category"), args.category))
      .collect();
  },
});

// Query to search franchisers
export const searchFranchisers = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.toLowerCase();
    return await ctx.db
      .query("franchiser")
      .filter((q) => 
        q.or(
          q.eq(q.field("name"), searchTerm),
          q.eq(q.field("description"), searchTerm),
          q.eq(q.field("industry"), searchTerm),
          q.eq(q.field("category"), searchTerm)
        )
      )
      .collect();
  },
});

// Query to get all franchiser locations (for debugging)
export const getAllFranchiserLocations = query({
  args: {},
  handler: async (ctx) => {
    const locations = await ctx.db
      .query("franchiserLocations")
      .collect();
    
    console.log("All franchiser locations in database:", locations);
    return locations;
  },
});

// Query to get all franchisers for debugging
export const getAllFranchisersDebug = query({
  args: {},
  handler: async (ctx) => {
    const franchisers = await ctx.db
      .query("franchiser")
      .collect();
    
    console.log("All franchisers in database:", franchisers);
    return franchisers;
  },
});

// Simple test query to get any franchiser
export const getAnyFranchiser = query({
  args: {},
  handler: async (ctx) => {
    const franchiser = await ctx.db
      .query("franchiser")
      .first();
    
    console.log("Any franchiser found:", franchiser);
    return franchiser;
  },
});

// Query to get franchisers by location
export const getFranchisersByLocation = query({
  args: { 
    country: v.string(),
    city: v.optional(v.string()),
    industry: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    console.log("=== FRANCHISER SEARCH DEBUG ===");
    console.log("Searching for franchisers with:", { country: args.country, city: args.city, industry: args.industry });
    
    // First, let's see ALL locations in the database
    const allLocations = await ctx.db
      .query("franchiserLocations")
      .collect();
    
    console.log("ALL locations in database:", allLocations);
    
    // Get all franchiser locations that match the country
    let locations = await ctx.db
      .query("franchiserLocations")
      .filter((q) => 
        q.eq(q.field("country"), args.country)
      )
      .collect();

    console.log("Locations matching country:", locations.length);
    console.log("Matching locations:", locations);
    
    // If no results and searching for UAE, try alternative country names
    if (locations.length === 0 && args.country === "UAE") {
      console.log("No results for UAE, trying alternative country names...");
      
      const alternativeCountries = ["United Arab Emirates", "UAE", "AE"];
      for (const altCountry of alternativeCountries) {
        const altLocations = await ctx.db
          .query("franchiserLocations")
          .filter((q) => 
            q.eq(q.field("country"), altCountry)
          )
          .collect();
        
        console.log(`Trying country "${altCountry}": found ${altLocations.length} locations`);
        if (altLocations.length > 0) {
          locations = altLocations;
          console.log("Using alternative country results:", locations);
          break;
        }
      }
    }

    // Filter by status
    const activeLocations = locations.filter(loc => loc.status === "active");
    console.log("Active locations:", activeLocations.length);
    console.log("Active locations details:", activeLocations);

    // Filter by city if specified
    let filteredLocations = activeLocations;
    if (args.city) {
      filteredLocations = activeLocations.filter(loc => 
        loc.city === args.city || loc.isNationwide
      );
      console.log("After city filter:", filteredLocations.length);
      console.log("City filtered locations:", filteredLocations);
    }

    // Get franchiser details for each location
    const franchisers = await Promise.all(
      filteredLocations.map(async (location) => {
        console.log("Getting franchiser for location:", location._id, "franchiserId:", location.franchiserId);
        const franchiser = await ctx.db.get(location.franchiserId);
        console.log("Franchiser found:", franchiser);
        
        if (!franchiser) {
          console.log("No franchiser found for ID:", location.franchiserId);
          return null;
        }
        
        if (franchiser.status !== "approved") {
          console.log("Franchiser not approved, status:", franchiser.status);
          return null;
        }
        
        // Get industry and category names from master data
        let industryName = franchiser.industry;
        let categoryName = franchiser.category;
        
        // Try to get industry name if it's an ID (Convex IDs start with 'j' or 'k')
        if (franchiser.industry && (franchiser.industry.startsWith('j') || franchiser.industry.startsWith('k'))) {
          try {
            const industry = await ctx.db.get(franchiser.industry as any);
            if (industry && 'name' in industry) {
              industryName = (industry as any).name;
              console.log("Resolved industry:", industryName);
            }
          } catch (e) {
            console.log("Could not fetch industry:", e);
          }
        }
        
        // Try to get category name if it's an ID (Convex IDs start with 'j' or 'k')
        if (franchiser.category && (franchiser.category.startsWith('j') || franchiser.category.startsWith('k'))) {
          try {
            const category = await ctx.db.get(franchiser.category as any);
            if (category && 'name' in category) {
              categoryName = (category as any).name;
              console.log("Resolved category:", categoryName);
            }
          } catch (e) {
            console.log("Could not fetch category:", e);
          }
        }
        
        // Filter by industry if specified (compare with both ID and name)
        if (args.industry && franchiser.industry !== args.industry && industryName !== args.industry) {
          console.log("Industry mismatch:", franchiser.industry, "or", industryName, "vs", args.industry);
          return null;
        }
        
        console.log("Franchiser passed all filters:", franchiser.name);
        console.log("Franchiser brandWalletAddress:", franchiser.brandWalletAddress);
        return {
          ...franchiser,
          industry: industryName,
          category: categoryName,
          location: location,
        };
      })
    );

    console.log("Franchisers after filtering:", franchisers);

    // Filter out null values and return unique franchisers
    const uniqueFranchisers = franchisers
      .filter((franchiser): franchiser is NonNullable<typeof franchiser> => franchiser !== null)
      .reduce((acc, franchiser) => {
        if (!acc.find(f => f._id === franchiser._id)) {
          acc.push(franchiser);
        }
        return acc;
      }, [] as NonNullable<typeof franchisers[0]>[]);

    console.log("Final unique franchisers:", uniqueFranchisers.length);
    console.log("Final franchisers:", uniqueFranchisers);
    console.log("=== END FRANCHISER SEARCH DEBUG ===");
    
    return uniqueFranchisers;
  },
});

// Mutation to update franchiser
export const updateFranchiser = mutation({
  args: {
    id: v.id("franchiser"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    industry: v.optional(v.string()),
    category: v.optional(v.string()),
    website: v.optional(v.string()),
    logoUrl: v.optional(v.id("_storage")),
    type: v.optional(v.union(
      v.literal("FOCO"),
      v.literal("FOFO")
    )),
    royaltyPercentage: v.optional(v.number()),
    estimatedMonthlyRevenue: v.optional(v.number()),
    setupBy: v.optional(v.union(
      v.literal("DESIGN_INTERIOR_BY_BRAND"),
      v.literal("DESIGN_INTERIOR_BY_FRANCHISEEN"),
      v.literal("DESIGN_BY_BRAND_INTERIOR_BY_FRANCHISEEN")
    )),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
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

// Mutation to delete franchiser
export const deleteFranchiser = mutation({
  args: { id: v.id("franchiser") },
  handler: async (ctx, args) => {
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
    
    // Delete the franchiser
    await ctx.db.delete(args.id);
    
    return args.id;
  },
});
