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
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    socialMedia: v.object({
      telegram: v.optional(v.string()),
      instagram: v.optional(v.string()),
      facebook: v.optional(v.string()),
      twitter: v.optional(v.string()),
      linkedin: v.optional(v.string()),
    }),
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
});