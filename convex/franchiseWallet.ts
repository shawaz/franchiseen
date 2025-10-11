import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a franchise wallet when franchise is approved
export const createFranchiseWallet = mutation({
  args: {
    franchiseId: v.id("franchises"),
    walletAddress: v.string(), // Solana wallet address
    initialBalance: v.optional(v.number()), // Initial SOL balance
  },
  handler: async (ctx, { franchiseId, walletAddress, initialBalance = 0 }) => {
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
      walletAddress,
      walletName,
      balance: initialBalance,
      usdBalance: initialBalance * 100, // Mock USD conversion (1 SOL = $100)
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
        usdAmount: initialBalance * 100,
        description: "Initial franchise funding",
        solanaTransactionHash: `initial_funding_${franchiseId}_${now}`,
        status: "confirmed",
        createdAt: now,
      });
    }

    return {
      walletId,
      walletAddress,
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
      franchise: franchise ? {
        name: franchise.businessName,
        slug: franchise.franchiseSlug,
        stage: franchise.stage,
        status: franchise.status,
      } : null,
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
      .withIndex("by_franchise_wallet", (q) => q.eq("franchiseWalletId", wallet._id))
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
    amount: v.number(),
    usdAmount: v.number(),
    description: v.string(),
    category: v.optional(v.string()),
    solanaTransactionHash: v.string(),
    fromAddress: v.optional(v.string()),
    toAddress: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("failed")
    )),
    metadata: v.optional(v.object({
      notes: v.optional(v.string()),
      attachments: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
    })),
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
      usdAmount: args.usdAmount,
      description: args.description,
      category: args.category,
      solanaTransactionHash: args.solanaTransactionHash,
      fromAddress: args.fromAddress,
      toAddress: args.toAddress,
      status: args.status || "confirmed",
      metadata: args.metadata,
      createdAt: now,
    });

    // Update wallet balances based on transaction type
    // Note: args.amount is SOL, args.usdAmount is USD
    let solBalanceChange = 0;
    let usdBalanceChange = 0;
    let incomeChange = 0;
    let expenseChange = 0;
    let payoutChange = 0;
    let royaltyChange = 0;

    switch (args.transactionType) {
      case "income":
      case "transfer_in":
      case "funding":
        solBalanceChange = args.amount; // SOL amount
        usdBalanceChange = args.usdAmount; // USD amount
        if (args.transactionType === "income") incomeChange = args.usdAmount; // Track income in USD
        break;
      case "expense":
      case "payout":
      case "royalty":
      case "transfer_out":
      case "refund":
        solBalanceChange = -args.amount; // SOL amount
        usdBalanceChange = -args.usdAmount; // USD amount
        if (args.transactionType === "expense") expenseChange = args.usdAmount; // Track expenses in USD
        if (args.transactionType === "payout") payoutChange = args.usdAmount;
        if (args.transactionType === "royalty") royaltyChange = args.usdAmount;
        break;
    }

    // Update wallet
    await ctx.db.patch(wallet._id, {
      balance: wallet.balance + solBalanceChange, // Update SOL balance
      usdBalance: wallet.usdBalance + usdBalanceChange, // Update USD balance
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
        amount: args.usdAmount,
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
    const wallets = await ctx.db
      .query("franchiseWallets")
      .collect();

    // Get franchise details for each wallet
    const walletsWithDetails = await Promise.all(
      wallets.map(async (wallet) => {
        const franchise = await ctx.db.get(wallet.franchiseId);
        return {
          ...wallet,
          franchise: franchise ? {
            name: franchise.businessName,
            slug: franchise.franchiseSlug,
            brand: franchise.franchiserId, // You might want to get brand name
            stage: franchise.stage,
            status: franchise.status,
          } : null,
        };
      })
    );

    return walletsWithDetails;
  },
});

// Fix invalid franchise wallet addresses
export const fixInvalidFranchiseWalletAddresses = mutation({
  args: {},
  handler: async (ctx) => {
    const wallets = await ctx.db.query("franchiseWallets").collect();
    const results = [];
    const { generateKeypair, encryptSecretKey } = await import('./walletKeypairs');
    
    for (const wallet of wallets) {
      try {
        // Check if the address is invalid (contains invalid base58 characters or wrong length)
        const hasInvalidFormat = 
          !wallet.walletAddress ||
          wallet.walletAddress.length !== 44 ||
          /[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/.test(wallet.walletAddress);
        
        if (hasInvalidFormat) {
          // Generate a new valid Solana keypair
          const walletKeypair = generateKeypair();
          
          // Update the wallet with the new address
          await ctx.db.patch(wallet._id, {
            walletAddress: walletKeypair.publicKey,
            walletSecretKey: encryptSecretKey(walletKeypair.secretKey),
            updatedAt: Date.now(),
          });
          
          results.push({
            walletId: wallet._id,
            franchiseId: wallet.franchiseId,
            oldAddress: wallet.walletAddress,
            newAddress: walletKeypair.publicKey,
            status: 'fixed'
          });
        }
      } catch (error) {
        results.push({
          walletId: wallet._id,
          oldAddress: wallet.walletAddress,
          error: error instanceof Error ? error.message : String(error),
          status: 'error'
        });
      }
    }
    
    return {
      message: `Processed ${wallets.length} franchise wallets, fixed ${results.length}`,
      fixed: results.filter(r => r.status === 'fixed').length,
      errors: results.filter(r => r.status === 'error').length,
      results: results
    };
  },
});

// Create a real Solana franchise wallet with actual keypair
export const createRealFranchiseWallet = mutation({
  args: {
    franchiseId: v.id("franchises"),
    walletAddress: v.string(), // Real Solana wallet address from frontend
    initialBalance: v.optional(v.number()), // Initial SOL balance
  },
  handler: async (ctx, { franchiseId, walletAddress, initialBalance = 0 }) => {
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
      walletAddress,
      walletName,
      balance: initialBalance,
      usdBalance: initialBalance * 150, // Convert SOL to USD at $150/SOL
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
        usdAmount: initialBalance * 150,
        description: "Initial franchise funding",
        solanaTransactionHash: `initial_funding_${franchiseId}_${now}`,
        status: "confirmed",
        createdAt: now,
      });
    }

    return {
      walletId,
      walletAddress,
      walletName,
      message: `Real franchise wallet created for ${franchise.businessName}`,
      note: "This wallet address will exist on the Solana blockchain"
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

    // Generate a real Solana keypair for the test wallet
    const { generateKeypair, encryptSecretKey } = await import('./walletKeypairs');
    const walletKeypair = generateKeypair();
    const walletName = `${franchise.businessName} Wallet`;

    console.log(`🔑 Generated real Solana wallet for test: ${walletKeypair.publicKey}`);

    // Create franchise wallet
    const walletId = await ctx.db.insert("franchiseWallets", {
      franchiseId,
      walletAddress: walletKeypair.publicKey, // Real Solana public key
      walletSecretKey: encryptSecretKey(walletKeypair.secretKey), // Store encrypted secret key
      walletName,
      balance: 0, // Start with 0 balance
      usdBalance: 0, // Start with 0 USD balance
      totalIncome: 1000,
      totalExpenses: 300,
      totalPayouts: 200,
      totalRoyalties: 100,
      monthlyRevenue: 500,
      monthlyExpenses: 200,
      transactionCount: 5,
      lastActivity: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return {
      walletId,
      walletAddress: walletKeypair.publicKey,
      message: `Test franchise wallet created for ${franchise.businessName}`,
    };
  },
});
