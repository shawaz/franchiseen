import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new brand wallet for a franchiser
 * This generates a new Solana keypair and stores the encrypted secret key
 */
export const createBrandWallet = mutation({
  args: {
    franchiserId: v.id("franchiser"),
    encryptedSecretKey: v.string(), // The secret key should be encrypted before calling this
  },
  handler: async (ctx, args) => {
    // Verify the franchiser exists
    const franchiser = await ctx.db.get(args.franchiserId);
    if (!franchiser) {
      throw new Error("Franchiser not found");
    }

    // Update the franchiser with the wallet information
    await ctx.db.patch(args.franchiserId, {
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get franchiser wallet information
 */
export const getFranchiserWallet = query({
  args: {
    franchiserId: v.id("franchiser"),
  },
  handler: async (ctx, args) => {
    const franchiser = await ctx.db.get(args.franchiserId);
    if (!franchiser) {
      throw new Error("Franchiser not found");
    }

    return {
      ownerUserId: franchiser.ownerUserId,
      brandWalletAddress: franchiser.brandWalletAddress,
      hasSecretKey: false, // No longer storing secret keys
      // Note: We don't return the actual secret key for security
    };
  },
});

/**
 * Update franchiser wallet information
 */
export const updateFranchiserWallet = mutation({
  args: {
    franchiserId: v.id("franchiser"),
    ownerWalletAddress: v.optional(v.string()),
    brandWalletAddress: v.optional(v.string()),
    encryptedSecretKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify the franchiser exists
    const franchiser = await ctx.db.get(args.franchiserId);
    if (!franchiser) {
      throw new Error("Franchiser not found");
    }

    // Update the franchiser wallet information
    const updateData: any = {
      updatedAt: Date.now(),
    };

    if (args.brandWalletAddress) {
      updateData.brandWalletAddress = args.brandWalletAddress;
    }

    // Note: No longer storing secret keys or owner wallet addresses

    await ctx.db.patch(args.franchiserId, updateData);

    return { success: true };
  },
});

/**
 * Get franchiser by owner wallet address
 */
export const getFranchiserByWallet = query({
  args: {
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // First get the user profile by wallet address
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", args.walletAddress))
      .first();
    
    if (!userProfile) {
      return null;
    }
    
    // Then get franchiser by user ID
    const franchiser = await ctx.db
      .query("franchiser")
      .withIndex("by_ownerUser", (q) => q.eq("ownerUserId", userProfile._id))
      .first();

    if (!franchiser) {
      return null;
    }

    return {
      _id: franchiser._id,
      ownerUserId: franchiser.ownerUserId,
      brandWalletAddress: franchiser.brandWalletAddress,
      name: franchiser.name,
      slug: franchiser.slug,
      logoUrl: franchiser.logoUrl,
      status: franchiser.status,
      hasSecretKey: false, // No longer storing secret keys
      // Note: We don't return the secret key for security
    };
  },
});
