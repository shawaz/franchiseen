import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Token management - Solana SPL tokens replaced by Stripe-based share purchases.
 * These are no-op stubs kept for backward compatibility.
 * Share ownership is now tracked directly in franchiseShares table.
 */

export const createFranchiseToken = mutation({
  args: {
    franchiseId: v.id("franchises"),
    tokenName: v.string(),
    tokenSymbol: v.string(),
    totalSupply: v.number(),
    sharePrice: v.number(),
  },
  handler: async () => {
    return {
      tokenId: null,
      tokenMint: null,
      message: "SPL tokens removed - shares tracked via Stripe payments",
    };
  },
});

export const mintTokensForPurchase = mutation({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.string(),
    amount: v.number(),
    totalValue: v.number(),
    transactionHash: v.optional(v.string()),
  },
  handler: async () => ({
    success: false,
    message: "SPL tokens removed - use Stripe share purchases",
  }),
});

export const burnTokensForRefund = mutation({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.string(),
    amount: v.number(),
    refundTransactionHash: v.optional(v.string()),
  },
  handler: async () => ({
    success: false,
    message: "SPL tokens removed - use Stripe refunds",
  }),
});

export const getTokenHoldingsByInvestor = query({
  args: { investorId: v.string() },
  handler: async () => [],
});

export const getFranchiseToken = query({
  args: { franchiseId: v.id("franchises") },
  handler: async () => null,
});

export const getTokenTransactions = query({
  args: {
    franchiseId: v.id("franchises"),
    limit: v.optional(v.number()),
  },
  handler: async () => [],
});

export const activateFranchiseToken = mutation({
  args: { franchiseId: v.id("franchises") },
  handler: async () => ({
    success: false,
    message: "SPL tokens removed",
  }),
});

export const pauseFranchiseToken = mutation({
  args: { franchiseId: v.id("franchises") },
  handler: async () => ({
    success: false,
    message: "SPL tokens removed",
  }),
});
