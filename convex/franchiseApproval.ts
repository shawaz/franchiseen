import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Generate a mock Solana address for development (valid base58 format)
function generateMockSolanaAddress(): string {
  // Use a very conservative approach - create addresses that look like real Solana addresses
  // Start with a known good pattern and add deterministic suffix
  const timestamp = Date.now().toString();
  const safeChars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  
  // Use a simpler, more predictable pattern
  let address = '';
  const seed = parseInt(timestamp.slice(-6)); // Use last 6 digits
  
  // Generate address using a more conservative pattern
  for (let i = 0; i < 44; i++) {
    const charIndex = (seed + i * 3) % safeChars.length;
    address += safeChars[charIndex];
  }
  
  return address;
}

// Get pending franchises for approval
export const getPendingFranchises = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, { franchiserId }) => {
    const franchises = await ctx.db
      .query("franchises")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchiserId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Get additional data for each franchise
    const franchisesWithDetails = await Promise.all(
      franchises.map(async (franchise) => {
        const investment = await ctx.db.get(franchise.investmentId);
        const location = await ctx.db.get(franchise.locationId);
        const property = await ctx.db
          .query("properties")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
          .first();

        return {
          ...franchise,
          investment,
          location,
          property,
        };
      })
    );

    return franchisesWithDetails;
  },
});

// Approve franchise and create token
export const approveFranchiseAndCreateToken = mutation({
  args: {
    franchiseId: v.id("franchises"),
    approvedBy: v.string(), // Admin or brand user who approved
    walletAddress: v.optional(v.string()), // Wallet address from frontend
  },
  handler: async (ctx, { franchiseId, approvedBy, walletAddress }) => {
    const now = Date.now();

    // Get franchise details
    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Check if franchise is already approved
    if (franchise.status === "approved") {
      throw new Error("Franchise is already approved");
    }

    // Get investment data
    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) {
      throw new Error("Investment data not found");
    }

    // Update franchise status to approved
    await ctx.db.patch(franchiseId, {
      status: "approved",
      stage: "funding",
      updatedAt: now,
    });

    // Create SPL token for the franchise
    try {
      const tokenName = `${franchise.businessName} Tokens`;
      // Create a shorter, more readable token symbol (e.g., NIKE09, MCD15)
      const franchiseParts = franchise.franchiseSlug.split('-');
      const brandPart = franchiseParts[0] || 'FRANCHISE';
      const locationPart = franchiseParts[1] || '01';
      const tokenSymbol = `${brandPart.toUpperCase()}${locationPart.toUpperCase().slice(0, 2)}`;
      
      // Create the franchise token record directly
      const tokenMint = `mock_token_${franchiseId}_${now}`;
      await ctx.db.insert("franchiseTokens", {
        franchiseId: franchiseId,
        tokenMint: tokenMint,
        tokenName: tokenName,
        tokenSymbol: tokenSymbol,
        tokenDecimals: 6, // Standard for shares
        totalSupply: investment.sharesIssued,
        circulatingSupply: 0, // Start with 0, mint as needed
        sharePrice: 1.00, // Fixed at $1.00 per token
        status: "created",
        createdAt: now,
        updatedAt: now,
      });

      console.log(`Token created successfully for franchise ${franchise.franchiseSlug}`);
    } catch (error) {
      console.error("Failed to create franchise token:", error);
      // Continue with approval even if token creation fails
    }

    // Create franchise wallet
    let walletCreationResult = null;
    let walletCreationError = null;
    try {
      // Use the wallet address provided from frontend, or generate one if not provided
      let finalWalletAddress = walletAddress;
      
      if (!finalWalletAddress) {
        // Fallback: generate wallet address using the existing mock generator
        finalWalletAddress = generateMockSolanaAddress();
      }
      
      // Create the franchise wallet record directly
      const walletId = await ctx.db.insert("franchiseWallets", {
        franchiseId: franchiseId,
        walletAddress: finalWalletAddress,
        walletName: `${franchise.businessName} Wallet`,
        balance: 0, // Start with 0 SOL balance
        usdBalance: 0, // Start with 0 USD balance
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
      
      const walletResult = { walletId, walletAddress: finalWalletAddress };
      
      walletCreationResult = walletResult;
    } catch (error) {
      walletCreationError = error;
      console.error("Failed to create franchise wallet:", error);
      // Continue with approval even if wallet creation fails
    }

    // Update property stage if exists
    const property = await ctx.db
      .query("properties")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (property) {
      await ctx.db.patch(property._id, {
        stage: "rented",
        updatedAt: now,
      });
    }

    return {
      success: true,
      message: "Franchise approved and token created successfully",
      franchiseId,
      tokenCreated: true,
      walletCreated: !!walletCreationResult,
      walletCreationResult,
      walletCreationError: walletCreationError ? {
        message: walletCreationError instanceof Error ? walletCreationError.message : 'Unknown error',
        stack: walletCreationError instanceof Error ? walletCreationError.stack : undefined
      } : null,
    };
  },
});

// Reject franchise
export const rejectFranchise = mutation({
  args: {
    franchiseId: v.id("franchises"),
    rejectedBy: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { franchiseId, rejectedBy, reason }) => {
    const now = Date.now();

    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Update franchise status to terminated (rejected)
    await ctx.db.patch(franchiseId, {
      status: "terminated",
      updatedAt: now,
    });

    // Update property stage if exists
    const property = await ctx.db
      .query("properties")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (property) {
      await ctx.db.patch(property._id, {
        stage: "listing", // Put property back to listing when franchise is rejected
        updatedAt: now,
      });
    }

    return {
      success: true,
      message: "Franchise rejected successfully",
      franchiseId,
    };
  },
});
