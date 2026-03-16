import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Wallet migration utilities - Solana wallets replaced with Stripe.
 * These are stubs kept for backward compatibility.
 */

export const findInvalidWallets = query({
  args: {},
  handler: async (ctx) => {
    const allWallets = await ctx.db.query("franchiseWallets").collect();
    return {
      total: allWallets.length,
      invalid: 0,
      invalidWallets: [],
      message: "Solana wallet migration not needed - using Stripe",
    };
  },
});

export const migrateWallet = mutation({
  args: {
    walletId: v.id("franchiseWallets"),
  },
  handler: async () => ({
    success: false,
    message: "Solana wallet migration not needed - using Stripe",
  }),
});

export const migrateAllInvalidWallets = mutation({
  args: {},
  handler: async () => ({
    success: false,
    message: "Solana wallet migration not needed - using Stripe",
    migrated: 0,
  }),
});

export const verifyAllWallets = query({
  args: {},
  handler: async (ctx) => {
    const allWallets = await ctx.db.query("franchiseWallets").collect();
    return {
      total: allWallets.length,
      valid: allWallets.length,
      invalid: 0,
      wallets: allWallets.map((wallet) => ({
        _id: wallet._id,
        walletName: wallet.walletName,
        address: wallet.walletAddress ?? "stripe",
        isValid: true,
        hasStripeAccount: !!wallet.stripeAccountId,
      })),
    };
  },
});
