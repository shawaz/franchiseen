import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ===== COUNTRIES =====

export const createCountry = mutation({
  args: {
    name: v.string(),
    code: v.string(),
    flag: v.optional(v.string()),
    currency: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("countries", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getAllCountries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("countries")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getCountryByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("countries")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

// ===== CITIES =====

export const createCity = mutation({
  args: {
    name: v.string(),
    countryId: v.id("countries"),
    countryCode: v.string(),
    state: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    population: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("cities", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getCitiesByCountry = query({
  args: { countryId: v.id("countries") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cities")
      .withIndex("by_country", (q) => q.eq("countryId", args.countryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getCitiesByCountryCode = query({
  args: { countryCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cities")
      .withIndex("by_countryCode", (q) => q.eq("countryCode", args.countryCode))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// ===== INDUSTRIES =====

export const createIndustry = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("industries", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getAllIndustries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("industries")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
  },
});

export const getIndustryById = query({
  args: { industryId: v.id("industries") },
  handler: async (ctx, { industryId }) => {
    return await ctx.db.get(industryId);
  },
});

// ===== CATEGORIES =====

export const createCategory = mutation({
  args: {
    name: v.string(),
    industryId: v.id("industries"),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("categories", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getCategoriesByIndustry = query({
  args: { industryId: v.id("industries") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_industry", (q) => q.eq("industryId", args.industryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
  },
});

export const getCategoryById = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, { categoryId }) => {
    return await ctx.db.get(categoryId);
  },
});

export const getCategoriesByIds = query({
  args: { categoryIds: v.array(v.id("categories")) },
  handler: async (ctx, { categoryIds }) => {
    return await Promise.all(
      categoryIds.map(id => ctx.db.get(id))
    );
  },
});

// ===== PRODUCT CATEGORIES =====

export const createProductCategory = mutation({
  args: {
    name: v.string(),
    categoryId: v.id("categories"),
    industryId: v.id("industries"),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("productCategories", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getProductCategoriesByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productCategories")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

export const getProductCategoriesByIndustry = query({
  args: { industryId: v.id("industries") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productCategories")
      .withIndex("by_industry", (q) => q.eq("industryId", args.industryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

export const getAllProductCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("productCategories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
  },
});

export const getProductCategoryById = query({
  args: { productCategoryId: v.id("productCategories") },
  handler: async (ctx, { productCategoryId }) => {
    return await ctx.db.get(productCategoryId);
  },
});

// ===== BULK OPERATIONS =====

export const createMultipleCountries = mutation({
  args: {
    countries: v.array(v.object({
      name: v.string(),
      code: v.string(),
      flag: v.optional(v.string()),
      currency: v.optional(v.string()),
      timezone: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];
    
    for (const country of args.countries) {
      const id = await ctx.db.insert("countries", {
        ...country,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      results.push(id);
    }
    
    return results;
  },
});

export const createMultipleCities = mutation({
  args: {
    cities: v.array(v.object({
      name: v.string(),
      countryId: v.id("countries"),
      countryCode: v.string(),
      state: v.optional(v.string()),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      population: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];
    
    for (const city of args.cities) {
      const id = await ctx.db.insert("cities", {
        ...city,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      results.push(id);
    }
    
    return results;
  },
});

export const createMultipleIndustries = mutation({
  args: {
    industries: v.array(v.object({
      name: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];
    
    for (const industry of args.industries) {
      const id = await ctx.db.insert("industries", {
        ...industry,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      results.push(id);
    }
    
    return results;
  },
});

export const createMultipleCategories = mutation({
  args: {
    categories: v.array(v.object({
      name: v.string(),
      industryId: v.id("industries"),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];
    
    for (const category of args.categories) {
      const id = await ctx.db.insert("categories", {
        ...category,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      results.push(id);
    }
    
    return results;
  },
});

export const createMultipleProductCategories = mutation({
  args: {
    productCategories: v.array(v.object({
      name: v.string(),
      categoryId: v.id("categories"),
      industryId: v.id("industries"),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
      sortOrder: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];
    
    for (const productCategory of args.productCategories) {
      const id = await ctx.db.insert("productCategories", {
        ...productCategory,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      results.push(id);
    }
    
    return results;
  },
});
