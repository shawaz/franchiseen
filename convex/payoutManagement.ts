import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create daily payout
export const createDailyPayout = mutation({
  args: {
    franchiseId: v.id("franchises"),
    payoutDate: v.number(),
    totalRevenue: v.number(),
    operatingExpenses: v.number(),
    royaltyPercentage: v.optional(v.number()), // Default royalty percentage
    platformFeePercentage: v.optional(v.number()), // Default platform fee percentage
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Calculate payout amounts
    const royaltyPercentage = args.royaltyPercentage || 5; // 5% default royalty
    const platformFeePercentage = args.platformFeePercentage || 2; // 2% default platform fee
    
    const royaltyAmount = (args.totalRevenue * royaltyPercentage) / 100;
    const platformFee = (args.totalRevenue * platformFeePercentage) / 100;
    const managerBonus = (args.totalRevenue * 2) / 100; // 2% manager bonus
    const employeeBonuses = (args.totalRevenue * 3) / 100; // 3% employee bonus pool
    
    const netProfit = args.totalRevenue - args.operatingExpenses - royaltyAmount - platformFee - managerBonus - employeeBonuses;
    const shareholderAmount = netProfit; // Remaining amount goes to shareholders

    const payoutId = await ctx.db.insert("franchisePayouts", {
      franchiseId: args.franchiseId,
      payoutDate: args.payoutDate,
      totalRevenue: args.totalRevenue,
      royaltyAmount,
      platformFee,
      shareholderAmount,
      managerBonus,
      employeeBonuses,
      operatingExpenses: args.operatingExpenses,
      netProfit,
      status: "pending",
      createdAt: now,
    });

    // Create shareholder distributions
    await createShareholderDistributions(ctx, args.franchiseId, payoutId, shareholderAmount);

    return payoutId;
  },
});

// Process payout (transfer funds)
export const processPayout = mutation({
  args: {
    payoutId: v.id("franchisePayouts"),
  },
  handler: async (ctx, args) => {
    const payout = await ctx.db.get(args.payoutId);
    if (!payout) {
      throw new Error("Payout not found");
    }

    if (payout.status !== "pending") {
      throw new Error("Payout is not in pending status");
    }

    const now = Date.now();

    try {
      // Update payout status to processing
      await ctx.db.patch(args.payoutId, {
        status: "processing",
      });

      // TODO: Implement actual Solana transactions here
      // For now, we'll simulate successful transactions
      const transactionHash = `payout_${args.payoutId}_${now}`;

      // Update payout status to completed
      await ctx.db.patch(args.payoutId, {
        status: "completed",
        transactionHash,
        processedAt: now,
      });

      // Update shareholder distributions
      const distributions = await ctx.db
        .query("shareholderDistributions")
        .withIndex("by_payoutId", (q) => q.eq("payoutId", args.payoutId))
        .collect();

      for (const distribution of distributions) {
        await ctx.db.patch(distribution._id, {
          status: "completed",
          transactionHash: `${transactionHash}_${distribution.userId}`,
          processedAt: now,
        });
      }

      // Add royalty to brand wallet
      const franchise = await ctx.db.get(payout.franchiseId);
      if (franchise && franchise.franchiserId) {
        await ctx.db.insert("brandWalletTransactions", {
          franchiserId: franchise.franchiserId,
          franchiseId: payout.franchiseId,
          type: "franchise_fee",
          amount: payout.royaltyAmount,
          description: `Daily royalty from ${franchise.businessName}`,
          status: "completed",
          transactionHash: `${transactionHash}_royalty`,
          createdAt: now,
        });
      }

      return {
        success: true,
        transactionHash,
        message: "Payout processed successfully",
      };

    } catch (error) {
      // Update payout status to failed
      await ctx.db.patch(args.payoutId, {
        status: "failed",
      });

      throw error;
    }
  },
});

// Get franchise payouts
export const getFranchisePayouts = query({
  args: {
    franchiseId: v.id("franchises"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const payouts = await ctx.db
      .query("franchisePayouts")
      .withIndex("by_franchiseId", (q) => q.eq("franchiseId", args.franchiseId))
      .order("desc")
      .take(args.limit || 30);

    // Get shareholder distributions for each payout
    const payoutsWithDistributions = await Promise.all(
      payouts.map(async (payout) => {
        const distributions = await ctx.db
          .query("shareholderDistributions")
          .withIndex("by_payoutId", (q) => q.eq("payoutId", payout._id))
          .collect();

        const distributionsWithUsers = await Promise.all(
          distributions.map(async (dist) => {
            const user = await ctx.db.get(dist.userId);
            return {
              ...dist,
              user: user ? {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
              } : null,
            };
          })
        );

        return {
          ...payout,
          distributions: distributionsWithUsers,
        };
      })
    );

    return payoutsWithDistributions;
  },
});

// Get payout summary
export const getPayoutSummary = query({
  args: {
    franchiseId: v.id("franchises"),
    days: v.optional(v.number()), // Number of days to look back
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);

    const payouts = await ctx.db
      .query("franchisePayouts")
      .withIndex("by_franchiseId", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.gte(q.field("payoutDate"), cutoffDate))
      .collect();

    const summary = payouts.reduce(
      (acc, payout) => ({
        totalRevenue: acc.totalRevenue + payout.totalRevenue,
        totalRoyalties: acc.totalRoyalties + payout.royaltyAmount,
        totalPlatformFees: acc.totalPlatformFees + payout.platformFee,
        totalShareholderAmount: acc.totalShareholderAmount + payout.shareholderAmount,
        totalManagerBonuses: acc.totalManagerBonuses + payout.managerBonus,
        totalEmployeeBonuses: acc.totalEmployeeBonuses + payout.employeeBonuses,
        totalOperatingExpenses: acc.totalOperatingExpenses + payout.operatingExpenses,
        completedPayouts: acc.completedPayouts + (payout.status === "completed" ? 1 : 0),
        pendingPayouts: acc.pendingPayouts + (payout.status === "pending" ? 1 : 0),
        failedPayouts: acc.failedPayouts + (payout.status === "failed" ? 1 : 0),
      }),
      {
        totalRevenue: 0,
        totalRoyalties: 0,
        totalPlatformFees: 0,
        totalShareholderAmount: 0,
        totalManagerBonuses: 0,
        totalEmployeeBonuses: 0,
        totalOperatingExpenses: 0,
        completedPayouts: 0,
        pendingPayouts: 0,
        failedPayouts: 0,
      }
    );

    return {
      ...summary,
      averageDailyRevenue: summary.totalRevenue / days,
      totalPayouts: payouts.length,
    };
  },
});

// Get user's payout history
export const getUserPayoutHistory = query({
  args: {
    franchiseId: v.id("franchises"),
    userId: v.id("userProfiles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const distributions = await ctx.db
      .query("shareholderDistributions")
      .withIndex("by_franchiseId", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(args.limit || 50);

    // Get payout details for each distribution
    const distributionsWithPayouts = await Promise.all(
      distributions.map(async (dist) => {
        const payout = await ctx.db.get(dist.payoutId);
        return {
          ...dist,
          payout: payout ? {
            payoutDate: payout.payoutDate,
            totalRevenue: payout.totalRevenue,
            status: payout.status,
          } : null,
        };
      })
    );

    return distributionsWithPayouts;
  },
});

// Helper function to create shareholder distributions
async function createShareholderDistributions(
  ctx: any,
  franchiseId: Id<"franchises">,
  payoutId: Id<"franchisePayouts">,
  totalShareholderAmount: number
) {
  // Get franchise shareholders (for now, we'll use a simple approach)
  // In a real system, you'd have a more complex shareholder management system
  
  // For demo purposes, let's assume the franchise owner gets 100% of shareholder distributions
  const franchise = await ctx.db.get(franchiseId);
  if (!franchise) {
    throw new Error("Franchise not found");
  }

  // Get the franchise owner
  const owner = await ctx.db.get(franchise.ownerUserId);
  if (!owner) {
    throw new Error("Franchise owner not found");
  }

  const now = Date.now();

  await ctx.db.insert("shareholderDistributions", {
    franchiseId,
    payoutId,
    userId: franchise.ownerUserId,
    sharePercentage: 100,
    distributionAmount: totalShareholderAmount,
    status: "pending",
    createdAt: now,
  });
}
