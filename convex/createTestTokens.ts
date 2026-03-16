import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Test token creation - Solana SPL tokens replaced by Stripe-based share purchases.
 * These are no-op stubs kept for backward compatibility.
 */

export const createTestTokensForFranchises = mutation({
  args: {},
  handler: async () => ({
    success: false,
    message: "SPL tokens removed - shares tracked via Stripe payments",
    results: [],
  }),
});

export const createTestTokenHoldings = mutation({
  args: {},
  handler: async (_ctx) => {
    // Return empty - tokenHoldings table removed
    const shares = await _ctx.db.query("franchiseShares").collect();
    return {
      success: true,
      message: `Shares tracked in franchiseShares table (${shares.length} records). SPL token holdings removed.`,
      results: [],
    };
  },
});
