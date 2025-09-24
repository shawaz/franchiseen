import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all franchisers
export const getAllFranchisers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("franchiser").collect();
  },
});

// Query to get franchiser by wallet address
export const getFranchiserByWallet = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiser")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", args.walletAddress))
      .first();
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
    walletAddress: v.string(),
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
      walletAddress: v.string(),
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
    }),
    locations: v.array(v.object({
      country: v.string(),
      isNationwide: v.boolean(),
      city: v.optional(v.string()),
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

// Mutation to update franchiser
export const updateFranchiser = mutation({
  args: {
    id: v.id("franchiser"),
    walletAddress: v.optional(v.string()),
    logoUrl: v.optional(v.id("_storage")),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    industry: v.optional(v.string()),
    category: v.optional(v.string()),
    website: v.optional(v.string()),
    interiorImages: v.optional(v.array(v.id("_storage"))),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Mutation to create franchiser location
export const createFranchiserLocation = mutation({
  args: {
    franchiserId: v.id("franchiser"),
    country: v.string(),
    isNationwide: v.boolean(),
    city: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("franchiserProducts", {
      ...args,
      createdAt: Date.now(),
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
