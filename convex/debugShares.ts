import { query } from "./_generated/server";
import { v } from "convex/values";

// Debug query to check share statuses for an investor
export const debugInvestorShares = query({
  args: {
    investorId: v.string(),
  },
  handler: async (ctx, { investorId }) => {
    // Get all shares for this investor
    const allShares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_investor", (q) => q.eq("investorId", investorId))
      .collect();

    // Get only confirmed shares
    const confirmedShares = allShares.filter(share => share.status === "confirmed");
    
    // Get only pending shares
    const pendingShares = allShares.filter(share => share.status === "pending");

    // Calculate totals for each status
    const allSharesTotal = allShares.reduce((sum, share) => sum + share.totalAmount, 0);
    const confirmedSharesTotal = confirmedShares.reduce((sum, share) => sum + share.totalAmount, 0);
    const pendingSharesTotal = pendingShares.reduce((sum, share) => sum + share.totalAmount, 0);

    const allSharesCount = allShares.reduce((sum, share) => sum + share.sharesPurchased, 0);
    const confirmedSharesCount = confirmedShares.reduce((sum, share) => sum + share.sharesPurchased, 0);
    const pendingSharesCount = pendingShares.reduce((sum, share) => sum + share.sharesPurchased, 0);

    return {
      investorId,
      summary: {
        totalShares: allShares.length,
        confirmedShares: confirmedShares.length,
        pendingShares: pendingShares.length,
      },
      totals: {
        allShares: {
          count: allSharesCount,
          amount: allSharesTotal,
        },
        confirmedShares: {
          count: confirmedSharesCount,
          amount: confirmedSharesTotal,
        },
        pendingShares: {
          count: pendingSharesCount,
          amount: pendingSharesTotal,
        }
      },
      shares: allShares.map(share => ({
        id: share._id,
        franchiseId: share.franchiseId,
        status: share.status,
        sharesPurchased: share.sharesPurchased,
        totalAmount: share.totalAmount,
        purchasedAt: share.purchasedAt,
      }))
    };
  },
});
