// In convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  franchiser: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_walletAddress", ["walletAddress"]),

  franchiserLocations: defineTable({
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
    createdAt: v.number(),
  }).index("by_franchiser", ["franchiserId"]),

  franchiserProducts: defineTable({
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
    createdAt: v.number(),
  }).index("by_franchiser", ["franchiserId"]),

  files: defineTable({
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    uploadedAt: v.number(),
  }),

  // Master data tables
  countries: defineTable({
    name: v.string(),
    code: v.string(), // ISO country code (e.g., "AE", "US", "GB")
    flag: v.optional(v.string()), // Flag emoji or URL
    currency: v.optional(v.string()), // Currency code (e.g., "AED", "USD", "GBP")
    timezone: v.optional(v.string()), // Timezone (e.g., "Asia/Dubai", "America/New_York")
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_code", ["code"]).index("by_active", ["isActive"]),

  cities: defineTable({
    name: v.string(),
    countryId: v.id("countries"),
    countryCode: v.string(), // For easier querying
    state: v.optional(v.string()), // State/Province
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    population: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_country", ["countryId"]).index("by_countryCode", ["countryCode"]).index("by_active", ["isActive"]),

  industries: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()), // Icon name or URL
    isActive: v.boolean(),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_active", ["isActive"]).index("by_sortOrder", ["sortOrder"]),

  categories: defineTable({
    name: v.string(),
    industryId: v.id("industries"),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_industry", ["industryId"]).index("by_active", ["isActive"]).index("by_sortOrder", ["sortOrder"]),

  productCategories: defineTable({
    name: v.string(),
    categoryId: v.id("categories"),
    industryId: v.id("industries"), // For easier querying
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["categoryId"]).index("by_industry", ["industryId"]).index("by_active", ["isActive"]).index("by_sortOrder", ["sortOrder"]),
});