import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create SPL token for a franchise
export const createFranchiseToken = mutation({
  args: {
    franchiseId: v.id("franchises"),
    tokenName: v.string(),
    tokenSymbol: v.string(),
    totalSupply: v.number(),
    sharePrice: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get franchise details
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Check if token already exists for this franchise
    const existingToken = await ctx.db
      .query("franchiseTokens")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();

    if (existingToken) {
      throw new Error("Token already exists for this franchise");
    }

    // TODO: In a real implementation, this would call Solana to create the SPL token
    // For now, we'll generate a mock token mint address
    const tokenMint = `mock_token_${args.franchiseId}_${now}`;

    // Create the franchise token record
    const tokenId = await ctx.db.insert("franchiseTokens", {
      franchiseId: args.franchiseId,
      tokenMint: tokenMint,
      tokenName: args.tokenName,
      tokenSymbol: args.tokenSymbol,
      tokenDecimals: 6, // Standard for shares
      totalSupply: args.totalSupply,
      circulatingSupply: 0, // Start with 0, mint as needed
      sharePrice: args.sharePrice,
      status: "created",
      createdAt: now,
      updatedAt: now,
    });

    return {
      tokenId,
      tokenMint,
      message: `Token ${args.tokenSymbol} created for franchise ${franchise.franchiseSlug}`,
    };
  },
});

// Mint tokens for a share purchase
export const mintTokensForPurchase = mutation({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.string(),
    amount: v.number(), // Number of tokens to mint
    totalValue: v.number(), // Total USD value
    transactionHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get franchise token
    const franchiseToken = await ctx.db
      .query("franchiseTokens")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();

    if (!franchiseToken) {
      throw new Error("Franchise token not found");
    }

    if (franchiseToken.status !== "active") {
      throw new Error("Token is not active for minting");
    }

    // Check if investor already has holdings
    let tokenHolding = await ctx.db
      .query("tokenHoldings")
      .withIndex("by_franchise_investor", (q) => 
        q.eq("franchiseId", args.franchiseId).eq("investorId", args.investorId)
      )
      .first();

    const pricePerToken = args.totalValue / args.amount;

    if (tokenHolding) {
      // Update existing holding
      const newBalance = tokenHolding.balance + args.amount;
      const newTotalPurchased = tokenHolding.totalPurchased + args.amount;
      const newAveragePrice = 
        ((tokenHolding.averagePurchasePrice * tokenHolding.totalPurchased) + args.totalValue) / newTotalPurchased;

      await ctx.db.patch(tokenHolding._id, {
        balance: newBalance,
        totalPurchased: newTotalPurchased,
        averagePurchasePrice: newAveragePrice,
        lastTransactionAt: now,
        updatedAt: now,
      });
    } else {
      // Create new holding
      await ctx.db.insert("tokenHoldings", {
        franchiseId: args.franchiseId,
        tokenMint: franchiseToken.tokenMint,
        investorId: args.investorId,
        balance: args.amount,
        totalPurchased: args.amount,
        totalSold: 0,
        averagePurchasePrice: pricePerToken,
        lastTransactionAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Update franchise token circulating supply
    await ctx.db.patch(franchiseToken._id, {
      circulatingSupply: franchiseToken.circulatingSupply + args.amount,
      updatedAt: now,
    });

    // Record the transaction
    await ctx.db.insert("tokenTransactions", {
      franchiseId: args.franchiseId,
      tokenMint: franchiseToken.tokenMint,
      fromInvestorId: undefined, // Minting from nowhere
      toInvestorId: args.investorId,
      amount: args.amount,
      transactionType: "mint",
      pricePerToken: pricePerToken,
      totalValue: args.totalValue,
      solanaTransactionHash: args.transactionHash,
      status: "confirmed",
      createdAt: now,
    });

    return {
      success: true,
      message: `Minted ${args.amount} tokens for investor ${args.investorId}`,
    };
  },
});

// Burn tokens for refunds
export const burnTokensForRefund = mutation({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.string(),
    amount: v.number(), // Number of tokens to burn
    refundTransactionHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get investor's token holding
    const tokenHolding = await ctx.db
      .query("tokenHoldings")
      .withIndex("by_franchise_investor", (q) => 
        q.eq("franchiseId", args.franchiseId).eq("investorId", args.investorId)
      )
      .first();

    if (!tokenHolding) {
      throw new Error("No token holdings found for this investor");
    }

    if (tokenHolding.balance < args.amount) {
      throw new Error("Insufficient token balance for refund");
    }

    // Get franchise token
    const franchiseToken = await ctx.db
      .query("franchiseTokens")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();
    
    if (!franchiseToken) {
      throw new Error("Franchise token not found");
    }

    // Update token holding
    const newBalance = tokenHolding.balance - args.amount;
    const newTotalSold = tokenHolding.totalSold + args.amount;

    await ctx.db.patch(tokenHolding._id, {
      balance: newBalance,
      totalSold: newTotalSold,
      lastTransactionAt: now,
      updatedAt: now,
    });

    // Update franchise token circulating supply
    await ctx.db.patch(franchiseToken._id, {
      circulatingSupply: franchiseToken.circulatingSupply - args.amount,
      updatedAt: now,
    });

    // Record the transaction
    await ctx.db.insert("tokenTransactions", {
      franchiseId: args.franchiseId,
      tokenMint: franchiseToken.tokenMint,
      fromInvestorId: args.investorId,
      toInvestorId: undefined, // Burning to nowhere
      amount: args.amount,
      transactionType: "burn",
      pricePerToken: tokenHolding.averagePurchasePrice,
      totalValue: args.amount * tokenHolding.averagePurchasePrice,
      solanaTransactionHash: args.refundTransactionHash,
      status: "confirmed",
      createdAt: now,
    });

    return {
      success: true,
      message: `Burned ${args.amount} tokens for investor ${args.investorId}`,
    };
  },
});

// Get token holdings for an investor
export const getTokenHoldingsByInvestor = query({
  args: { investorId: v.string() },
  handler: async (ctx, { investorId }) => {
    const holdings = await ctx.db
      .query("tokenHoldings")
      .withIndex("by_investor", (q) => q.eq("investorId", investorId))
      .collect();

    // Get franchise and token details for each holding
    const holdingsWithDetails = await Promise.all(
      holdings.map(async (holding) => {
        const franchise = await ctx.db.get(holding.franchiseId);
        const franchiseToken = await ctx.db
          .query("franchiseTokens")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", holding.franchiseId))
          .first();

        return {
          ...holding,
          franchise: franchise ? {
            franchiseSlug: franchise.franchiseSlug,
            businessName: franchise.businessName,
            stage: franchise.stage,
          } : null,
          token: franchiseToken ? {
            tokenName: franchiseToken.tokenName,
            tokenSymbol: franchiseToken.tokenSymbol,
            sharePrice: franchiseToken.sharePrice,
            status: franchiseToken.status,
          } : null,
        };
      })
    );

    return holdingsWithDetails;
  },
});

// Get token details for a franchise
export const getFranchiseToken = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const franchiseToken = await ctx.db
      .query("franchiseTokens")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (!franchiseToken) {
      return null;
    }

    // Get franchise details
    const franchise = await ctx.db.get(franchiseId);

    return {
      ...franchiseToken,
      franchise: franchise ? {
        franchiseSlug: franchise.franchiseSlug,
        businessName: franchise.businessName,
        stage: franchise.stage,
      } : null,
    };
  },
});

// Get token transactions for a franchise
export const getTokenTransactions = query({
  args: { 
    franchiseId: v.id("franchises"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { franchiseId, limit = 50 }) => {
    const transactions = await ctx.db
      .query("tokenTransactions")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .order("desc")
      .take(limit);

    return transactions;
  },
});

// Activate franchise token (call this when funding starts)
export const activateFranchiseToken = mutation({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const franchiseToken = await ctx.db
      .query("franchiseTokens")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (!franchiseToken) {
      throw new Error("Franchise token not found");
    }

    await ctx.db.patch(franchiseToken._id, {
      status: "active",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `Token ${franchiseToken.tokenSymbol} activated for trading`,
    };
  },
});

// Pause franchise token (call this when funding is paused)
export const pauseFranchiseToken = mutation({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const franchiseToken = await ctx.db
      .query("franchiseTokens")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();
    
    if (!franchiseToken) {
      throw new Error("Franchise token not found");
    }

    await ctx.db.patch(franchiseToken._id, {
      status: "paused",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `Token ${franchiseToken.tokenSymbol} paused`,
    };
  },
});