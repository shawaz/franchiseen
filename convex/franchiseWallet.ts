import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a franchise wallet when franchise is approved
export const createFranchiseWallet = mutation({
  args: {
    franchiseId: v.id("franchises"),
    stripeAccountId: v.optional(v.string()), // Stripe Connect account ID
    initialBalance: v.optional(v.number()), // Initial balance in INR paise
  },
  handler: async (ctx, { franchiseId, stripeAccountId, initialBalance = 0 }) => {
    const now = Date.now();

    // Check if wallet already exists for this franchise
    const existingWallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (existingWallet) {
      throw new Error("Franchise wallet already exists for this franchise");
    }

    // Get franchise details for wallet name
    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    const walletName = `${franchise.businessName} Wallet`;

    // Create franchise wallet
    const walletId = await ctx.db.insert("franchiseWallets", {
      franchiseId,
      walletAddress: `stripe-${franchiseId}`,
      stripeAccountId,
      walletName,
      balance: initialBalance,
      inrBalance: initialBalance,
      totalIncome: 0,
      totalExpenses: 0,
      totalPayouts: 0,
      totalRoyalties: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      transactionCount: 0,
      lastActivity: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Record initial funding transaction if there's an initial balance
    if (initialBalance > 0) {
      await ctx.db.insert("franchiseWalletTransactions", {
        franchiseWalletId: walletId,
        franchiseId,
        transactionType: "funding",
        amount: initialBalance,
        inrAmount: initialBalance,
        description: "Initial franchise funding",
        status: "confirmed",
        createdAt: now,
      });
    }

    return {
      walletId,
      message: `Franchise wallet created for ${franchise.businessName}`,
    };
  },
});

// Get franchise wallet by franchise ID
export const getFranchiseWallet = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (!wallet) {
      return null;
    }

    // Get franchise details
    const franchise = await ctx.db.get(franchiseId);

    return {
      ...wallet,
      franchise: franchise
        ? {
            name: franchise.businessName,
            slug: franchise.franchiseSlug,
            stage: franchise.stage,
            status: franchise.status,
          }
        : null,
    };
  },
});

// Get franchise wallet transactions
export const getFranchiseWalletTransactions = query({
  args: {
    franchiseId: v.id("franchises"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { franchiseId, limit = 50 }) => {
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (!wallet) {
      return [];
    }

    const transactions = await ctx.db
      .query("franchiseWalletTransactions")
      .withIndex("by_franchise_wallet", (q) =>
        q.eq("franchiseWalletId", wallet._id)
      )
      .order("desc")
      .take(limit);

    return transactions;
  },
});

// Add transaction to franchise wallet
export const addFranchiseWalletTransaction = mutation({
  args: {
    franchiseId: v.id("franchises"),
    transactionType: v.union(
      v.literal("income"),
      v.literal("expense"),
      v.literal("payout"),
      v.literal("royalty"),
      v.literal("transfer_in"),
      v.literal("transfer_out"),
      v.literal("funding"),
      v.literal("refund")
    ),
    amount: v.number(), // INR paise
    inrAmount: v.optional(v.number()),
    description: v.string(),
    category: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    fromAddress: v.optional(v.string()),
    toAddress: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("failed")
      )
    ),
    metadata: v.optional(
      v.object({
        notes: v.optional(v.string()),
        attachments: v.optional(v.array(v.string())),
        tags: v.optional(v.array(v.string())),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Get franchise wallet
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();

    if (!wallet) {
      throw new Error("Franchise wallet not found");
    }

    // Create transaction record
    const transactionId = await ctx.db.insert("franchiseWalletTransactions", {
      franchiseWalletId: wallet._id,
      franchiseId: args.franchiseId,
      transactionType: args.transactionType,
      amount: args.amount,
      inrAmount: args.inrAmount ?? args.amount,
      description: args.description,
      category: args.category,
      stripePaymentIntentId: args.stripePaymentIntentId,
      fromAddress: args.fromAddress,
      toAddress: args.toAddress,
      status: args.status || "confirmed",
      metadata: args.metadata,
      createdAt: now,
    });

    // Update wallet balances based on transaction type
    let balanceChange = 0;
    let incomeChange = 0;
    let expenseChange = 0;
    let payoutChange = 0;
    let royaltyChange = 0;

    switch (args.transactionType) {
      case "income":
      case "transfer_in":
      case "funding":
        balanceChange = args.amount;
        if (args.transactionType === "income") incomeChange = args.amount;
        break;
      case "expense":
      case "payout":
      case "royalty":
      case "transfer_out":
      case "refund":
        balanceChange = -args.amount;
        if (args.transactionType === "expense") expenseChange = args.amount;
        if (args.transactionType === "payout") payoutChange = args.amount;
        if (args.transactionType === "royalty") royaltyChange = args.amount;
        break;
    }

    // Update wallet
    await ctx.db.patch(wallet._id, {
      balance: wallet.balance + balanceChange,
      inrBalance: (wallet.inrBalance ?? wallet.balance) + balanceChange,
      totalIncome: wallet.totalIncome + incomeChange,
      totalExpenses: wallet.totalExpenses + expenseChange,
      totalPayouts: wallet.totalPayouts + payoutChange,
      totalRoyalties: wallet.totalRoyalties + royaltyChange,
      transactionCount: wallet.transactionCount + 1,
      lastActivity: now,
      updatedAt: now,
    });

    // Also create franchiseTransactions record for revenue tracking (for payouts)
    if (args.transactionType === "income") {
      await ctx.db.insert("franchiseTransactions", {
        franchiseId: args.franchiseId,
        walletId: wallet._id,
        type: "revenue",
        amount: args.amount,
        description: args.description,
        status: "completed",
        createdAt: now,
      });
    }

    return {
      transactionId,
      message: "Transaction added successfully",
    };
  },
});

// Update franchise wallet status
export const updateFranchiseWalletStatus = mutation({
  args: {
    franchiseId: v.id("franchises"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended"),
      v.literal("maintenance")
    ),
  },
  handler: async (ctx, { franchiseId, status }) => {
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (!wallet) {
      throw new Error("Franchise wallet not found");
    }

    await ctx.db.patch(wallet._id, {
      status,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: `Wallet status updated to ${status}`,
    };
  },
});

// Get all franchise wallets (for admin dashboard)
export const getAllFranchiseWallets = query({
  args: {},
  handler: async (ctx) => {
    const wallets = await ctx.db.query("franchiseWallets").collect();

    // Get franchise details for each wallet
    const walletsWithDetails = await Promise.all(
      wallets.map(async (wallet) => {
        const franchise = await ctx.db.get(wallet.franchiseId);
        return {
          ...wallet,
          franchise: franchise
            ? {
                name: franchise.businessName,
                slug: franchise.franchiseSlug,
                brand: franchise.franchiserId,
                stage: franchise.stage,
                status: franchise.status,
              }
            : null,
        };
      })
    );

    return walletsWithDetails;
  },
});

// Create a real franchise wallet linked to Stripe
export const createRealFranchiseWallet = mutation({
  args: {
    franchiseId: v.id("franchises"),
    stripeAccountId: v.optional(v.string()), // Stripe Connect account ID
    initialBalance: v.optional(v.number()), // Initial INR paise balance
  },
  handler: async (ctx, { franchiseId, stripeAccountId, initialBalance = 0 }) => {
    const now = Date.now();

    // Check if wallet already exists for this franchise
    const existingWallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (existingWallet) {
      throw new Error("Franchise wallet already exists for this franchise");
    }

    // Get franchise details for wallet name
    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    const walletName = `${franchise.businessName} Wallet`;

    // Create franchise wallet
    const walletId = await ctx.db.insert("franchiseWallets", {
      franchiseId,
      walletAddress: `stripe-${franchiseId}`,
      stripeAccountId,
      walletName,
      balance: initialBalance,
      inrBalance: initialBalance,
      totalIncome: 0,
      totalExpenses: 0,
      totalPayouts: 0,
      totalRoyalties: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      transactionCount: 0,
      lastActivity: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Record initial funding transaction if there's an initial balance
    if (initialBalance > 0) {
      await ctx.db.insert("franchiseWalletTransactions", {
        franchiseWalletId: walletId,
        franchiseId,
        transactionType: "funding",
        amount: initialBalance,
        inrAmount: initialBalance,
        description: "Initial franchise funding",
        status: "confirmed",
        createdAt: now,
      });
    }

    return {
      walletId,
      walletName,
      message: `Franchise wallet created for ${franchise.businessName}`,
    };
  },
});

// Create test franchise wallet (for development/testing)
export const createTestFranchiseWallet = mutation({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const now = Date.now();

    // Check if wallet already exists
    const existingWallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (existingWallet) {
      throw new Error("Franchise wallet already exists for this franchise");
    }

    // Get franchise details
    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    const walletName = `${franchise.businessName} Wallet`;

    // Create franchise wallet with test data
    const walletId = await ctx.db.insert("franchiseWallets", {
      franchiseId,
      walletAddress: `stripe-test-${franchiseId}`,
      walletName,
      balance: 0,
      inrBalance: 0,
      totalIncome: 100000, // 1000.00 INR in paise
      totalExpenses: 30000, // 300.00 INR in paise
      totalPayouts: 20000, // 200.00 INR in paise
      totalRoyalties: 10000, // 100.00 INR in paise
      monthlyRevenue: 50000, // 500.00 INR in paise
      monthlyExpenses: 20000, // 200.00 INR in paise
      transactionCount: 5,
      lastActivity: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return {
      walletId,
      message: `Test franchise wallet created for ${franchise.businessName}`,
    };
  },
});
