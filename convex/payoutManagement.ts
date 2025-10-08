import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Calculate payout distribution based on reserve balance
function calculatePayoutDistribution(
  franchiseWalletBalance: number,
  workingCapital: number,
  revenue: number
): {
  toTokenHolders: number;
  toReserve: number;
  reservePercentage: number;
  distributionRule: string;
} {
  const reservePercentage = (franchiseWalletBalance / workingCapital) * 100;
  
  let toTokenHoldersPercent = 0;
  let toReservePercent = 0;
  let distributionRule = '';
  
  if (reservePercentage < 25) {
    toTokenHoldersPercent = 25;
    toReservePercent = 75;
    distributionRule = 'Critical Reserve (< 25%)';
  } else if (reservePercentage < 50) {
    toTokenHoldersPercent = 50;
    toReservePercent = 50;
    distributionRule = 'Low Reserve (< 50%)';
  } else if (reservePercentage < 75) {
    toTokenHoldersPercent = 75;
    toReservePercent = 25;
    distributionRule = 'Building Reserve (< 75%)';
  } else {
    toTokenHoldersPercent = 100;
    toReservePercent = 0;
    distributionRule = 'Full Reserve (≥ 75%)';
  }
  
  return {
    toTokenHolders: (revenue * toTokenHoldersPercent) / 100,
    toReserve: (revenue * toReservePercent) / 100,
    reservePercentage,
    distributionRule
  };
}

// Process franchise payout
export const processFranchisePayout = mutation({
  args: {
    franchiseId: v.id("franchises"),
    revenue: v.number(), // Gross revenue for this period
    period: v.string(), // e.g., "2024-10-08" or "October 2024"
    payoutType: v.union(v.literal("daily"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get franchise details
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }
    
    // Only allow payouts for ongoing franchises
    if (franchise.stage !== "ongoing") {
      throw new Error("Payouts are only available for operational franchises");
    }
    
    // Get franchiser for royalty
    const franchiser = await ctx.db.get(franchise.franchiserId);
    if (!franchiser) {
      throw new Error("Franchiser not found");
    }
    
    // Get investment data for working capital
    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) {
      throw new Error("Investment data not found");
    }
    
    // Get franchise wallet
    const franchiseWallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    
    if (!franchiseWallet) {
      throw new Error("Franchise wallet not found");
    }
    
    console.log(`💰 Processing payout for ${franchise.franchiseSlug}`);
    console.log(`📊 Revenue: $${args.revenue.toLocaleString()}`);
    console.log(`💼 Current wallet balance: $${franchiseWallet.usdBalance.toLocaleString()}`);
    console.log(`🎯 Working capital target: $${investment.workingCapital.toLocaleString()}`);
    
    // Calculate fees
    const royaltyPercentage = franchiser.royaltyPercentage || 5; // Default 5%
    const platformFeePercentage = 2; // 2% platform fee
    
    const royaltyAmount = (args.revenue * royaltyPercentage) / 100;
    const platformFeeAmount = (args.revenue * platformFeePercentage) / 100;
    const netRevenue = args.revenue - royaltyAmount - platformFeeAmount;
    
    console.log(`💵 Royalty (${royaltyPercentage}%): $${royaltyAmount.toLocaleString()}`);
    console.log(`💵 Platform Fee (${platformFeePercentage}%): $${platformFeeAmount.toLocaleString()}`);
    console.log(`💵 Net Revenue: $${netRevenue.toLocaleString()}`);
    
    // Calculate distribution based on reserve balance
    const distribution = calculatePayoutDistribution(
      franchiseWallet.usdBalance,
      investment.workingCapital,
      netRevenue
    );
    
    console.log(`📈 Distribution Rule: ${distribution.distributionRule}`);
    console.log(`📈 To Token Holders: $${distribution.toTokenHolders.toLocaleString()}`);
    console.log(`📈 To Reserve: $${distribution.toReserve.toLocaleString()}`);
    
    // Get all token holders (shareholders)
    const shareholders = await ctx.db
      .query("franchiseShares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();
    
    const totalShares = shareholders.reduce((sum, s) => sum + s.sharesPurchased, 0);
    
    if (totalShares === 0) {
      throw new Error("No shareholders found for this franchise");
    }
    
    console.log(`👥 Total shareholders: ${shareholders.length}`);
    console.log(`🎫 Total shares: ${totalShares.toLocaleString()}`);
    
    // Create payout record
    const payoutId = await ctx.db.insert("franchisePayouts", {
      franchiseId: args.franchiseId,
      franchiserId: franchise.franchiserId,
      period: args.period,
      payoutType: args.payoutType,
      grossRevenue: args.revenue,
      royaltyAmount,
      platformFeeAmount,
      netRevenue,
      toTokenHolders: distribution.toTokenHolders,
      toReserve: distribution.toReserve,
      reserveBalanceBefore: franchiseWallet.usdBalance,
      reserveBalanceAfter: franchiseWallet.usdBalance + distribution.toReserve,
      reservePercentage: distribution.reservePercentage,
      distributionRule: distribution.distributionRule,
      totalShares,
      shareholderCount: shareholders.length,
      status: "processing",
      createdAt: now,
      processedAt: now,
    });
    
    console.log(`✅ Payout record created:`, payoutId);
    
    // Transfer royalty to brand wallet
    await ctx.db.insert("brandWalletTransactions", {
      franchiserId: franchise.franchiserId,
      franchiseId: args.franchiseId,
      type: "royalty",
      amount: royaltyAmount,
      description: `Royalty from ${franchise.franchiseSlug} - ${args.period}`,
      status: "completed",
      transactionHash: `royalty_${payoutId}_${now}`,
      createdAt: now,
    });

    console.log(`✅ Royalty transferred to brand wallet: $${royaltyAmount.toLocaleString()}`);
    
    // Create platform fee transaction (company income)
    await ctx.db.insert("companyIncome", {
      type: "platform_fee_payout",
      amount: platformFeeAmount,
      description: `Platform fee from ${franchise.franchiseSlug} payout - ${args.period}`,
      franchiseId: args.franchiseId,
      franchiserId: franchise.franchiserId,
      status: "completed",
      transactionHash: `platform_fee_${payoutId}_${now}`,
      createdAt: now,
    });
    
    console.log(`✅ Platform fee recorded: $${platformFeeAmount.toLocaleString()}`);
    
    // Update franchise wallet balance (add to reserve)
    const newWalletBalance = franchiseWallet.usdBalance + distribution.toReserve;
    await ctx.db.patch(franchiseWallet._id, {
      usdBalance: newWalletBalance,
      balance: newWalletBalance / 200, // Convert to SOL
      totalIncome: franchiseWallet.totalIncome + args.revenue,
      lastActivity: now,
      updatedAt: now,
    });
    
    console.log(`✅ Franchise wallet updated: $${franchiseWallet.usdBalance.toLocaleString()} → $${newWalletBalance.toLocaleString()}`);
    
    // Distribute to token holders
    const payoutPerShare = distribution.toTokenHolders / totalShares;
    const shareholderPayouts = [];
    
    for (const shareholder of shareholders) {
      const shareholderPayout = payoutPerShare * shareholder.sharesPurchased;
      
      // Create shareholder payout record
      const shareholderPayoutId = await ctx.db.insert("shareholderPayouts", {
        payoutId,
        franchiseId: args.franchiseId,
        investorId: shareholder.investorId,
        shares: shareholder.sharesPurchased,
        totalShares,
        sharePercentage: (shareholder.sharesPurchased / totalShares) * 100,
        payoutAmount: shareholderPayout,
        period: args.period,
        status: "completed",
        createdAt: now,
      });
      
      shareholderPayouts.push({
        investorId: shareholder.investorId,
        shares: shareholder.sharesPurchased,
        payout: shareholderPayout,
        payoutId: shareholderPayoutId
      });
    }
    
    console.log(`✅ Distributed $${distribution.toTokenHolders.toLocaleString()} to ${shareholders.length} shareholders`);
    
    // Update payout status to completed
    await ctx.db.patch(payoutId, {
          status: "completed",
      completedAt: now,
        });
    
    console.log(`🎉 Payout processing complete!`);

      return {
        success: true,
      payoutId,
      grossRevenue: args.revenue,
      royaltyAmount,
      platformFeeAmount,
      netRevenue,
      toTokenHolders: distribution.toTokenHolders,
      toReserve: distribution.toReserve,
      distributionRule: distribution.distributionRule,
      reservePercentage: distribution.reservePercentage,
      newReserveBalance: newWalletBalance,
      shareholderPayouts,
      payoutPerShare,
    };
  },
});

// Get franchise payout history
export const getFranchisePayouts = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const payouts = await ctx.db
      .query("franchisePayouts")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .order("desc")
          .collect();

    return payouts;
  },
});

// Get shareholder payout history for a specific investor
export const getShareholderPayouts = query({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.string()
  },
  handler: async (ctx, { franchiseId, investorId }) => {
    const payouts = await ctx.db
      .query("shareholderPayouts")
      .withIndex("by_franchise_investor", (q) => 
        q.eq("franchiseId", franchiseId).eq("investorId", investorId)
      )
      .order("desc")
      .collect();
    
    return payouts;
  },
});

// Get payout summary for franchise
export const getPayoutSummary = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const payouts = await ctx.db
      .query("franchisePayouts")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const totalGrossRevenue = payouts.reduce((sum, p) => sum + p.grossRevenue, 0);
    const totalRoyalty = payouts.reduce((sum, p) => sum + p.royaltyAmount, 0);
    const totalPlatformFee = payouts.reduce((sum, p) => sum + p.platformFeeAmount, 0);
    const totalToTokenHolders = payouts.reduce((sum, p) => sum + p.toTokenHolders, 0);
    const totalToReserve = payouts.reduce((sum, p) => sum + p.toReserve, 0);
    
    const latestPayout = payouts.length > 0 ? payouts[0] : null;

    return {
      totalPayouts: payouts.length,
      totalGrossRevenue,
      totalRoyalty,
      totalPlatformFee,
      totalToTokenHolders,
      totalToReserve,
      latestPayout,
      currentReserveBalance: latestPayout?.reserveBalanceAfter || 0,
      currentReservePercentage: latestPayout?.reservePercentage || 0,
    };
  },
});