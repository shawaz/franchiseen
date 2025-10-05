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

/**
 * Get brand wallet transactions for a franchiser
 */
export const getBrandWalletTransactions = query({
  args: {
    franchiserId: v.id("franchiser"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("brandWalletTransactions")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .order("desc")
      .take(args.limit || 50);

    // Get franchise details for transactions that have franchiseId
    const transactionsWithDetails = await Promise.all(
      transactions.map(async (transaction) => {
        let franchise = null;
        if (transaction.franchiseId) {
          franchise = await ctx.db.get(transaction.franchiseId);
        }

        return {
          ...transaction,
          franchise: franchise ? {
            _id: franchise._id,
            franchiseSlug: franchise.franchiseSlug,
            title: franchise.franchiseSlug
          } : null
        };
      })
    );

    return transactionsWithDetails;
  },
});

/**
 * Get brand wallet balance (sum of all transactions)
 */
export const getBrandWalletBalance = query({
  args: {
    franchiserId: v.id("franchiser"),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("brandWalletTransactions")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Calculate total balance (incoming - outgoing)
    let balance = 0;
    for (const transaction of transactions) {
      if (transaction.type === "franchise_funding_complete" || 
          transaction.type === "franchise_fee" || 
          transaction.type === "setup_cost" ||
          transaction.type === "revenue") {
        balance += transaction.amount;
      } else if (transaction.type === "expense" || transaction.type === "transfer") {
        balance -= transaction.amount;
      }
    }

    return {
      balance,
      transactionCount: transactions.length,
      lastTransaction: transactions.length > 0 ? transactions[0] : null
    };
  },
});
