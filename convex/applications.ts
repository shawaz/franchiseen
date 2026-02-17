import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit a new franchise application
export const submit = mutation({
  args: {
    franchiseId: v.optional(v.id("franchises")),
    franchiserId: v.optional(v.id("franchiser")),
    userId: v.optional(v.string()), // Logged-in user ID
    applicantName: v.string(),
    applicantEmail: v.string(),
    applicantPhone: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("franchiseApplications", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get applications by user ID
export const getMyApplications = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiseApplications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get applications for a franchiser (for admin/brand owner)
export const getFranchiserApplications = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("franchiseApplications")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .collect();
  },
});
