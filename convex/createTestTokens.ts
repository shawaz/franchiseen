import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Create test tokens for existing franchises
export const createTestTokensForFranchises = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all franchises that don't have tokens yet
    const franchises = await ctx.db.query("franchises").collect();
    const results = [];

    for (const franchise of franchises) {
      // Check if franchise already has a token
      const existingToken = await ctx.db
        .query("franchiseTokens")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
        .first();

      if (existingToken) {
        results.push({
          franchiseId: franchise._id,
          franchiseSlug: franchise.franchiseSlug,
          status: "already_exists",
          tokenMint: existingToken.tokenMint,
        });
        continue;
      }

      // Get investment data for token creation
      const investment = await ctx.db.get(franchise.investmentId);
      if (!investment) {
        results.push({
          franchiseId: franchise._id,
          franchiseSlug: franchise.franchiseSlug,
          status: "no_investment_data",
          error: "Investment data not found",
        });
        continue;
      }

      // Create token for this franchise
      const tokenName = `${franchise.franchiseSlug} Tokens`;
      const tokenSymbol = franchise.franchiseSlug.toUpperCase().replace('-', '');
      const tokenMint = `test_token_${franchise._id}_${Date.now()}`;

      try {
        const tokenId = await ctx.db.insert("franchiseTokens", {
          franchiseId: franchise._id,
          tokenMint: tokenMint,
          tokenName: tokenName,
          tokenSymbol: tokenSymbol,
          tokenDecimals: 6,
          totalSupply: investment.sharesIssued,
          circulatingSupply: investment.sharesPurchased || 0,
          sharePrice: 1.00, // Fixed at $1.00
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        results.push({
          franchiseId: franchise._id,
          franchiseSlug: franchise.franchiseSlug,
          status: "created",
          tokenId,
          tokenMint,
          tokenSymbol,
        });
      } catch (error) {
        results.push({
          franchiseId: franchise._id,
          franchiseSlug: franchise.franchiseSlug,
          status: "error",
          error: (error as Error).message,
        });
      }
    }

    return {
      success: true,
      message: `Processed ${franchises.length} franchises`,
      results,
    };
  },
});

// Create test token holdings for existing shares
export const createTestTokenHoldings = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all franchise shares
    const shares = await ctx.db.query("franchiseShares").collect();
    const results = [];

    for (const share of shares) {
      // Check if holding already exists
      const existingHolding = await ctx.db
        .query("tokenHoldings")
        .withIndex("by_franchise_investor", (q) => 
          q.eq("franchiseId", share.franchiseId).eq("investorId", share.investorId)
        )
        .first();

      if (existingHolding) {
        results.push({
          shareId: share._id,
          investorId: share.investorId,
          status: "already_exists",
        });
        continue;
      }

      // Get franchise token
      const franchiseToken = await ctx.db
        .query("franchiseTokens")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", share.franchiseId))
        .first();

      if (!franchiseToken) {
        results.push({
          shareId: share._id,
          investorId: share.investorId,
          status: "no_token",
          error: "Franchise token not found",
        });
        continue;
      }

      try {
        // Create token holding
        const holdingId = await ctx.db.insert("tokenHoldings", {
          franchiseId: share.franchiseId,
          tokenMint: franchiseToken.tokenMint,
          investorId: share.investorId,
          balance: share.sharesPurchased,
          totalPurchased: share.sharesPurchased,
          totalSold: 0,
          averagePurchasePrice: share.sharePrice,
          lastTransactionAt: share.purchasedAt,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        results.push({
          shareId: share._id,
          investorId: share.investorId,
          status: "created",
          holdingId,
          balance: share.sharesPurchased,
        });
      } catch (error) {
        results.push({
          shareId: share._id,
          investorId: share.investorId,
          status: "error",
          error: (error as Error).message,
        });
      }
    }

    return {
      success: true,
      message: `Processed ${shares.length} shares`,
      results,
    };
  },
});
