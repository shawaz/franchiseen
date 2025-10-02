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
      brandWalletSecretKey: args.encryptedSecretKey,
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
      ownerWalletAddress: franchiser.ownerWalletAddress,
      brandWalletAddress: franchiser.brandWalletAddress,
      hasSecretKey: !!franchiser.brandWalletSecretKey,
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

    if (args.ownerWalletAddress) {
      updateData.ownerWalletAddress = args.ownerWalletAddress;
    }

    if (args.brandWalletAddress) {
      updateData.brandWalletAddress = args.brandWalletAddress;
    }

    if (args.encryptedSecretKey) {
      updateData.brandWalletSecretKey = args.encryptedSecretKey;
    }

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
    const franchiser = await ctx.db
      .query("franchiser")
      .withIndex("by_ownerWallet", (q) => q.eq("ownerWalletAddress", args.walletAddress))
      .first();

    if (!franchiser) {
      return null;
    }

    return {
      _id: franchiser._id,
      ownerWalletAddress: franchiser.ownerWalletAddress,
      brandWalletAddress: franchiser.brandWalletAddress,
      name: franchiser.name,
      slug: franchiser.slug,
      logoUrl: franchiser.logoUrl,
      status: franchiser.status,
      hasSecretKey: !!franchiser.brandWalletSecretKey,
      // Note: We don't return the secret key for security
    };
  },
});
