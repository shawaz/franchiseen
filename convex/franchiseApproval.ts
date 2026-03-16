import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get pending franchises for approval
export const getPendingFranchises = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, { franchiserId }) => {
    const franchises = await ctx.db
      .query("franchises")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchiserId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Get additional data for each franchise
    const franchisesWithDetails = await Promise.all(
      franchises.map(async (franchise) => {
        const investment = await ctx.db.get(franchise.investmentId);
        const location = await ctx.db.get(franchise.locationId);
        const property = await ctx.db
          .query("properties")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
          .first();

        return {
          ...franchise,
          investment,
          location,
          property,
        };
      })
    );

    return franchisesWithDetails;
  },
});

// Approve franchise and create wallet (Stripe-based)
export const approveFranchiseAndCreateToken = mutation({
  args: {
    franchiseId: v.id("franchises"),
    approvedBy: v.string(), // Admin or brand user who approved
  },
  handler: async (ctx, { franchiseId }) => {
    const now = Date.now();

    // Get franchise details
    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Check if franchise is already approved
    if (franchise.status === "approved") {
      throw new Error("Franchise is already approved");
    }

    // Get investment data
    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) {
      throw new Error("Investment data not found");
    }

    // Update franchise status to approved
    await ctx.db.patch(franchiseId, {
      status: "approved",
      stage: "funding",
      updatedAt: now,
    });

    // CREATE FRANCHISE WALLET IMMEDIATELY ON APPROVAL (Stripe-based)
    let walletCreated = false;
    let franchiseWalletId = null;
    try {
      // Create franchise wallet with 0 balance (will accumulate as funding comes in)
      franchiseWalletId = await ctx.db.insert("franchiseWallets", {
        franchiseId: franchiseId,
        walletAddress: `stripe-${franchiseId}`,
        walletName: `${franchise.franchiseSlug} Wallet`,
        balance: 0,
        inrBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        totalPayouts: 0,
        totalRoyalties: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        transactionCount: 0,
        lastActivity: now,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });

      walletCreated = true;
    } catch (error) {
      console.error("Failed to create franchise wallet:", error);
      // Continue with approval even if wallet creation fails
    }

    // Update property stage if exists
    const property = await ctx.db
      .query("properties")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (property) {
      await ctx.db.patch(property._id, {
        stage: "rented",
        updatedAt: now,
      });
    }

    return {
      success: true,
      message: `Franchise approved successfully! Wallet created: ${walletCreated}`,
      franchiseId,
      walletCreated,
      franchiseWalletId,
    };
  },
});

// Reject franchise
export const rejectFranchise = mutation({
  args: {
    franchiseId: v.id("franchises"),
    rejectedBy: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { franchiseId }) => {
    const now = Date.now();

    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Update franchise status to terminated (rejected)
    await ctx.db.patch(franchiseId, {
      status: "terminated",
      updatedAt: now,
    });

    // Update property stage if exists
    const property = await ctx.db
      .query("properties")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (property) {
      await ctx.db.patch(property._id, {
        stage: "listing", // Put property back to listing when franchise is rejected
        updatedAt: now,
      });
    }

    return {
      success: true,
      message: "Franchise rejected successfully",
      franchiseId,
    };
  },
});
