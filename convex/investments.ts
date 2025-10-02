import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all investments
export const getAllInvestments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("investments").collect();
  },
});

// Query to get investment by ID
export const getInvestmentById = query({
  args: { id: v.id("investments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query to get investment by franchise ID
export const getInvestmentByFranchise = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investments")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();
  },
});

// Query to get investments by status
export const getInvestmentsByStatus = query({
  args: { status: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("completed"),
    v.literal("cancelled")
  ) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investments")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Mutation to create a new investment
export const createInvestment = mutation({
  args: {
    franchiseId: v.id("franchises"),
    totalInvestment: v.number(),
    totalInvested: v.number(),
    sharesIssued: v.number(),
    sharesPurchased: v.number(),
    sharePrice: v.number(),
    franchiseFee: v.number(),
    setupCost: v.number(),
    workingCapital: v.number(),
    minimumInvestment: v.number(),
    maximumInvestment: v.optional(v.number()),
    expectedReturn: v.optional(v.number()),
    investmentStartDate: v.optional(v.number()),
    investmentEndDate: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("investments", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Mutation to update investment
export const updateInvestment = mutation({
  args: {
    id: v.id("investments"),
    totalInvestment: v.optional(v.number()),
    totalInvested: v.optional(v.number()),
    sharesIssued: v.optional(v.number()),
    sharesPurchased: v.optional(v.number()),
    sharePrice: v.optional(v.number()),
    franchiseFee: v.optional(v.number()),
    setupCost: v.optional(v.number()),
    workingCapital: v.optional(v.number()),
    minimumInvestment: v.optional(v.number()),
    maximumInvestment: v.optional(v.number()),
    expectedReturn: v.optional(v.number()),
    investmentStartDate: v.optional(v.number()),
    investmentEndDate: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
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

// Mutation to delete investment
export const deleteInvestment = mutation({
  args: { id: v.id("investments") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Query to get franchise with investment details
export const getFranchiseWithInvestment = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) return null;

    const investment = await ctx.db
      .query("investments")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();

    return {
      ...franchise,
      investment,
    };
  },
});

// Query to get all franchises with their investment details
export const getAllFranchisesWithInvestment = query({
  args: {},
  handler: async (ctx) => {
    const franchises = await ctx.db.query("franchises").collect();
    
    const franchisesWithInvestment = await Promise.all(
      franchises.map(async (franchise) => {
        const investment = await ctx.db
          .query("investments")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
          .first();

        return {
          ...franchise,
          investment,
        };
      })
    );

    return franchisesWithInvestment;
  },
});

// Mutation to update investment progress (when shares are purchased)
export const updateInvestmentProgress = mutation({
  args: {
    franchiseId: v.id("franchises"),
    sharesPurchased: v.number(),
    amountInvested: v.number(),
  },
  handler: async (ctx, args) => {
    const investment = await ctx.db
      .query("investments")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();

    if (!investment) {
      throw new Error("Investment not found for franchise");
    }

    const newTotalInvested = investment.totalInvested + args.amountInvested;
    const newSharesPurchased = investment.sharesPurchased + args.sharesPurchased;

    await ctx.db.patch(investment._id, {
      totalInvested: newTotalInvested,
      sharesPurchased: newSharesPurchased,
      updatedAt: Date.now(),
    });

    return investment._id;
  },
});

// Query to get investment statistics
export const getInvestmentStats = query({
  args: {},
  handler: async (ctx) => {
    const investments = await ctx.db.query("investments").collect();
    
    const stats = investments.reduce((acc, investment) => {
      acc.totalInvestment += investment.totalInvestment;
      acc.totalInvested += investment.totalInvested;
      acc.totalSharesIssued += investment.sharesIssued;
      acc.totalSharesPurchased += investment.sharesPurchased;
      
      if (investment.status === "active") {
        acc.activeInvestments++;
      } else if (investment.status === "completed") {
        acc.completedInvestments++;
      }
      
      return acc;
    }, {
      totalInvestment: 0,
      totalInvested: 0,
      totalSharesIssued: 0,
      totalSharesPurchased: 0,
      activeInvestments: 0,
      completedInvestments: 0,
    });

    return {
      ...stats,
      totalFranchises: investments.length,
      averageInvestment: investments.length > 0 ? stats.totalInvestment / investments.length : 0,
      fundingProgress: stats.totalInvestment > 0 ? (stats.totalInvested / stats.totalInvestment) * 100 : 0,
    };
  },
});
