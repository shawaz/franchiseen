import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Create a new franchise
export const createFranchise = mutation({
  args: {
    franchiserId: v.id("franchiser"),
    franchiseeId: v.string(),
    locationId: v.id("franchiserLocations"),
    franchiseSlug: v.string(),
    businessName: v.string(),
    address: v.string(),
    // Detailed location structure
    location: v.object({
      area: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      pincode: v.optional(v.string()),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    }),
    buildingName: v.optional(v.string()),
    doorNumber: v.optional(v.string()),
    sqft: v.number(),
    isOwned: v.boolean(),
    landlordContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      email: v.string(),
    })),
    franchiseeContact: v.object({
      name: v.string(),
      phone: v.string(),
      email: v.string(),
    }),
    investment: v.object({
      totalInvestment: v.number(),
      totalInvested: v.number(),
      sharesIssued: v.number(),
      sharesPurchased: v.number(),
      sharePrice: v.number(),
      franchiseFee: v.number(),
      setupCost: v.number(),
      workingCapital: v.number(),
      minimumInvestment: v.number(),
      maximumInvestment: v.optional(v.number()),
      expectedReturn: v.optional(v.number()),
      investmentStartDate: v.optional(v.number()),
      investmentEndDate: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create the investment record first
    const investmentId = await ctx.db.insert("investments", {
      // franchiseId will be set after franchise creation
      totalInvestment: args.investment.totalInvestment,
      totalInvested: args.investment.totalInvested,
      sharesIssued: args.investment.sharesIssued,
      sharesPurchased: args.investment.sharesPurchased,
      sharePrice: args.investment.sharePrice,
      franchiseFee: args.investment.franchiseFee,
      setupCost: args.investment.setupCost,
      workingCapital: args.investment.workingCapital,
      minimumInvestment: args.investment.minimumInvestment,
      maximumInvestment: args.investment.maximumInvestment,
      expectedReturn: args.investment.expectedReturn,
      investmentStartDate: args.investment.investmentStartDate,
      investmentEndDate: args.investment.investmentEndDate,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    
    // Create the franchise with reference to investment
    const franchiseId = await ctx.db.insert("franchises", {
      franchiserId: args.franchiserId,
      franchiseeId: args.franchiseeId,
      locationId: args.locationId,
      franchiseSlug: args.franchiseSlug,
      businessName: args.businessName,
      address: args.address,
      location: args.location,
      buildingName: args.buildingName,
      doorNumber: args.doorNumber,
      sqft: args.sqft,
      isOwned: args.isOwned,
      landlordContact: args.landlordContact,
      franchiseeContact: args.franchiseeContact,
      investmentId: investmentId,
      status: "pending",
      stage: "funding",
      createdAt: now,
      updatedAt: now,
    });

    // Update the investment record with the franchise ID
    await ctx.db.patch(investmentId, {
      franchiseId: franchiseId,
    });

      // Token creation will happen during approval process
      // No automatic token creation here

    return franchiseId;
  },
});

// Update franchise stage
export const updateFranchiseStage = mutation({
  args: {
    franchiseId: v.id("franchises"),
    stage: v.union(
      v.literal("funding"),
      v.literal("launching"),
      v.literal("ongoing"),
      v.literal("closed")
    ),
    subStage: v.optional(v.union(
      v.literal("contacting_property"),
      v.literal("checking_location"),
      v.literal("signing_agreement"),
      v.literal("creating_pda"),
      v.literal("collecting_investments"),
      v.literal("transferring_fees"),
      v.literal("setting_up"),
      v.literal("operational"),
      v.literal("closing")
    )),
    progress: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Update franchise table
    await ctx.db.patch(args.franchiseId, {
      stage: args.stage,
      updatedAt: now,
    });
    
    // Update or create franchise stage tracking
    const existingStage = await ctx.db
      .query("franchiseStages")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();
    
    if (existingStage) {
      await ctx.db.patch(existingStage._id, {
        currentStage: args.stage,
        subStage: args.subStage,
        progress: args.progress ?? existingStage.progress,
        notes: args.notes,
        updatedAt: now,
      });
    } else {
      const franchise = await ctx.db.get(args.franchiseId);
      if (franchise) {
        await ctx.db.insert("franchiseStages", {
          franchiseId: args.franchiseId,
          franchiserId: franchise.franchiserId,
          currentStage: args.stage,
          subStage: args.subStage,
          progress: args.progress ?? 0,
          stageStartDate: now,
          notes: args.notes,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    
    return args.franchiseId;
  },
});

// Check and transition franchise stage when funding is complete
export const checkAndTransitionFranchiseStage = mutation({
  args: {
    franchiseId: v.id("franchises"),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) {
      throw new Error("Investment data not found");
    }

    // Check if funding is complete (100% or more)
    const fundingProgress = investment.totalInvestment > 0 
      ? (investment.totalInvested / investment.totalInvestment) * 100 
      : 0;

    if (fundingProgress >= 100 && franchise.stage === "funding") {
      // Update franchise stage to launching
      await ctx.db.patch(args.franchiseId, {
        stage: "launching",
        updatedAt: Date.now(),
      });

      // Create setup table entry with 45-day launch timeline
      const now = Date.now();
      const launchDate = now + (45 * 24 * 60 * 60 * 1000); // 45 days from now

      await ctx.db.insert("franchiseSetup", {
        franchiseId: args.franchiseId,
        franchiserId: franchise.franchiserId,
        projectName: `${franchise.franchiseSlug} Setup`,
        franchiseeName: franchise.franchiseeContact.name,
        location: franchise.address,
        startDate: now,
        targetLaunchDate: launchDate,
        status: "not_started",
        progress: 0,
        investmentAmount: investment.totalInvestment,
        investmentReceived: true,
        createdAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        newStage: "launching",
        setupCreated: true,
        launchDate: new Date(launchDate).toISOString(),
      };
    }

    return {
      success: false,
      currentStage: franchise.stage,
      fundingProgress,
    };
  },
});

// Get all franchises
export const getFranchises = query({
  args: { 
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("suspended"),
      v.literal("terminated")
    )),
    stage: v.optional(v.union(
      v.literal("funding"),
      v.literal("launching"),
      v.literal("ongoing"),
      v.literal("closed")
    ))
  },
  handler: async (ctx, { limit = 50, status, stage }) => {
    let query = ctx.db.query("franchises");
    
    if (status) {
      query = query.filter((q) => q.eq(q.field("status"), status));
    }
    
    if (stage) {
      query = query.filter((q) => q.eq(q.field("stage"), stage));
    }
    
    const franchises = await query
      .order("desc")
      .take(limit);

    // Get additional details for each franchise
    const franchisesWithDetails = await Promise.all(
      franchises.map(async (franchise) => {
        const franchiser = await ctx.db.get(franchise.franchiserId);
        const location = await ctx.db.get(franchise.locationId);
        const investment = await ctx.db.get(franchise.investmentId);
        
        // Get unique investor count for this franchise
        const shares = await ctx.db
          .query("franchiseShares")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
          .filter((q) => q.eq(q.field("status"), "confirmed"))
          .collect();
        
        // Count unique investors (wallet addresses)
        const uniqueInvestors = new Set(shares.map(share => share.investorId));
        const investorCount = uniqueInvestors.size;
        
        return {
          ...franchise,
          franchiser,
          location,
          investment,
          investorCount,
        };
      })
    );

    return franchisesWithDetails;
  },
});

// Get franchises with resolved industry and category names for search suggestions
export const getFranchisesForSearch = query({
  args: { 
    limit: v.optional(v.number()),
    search: v.optional(v.string())
  },
  handler: async (ctx, { limit = 50, search }) => {
    let query = ctx.db.query("franchises");
    
    const franchises = await query
      .order("desc")
      .take(limit);

    // Get additional details for each franchise with resolved names
    const franchisesWithDetails = await Promise.all(
      franchises.map(async (franchise) => {
        const franchiser = await ctx.db.get(franchise.franchiserId);
        const location = await ctx.db.get(franchise.locationId);
        
        if (!franchiser) return null;
        
        // Resolve industry and category names if they are IDs
        let industryName = franchiser.industry;
        let categoryName = franchiser.category;
        
        // Try to resolve industry name if it's an ID
        if (franchiser.industry && (franchiser.industry.startsWith('j') || franchiser.industry.startsWith('k'))) {
          try {
            const industry = await ctx.db.get(franchiser.industry as any);
            if (industry && 'name' in industry) {
              industryName = (industry as any).name;
            }
          } catch (e) {
            console.log("Could not fetch industry:", e);
          }
        }
        
        // Try to resolve category name if it's an ID
        if (franchiser.category && (franchiser.category.startsWith('j') || franchiser.category.startsWith('k'))) {
          try {
            const category = await ctx.db.get(franchiser.category as any);
            if (category && 'name' in category) {
              categoryName = (category as any).name;
            }
          } catch (e) {
            console.log("Could not fetch category:", e);
          }
        }
        
        return {
          ...franchise,
          franchiser: {
            ...franchiser,
            industry: industryName,
            category: categoryName,
          },
          location,
        };
      })
    );

    // Filter out null values
    const validFranchises = franchisesWithDetails.filter(f => f !== null);
    
    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      return validFranchises.filter(franchise => {
        return (
          franchise.franchiseSlug?.toLowerCase().includes(searchLower) ||
          franchise.franchiser?.name?.toLowerCase().includes(searchLower) ||
          franchise.franchiser?.industry?.toLowerCase().includes(searchLower) ||
          franchise.franchiser?.category?.toLowerCase().includes(searchLower) ||
          franchise.address?.toLowerCase().includes(searchLower)
        );
      });
    }

    return validFranchises;
  },
});

// Get franchise by slug
export const getFranchiseBySlug = query({
  args: { franchiseSlug: v.string() },
  handler: async (ctx, { franchiseSlug }) => {
    const franchise = await ctx.db
      .query("franchises")
      .withIndex("by_slug", (q) => q.eq("franchiseSlug", franchiseSlug))
      .first();

    if (!franchise) return null;

    // Get franchiser details
    const franchiser = await ctx.db.get(franchise.franchiserId);
    
    // Get location details
    const location = await ctx.db.get(franchise.locationId);

    // Get investment details
    const investment = await ctx.db.get(franchise.investmentId);

    return {
      ...franchise,
      franchiser,
      location,
      investment,
    };
  },
});

// Get franchises by franchiser with investment data
export const getFranchisesByFranchiser = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, { franchiserId }) => {
    const franchises = await ctx.db
      .query("franchises")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchiserId))
      .collect();

    // Get investment data for each franchise
    const franchisesWithInvestment = await Promise.all(
      franchises.map(async (franchise) => {
        const investment = await ctx.db.get(franchise.investmentId);
        return {
          ...franchise,
          investment: investment || {
            totalInvestment: 0,
            totalInvested: 0,
            sharesIssued: 0,
            sharesPurchased: 0,
            pricePerShare: 0,
            franchiseFee: 0,
            setupCost: 0,
            workingCapital: 0,
          },
        };
      })
    );

    return franchisesWithInvestment;
  },
});

// Get franchises by franchisee
export const getFranchisesByFranchisee = query({
  args: { franchiseeId: v.string() },
  handler: async (ctx, { franchiseeId }) => {
    const franchises = await ctx.db
      .query("franchises")
      .withIndex("by_franchisee", (q) => q.eq("franchiseeId", franchiseeId))
      .collect();

    return franchises;
  },
});

// Get franchises by stage
export const getFranchisesByStage = query({
  args: { 
    stage: v.union(
      v.literal("funding"),
      v.literal("launching"),
      v.literal("ongoing"),
      v.literal("closed")
    ),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { stage, limit = 50 }) => {
    const franchises = await ctx.db
      .query("franchises")
      .withIndex("by_stage", (q) => q.eq("stage", stage))
      .order("desc")
      .take(limit);

    // Get additional details for each franchise
    const franchisesWithDetails = await Promise.all(
      franchises.map(async (franchise) => {
        const franchiser = await ctx.db.get(franchise.franchiserId);
        const location = await ctx.db.get(franchise.locationId);
        const investment = await ctx.db.get(franchise.investmentId);
        
        return {
          ...franchise,
          franchiser,
          location,
          investment,
        };
      })
    );

    return franchisesWithDetails;
  },
});

// Generate next franchise slug
export const generateFranchiseSlug = mutation({
  args: { franchiserSlug: v.string() },
  handler: async (ctx, { franchiserSlug }) => {
    // Get all existing franchises for this franchiser
    const franchiser = await ctx.db
      .query("franchiser")
      .filter((q) => q.eq(q.field("slug"), franchiserSlug))
      .first();

    if (!franchiser) {
      throw new Error("Franchiser not found");
    }

    const existingFranchises = await ctx.db
      .query("franchises")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchiser._id))
      .collect();

    // Find the next available number
    let nextNumber = 1;
    const usedNumbers = existingFranchises
      .map(f => {
        const match = f.franchiseSlug.match(new RegExp(`^${franchiserSlug}-(\\d+)$`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0)
      .sort((a, b) => a - b);

    for (const num of usedNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    return `${franchiserSlug}-${nextNumber.toString().padStart(2, '0')}`;
  },
});

// Purchase shares
export const purchaseShares = mutation({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.string(),
    sharesPurchased: v.number(),
    sharePrice: v.number(),
    totalAmount: v.number(),
    transactionHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get the franchise to find the investment record
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Get the investment record
    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) {
      throw new Error("Investment record not found for franchise");
    }

    // Insert the share purchase record
    const shareId = await ctx.db.insert("franchiseShares", {
      ...args,
      status: "confirmed",
      purchasedAt: now,
      createdAt: now,
    });

    // Update the investment record with new totals
    const newTotalInvested = investment.totalInvested + args.totalAmount;
    const newSharesPurchased = investment.sharesPurchased + args.sharesPurchased;

    await ctx.db.patch(investment._id, {
      totalInvested: newTotalInvested,
      sharesPurchased: newSharesPurchased,
      updatedAt: now,
    });

    // Check if funding is now complete and transition stage if needed
    const fundingProgress = investment.totalInvestment > 0 
      ? (newTotalInvested / investment.totalInvestment) * 100 
      : 0;

    if (fundingProgress >= 100 && franchise.stage === "funding") {
      // Update franchise stage to launching
      await ctx.db.patch(args.franchiseId, {
        stage: "launching",
        updatedAt: now,
      });

      // Get franchiser to access brand wallet
      const franchiser = await ctx.db.get(franchise.franchiserId);
      if (!franchiser) {
        throw new Error("Franchiser not found");
      }

      // Calculate fund distribution:
      // - Franchise Fee → Brand Wallet
      // - Setup Cost → Brand Wallet  
      // - Working Capital → Franchise Wallet
      const franchiseFee = investment.franchiseFee;
      const setupCost = investment.setupCost;
      const workingCapital = investment.workingCapital;

      // Transfer funds to franchise wallet from escrow/PDA
      const franchiseWallet = await ctx.db
        .query("franchiseWallets")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
        .first();

      if (franchiseWallet) {
        // Update franchise wallet balance with only working capital
        await ctx.db.patch(franchiseWallet._id, {
          balance: workingCapital / 200, // Convert USD to SOL (assuming $200 per SOL)
          usdBalance: workingCapital,
          updatedAt: now,
        });

        // Record the working capital transfer transaction
        await ctx.db.insert("franchiseWalletTransactions", {
          franchiseWalletId: franchiseWallet._id,
          franchiseId: args.franchiseId,
          transactionType: "funding",
          amount: workingCapital / 200, // Convert USD to SOL (assuming $200 per SOL)
          usdAmount: workingCapital,
          description: `Working capital transferred to franchise wallet: $${workingCapital.toLocaleString()}`,
          solanaTransactionHash: `working_capital_${args.franchiseId}_${now}`,
          status: "confirmed",
          createdAt: now,
        });

        // Transfer franchise fee to brand wallet
        await ctx.db.insert("brandWalletTransactions", {
          franchiserId: franchise.franchiserId,
          franchiseId: args.franchiseId,
          type: "franchise_fee",
          amount: franchiseFee,
          description: `Franchise fee received from ${franchise.franchiseSlug}: $${franchiseFee.toLocaleString()}`,
          status: "completed",
          transactionHash: `franchise_fee_${args.franchiseId}_${now}`,
          createdAt: now,
        });

        // Transfer setup cost to brand wallet
        await ctx.db.insert("brandWalletTransactions", {
          franchiserId: franchise.franchiserId,
          franchiseId: args.franchiseId,
          type: "setup_cost",
          amount: setupCost,
          description: `Setup cost received from ${franchise.franchiseSlug}: $${setupCost.toLocaleString()}`,
          status: "completed",
          transactionHash: `setup_cost_${args.franchiseId}_${now}`,
          createdAt: now,
        });
      }


      // Create setup table entry with 45-day launch timeline
      const launchDate = now + (45 * 24 * 60 * 60 * 1000); // 45 days from now

      await ctx.db.insert("franchiseSetup", {
        franchiseId: args.franchiseId,
        franchiserId: franchise.franchiserId,
        projectName: `${franchise.franchiseSlug} Setup`,
        franchiseeName: franchise.franchiseeContact.name,
        location: franchise.address,
        startDate: now,
        targetLaunchDate: launchDate,
        status: "not_started",
        progress: 0,
        investmentAmount: investment.totalInvestment,
        investmentReceived: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return shareId;
  },
});

// Purchase shares by franchise slug
export const purchaseSharesBySlug = mutation({
  args: {
    franchiseSlug: v.string(),
    investorId: v.string(),
    sharesPurchased: v.number(),
    sharePrice: v.number(),
    totalAmount: v.number(),
    transactionHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the franchise by slug first
    const franchise = await ctx.db
      .query("franchises")
      .withIndex("by_slug", (q) => q.eq("franchiseSlug", args.franchiseSlug))
      .first();
    
    if (!franchise) {
      throw new Error(`Franchise with slug ${args.franchiseSlug} not found`);
    }

    // Get the investment record
    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) {
      throw new Error("Investment record not found for franchise");
    }

    const now = Date.now();
    
    // Insert the share purchase record
    const shareId = await ctx.db.insert("franchiseShares", {
      franchiseId: franchise._id,
      investorId: args.investorId,
      sharesPurchased: args.sharesPurchased,
      sharePrice: args.sharePrice,
      totalAmount: args.totalAmount,
      transactionHash: args.transactionHash,
      status: "confirmed",
      purchasedAt: now,
      createdAt: now,
    });

    // Mint tokens for the share purchase
    try {
      await ctx.runMutation(api.tokenManagement.mintTokensForPurchase, {
        franchiseId: franchise._id,
        investorId: args.investorId,
        amount: args.sharesPurchased, // 1 share = 1 token
        totalValue: args.totalAmount,
        transactionHash: args.transactionHash,
      });
    } catch (error) {
      console.error("Failed to mint tokens:", error);
      // Continue with share purchase even if token minting fails
    }

    // Update the investment record with new totals
    const newTotalInvested = investment.totalInvested + args.totalAmount;
    const newSharesPurchased = investment.sharesPurchased + args.sharesPurchased;

    await ctx.db.patch(investment._id, {
      totalInvested: newTotalInvested,
      sharesPurchased: newSharesPurchased,
      updatedAt: now,
    });

    // Check if funding is now complete and transition stage if needed
    const fundingProgress = investment.totalInvestment > 0 
      ? (newTotalInvested / investment.totalInvestment) * 100 
      : 0;

    if (fundingProgress >= 100 && franchise.stage === "funding") {
      // Update franchise stage to launching
      await ctx.db.patch(franchise._id, {
        stage: "launching",
        updatedAt: now,
      });

      // Get franchiser to access brand wallet
      const franchiser = await ctx.db.get(franchise.franchiserId);
      if (!franchiser) {
        throw new Error("Franchiser not found");
      }

      // Calculate fund distribution:
      // - Franchise Fee → Brand Wallet
      // - Setup Cost → Brand Wallet  
      // - Working Capital → Franchise Wallet
      const franchiseFee = investment.franchiseFee;
      const setupCost = investment.setupCost;
      const workingCapital = investment.workingCapital;

      // Transfer funds to franchise wallet from escrow/PDA
      const franchiseWallet = await ctx.db
        .query("franchiseWallets")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
        .first();

      if (franchiseWallet) {
        // Update franchise wallet balance with only working capital
        await ctx.db.patch(franchiseWallet._id, {
          balance: workingCapital / 200, // Convert USD to SOL (assuming $200 per SOL)
          usdBalance: workingCapital,
          updatedAt: now,
        });

        // Record the working capital transfer transaction
        await ctx.db.insert("franchiseWalletTransactions", {
          franchiseWalletId: franchiseWallet._id,
          franchiseId: franchise._id,
          transactionType: "funding",
          amount: workingCapital / 200, // Convert USD to SOL (assuming $200 per SOL)
          usdAmount: workingCapital,
          description: `Working capital transferred to franchise wallet: $${workingCapital.toLocaleString()}`,
          solanaTransactionHash: `working_capital_${franchise._id}_${now}`,
          status: "confirmed",
          createdAt: now,
        });

        // Transfer franchise fee to brand wallet
        await ctx.db.insert("brandWalletTransactions", {
          franchiserId: franchise.franchiserId,
          franchiseId: franchise._id,
          type: "franchise_fee",
          amount: franchiseFee,
          description: `Franchise fee received from ${franchise.franchiseSlug}: $${franchiseFee.toLocaleString()}`,
          status: "completed",
          transactionHash: `franchise_fee_${franchise._id}_${now}`,
          createdAt: now,
        });

        // Transfer setup cost to brand wallet
        await ctx.db.insert("brandWalletTransactions", {
          franchiserId: franchise.franchiserId,
          franchiseId: franchise._id,
          type: "setup_cost",
          amount: setupCost,
          description: `Setup cost received from ${franchise.franchiseSlug}: $${setupCost.toLocaleString()}`,
          status: "completed",
          transactionHash: `setup_cost_${franchise._id}_${now}`,
          createdAt: now,
        });
      }

      // Create setup table entry with 45-day launch timeline
      const launchDate = now + (45 * 24 * 60 * 60 * 1000); // 45 days from now

      await ctx.db.insert("franchiseSetup", {
        franchiseId: franchise._id,
        franchiserId: franchise.franchiserId,
        projectName: `${franchise.franchiseSlug} Setup`,
        franchiseeName: franchise.franchiseeContact.name,
        location: franchise.address,
        startDate: now,
        targetLaunchDate: launchDate,
        status: "not_started",
        progress: 0,
        investmentAmount: investment.totalInvestment,
        investmentReceived: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return shareId;
  },
});

// Create funding PDA as escrow during funding stage
export const createFundingPDA = mutation({
  args: {
    franchiseId: v.id("franchises"),
    totalInvestment: v.number(),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    if (franchise.stage !== "funding") {
      throw new Error("Can only create funding PDA during funding stage");
    }

    // Create a funding PDA entry (acts as escrow)
    const walletId = await ctx.db.insert("franchiseWallets", {
      franchiseId: args.franchiseId,
      walletAddress: `funding_pda_${args.franchiseId}_${Date.now()}`, // Funding PDA address
      walletName: `${franchise.franchiseSlug} Funding PDA`,
      balance: 0, // Starts with 0, accumulates as investments come in
      usdBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalPayouts: 0,
      totalRoyalties: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      transactionCount: 0,
      lastActivity: Date.now(),
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update franchise stage to funding with creating_pda sub-stage
    await ctx.db.patch(args.franchiseId, {
      stage: "funding",
      updatedAt: Date.now(),
    });

    // Create stage tracking entry
    await ctx.db.insert("franchiseStages", {
      franchiseId: args.franchiseId,
      franchiserId: franchise.franchiserId,
      currentStage: "funding",
      subStage: "creating_pda",
      progress: 10,
      stageStartDate: Date.now(),
      notes: "Funding PDA created as escrow",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return {
      walletId,
      pdaAddress: `funding_pda_${args.franchiseId}_${Date.now()}`,
      message: `Funding PDA created as escrow for franchise ${franchise.franchiseSlug}`,
    };
  },
});

// Create franchise wallet and transfer funds from PDA when funding is complete
export const createFranchiseWallet = mutation({
  args: {
    franchiseId: v.id("franchises"),
    totalInvestment: v.number(),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Find the funding PDA
    const fundingPDA = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("walletAddress"), q.field("walletAddress")))
      .first();

    if (!fundingPDA) {
      throw new Error("Funding PDA not found");
    }

    // Create the actual franchise wallet
    const franchiseWalletId = await ctx.db.insert("franchiseWallets", {
      franchiseId: args.franchiseId,
      walletAddress: `franchise_${args.franchiseId}_${Date.now()}`, // Actual franchise wallet address
      walletName: `${franchise.franchiseSlug} Wallet`,
      balance: args.totalInvestment,
      usdBalance: args.totalInvestment,
      totalIncome: 0,
      totalExpenses: 0,
      totalPayouts: 0,
      totalRoyalties: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      transactionCount: 0,
      lastActivity: Date.now(),
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Transfer from funding PDA to franchise wallet
    await ctx.db.insert("franchiseTransactions", {
      franchiseId: args.franchiseId,
      walletId: franchiseWalletId,
      type: "initial_funding",
      amount: args.totalInvestment,
      description: `Funding transferred from PDA to franchise wallet: $${args.totalInvestment.toLocaleString()}`,
      status: "completed",
      transactionHash: `transfer_${args.franchiseId}_${Date.now()}`,
      createdAt: Date.now(),
    });

    // Mark funding PDA as inactive
    await ctx.db.patch(fundingPDA._id, {
      status: "inactive",
      updatedAt: Date.now(),
    });

    return {
      walletId: franchiseWalletId,
      balance: args.totalInvestment,
      message: `Franchise wallet created with $${args.totalInvestment.toLocaleString()} transferred from funding PDA`,
    };
  },
});

// Transition to launching stage and handle fee transfers
export const transitionToLaunchingStage = mutation({
  args: {
    franchiseId: v.id("franchises"),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) {
      throw new Error("Investment data not found");
    }

    // Verify funding is complete
    const fundingProgress = investment.totalInvestment > 0 
      ? (investment.totalInvested / investment.totalInvestment) * 100 
      : 0;

    if (fundingProgress < 100) {
      throw new Error("Funding not complete. Cannot transition to launching stage.");
    }

    // Create franchise wallet and transfer funds from PDA (inlined to avoid circular reference)
    // Find the funding PDA
    const fundingPDA = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("walletAddress"), q.field("walletAddress")))
      .first();

    if (!fundingPDA) {
      throw new Error("Funding PDA not found");
    }

    // Calculate fund distribution:
    // - Franchise Fee → Brand Wallet
    // - Setup Cost → Brand Wallet  
    // - Working Capital → Franchise Wallet
    const franchiseFee = investment.franchiseFee;
    const setupCost = investment.setupCost;
    const workingCapital = investment.workingCapital;
    
    // Verify total matches
    const calculatedTotal = franchiseFee + setupCost + workingCapital;
    if (Math.abs(calculatedTotal - investment.totalInvestment) > 0.01) {
      console.warn(`Fund distribution mismatch: calculated ${calculatedTotal}, total ${investment.totalInvestment}`);
    }

    // Create the actual franchise wallet with only working capital
    const franchiseWalletId = await ctx.db.insert("franchiseWallets", {
      franchiseId: args.franchiseId,
      walletAddress: `franchise_${args.franchiseId}_${Date.now()}`, // Actual franchise wallet address
      walletName: `${franchise.franchiseSlug} Wallet`,
      balance: workingCapital / 200, // Convert USD to SOL (assuming $200 per SOL)
      usdBalance: workingCapital,
      totalIncome: 0,
      totalExpenses: 0,
      totalPayouts: 0,
      totalRoyalties: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
      transactionCount: 0,
      lastActivity: Date.now(),
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Record working capital transfer to franchise wallet
    await ctx.db.insert("franchiseWalletTransactions", {
      franchiseWalletId: franchiseWalletId,
      franchiseId: args.franchiseId,
      transactionType: "funding",
      amount: workingCapital / 200, // Convert USD to SOL (assuming $200 per SOL)
      usdAmount: workingCapital,
      description: `Working capital transferred to franchise wallet: $${workingCapital.toLocaleString()}`,
      solanaTransactionHash: `working_capital_${args.franchiseId}_${Date.now()}`,
      status: "confirmed",
      createdAt: Date.now(),
    });

    // Mark funding PDA as inactive
    await ctx.db.patch(fundingPDA._id, {
      status: "inactive",
      updatedAt: Date.now(),
    });

    // Get franchiser to access brand wallet
    const franchiser = await ctx.db.get(franchise.franchiserId);
    if (!franchiser) {
      throw new Error("Franchiser not found");
    }

    // Transfer franchise fee to brand wallet
    await ctx.db.insert("brandWalletTransactions", {
      franchiserId: franchise.franchiserId,
      franchiseId: args.franchiseId,
      type: "franchise_fee",
      amount: franchiseFee,
      description: `Franchise fee received from ${franchise.franchiseSlug}: $${franchiseFee.toLocaleString()}`,
      status: "completed",
      transactionHash: `franchise_fee_${args.franchiseId}_${Date.now()}`,
      createdAt: Date.now(),
    });

    // Transfer setup cost to brand wallet
    await ctx.db.insert("brandWalletTransactions", {
      franchiserId: franchise.franchiserId,
      franchiseId: args.franchiseId,
      type: "setup_cost",
      amount: setupCost,
      description: `Setup cost received from ${franchise.franchiseSlug}: $${setupCost.toLocaleString()}`,
      status: "completed",
      transactionHash: `setup_cost_${args.franchiseId}_${Date.now()}`,
      createdAt: Date.now(),
    });

    // Update franchise stage to launching
    await ctx.db.patch(args.franchiseId, {
      stage: "launching",
      updatedAt: Date.now(),
    });

    // Set up 45-day launch timeline
    const now = Date.now();
    const launchDate = now + (45 * 24 * 60 * 60 * 1000); // 45 days from now

    // Update stage tracking
    await ctx.db.insert("franchiseStages", {
      franchiseId: args.franchiseId,
      franchiserId: franchise.franchiserId,
      currentStage: "launching",
      subStage: "transferring_fees",
      progress: 25,
      stageStartDate: now,
      estimatedCompletionDate: launchDate,
      notes: `Franchise fee ($${investment.franchiseFee.toLocaleString()}) and setup cost ($${investment.setupCost.toLocaleString()}) transferred to brand wallet`,
      createdAt: now,
      updatedAt: now,
    });

    // Create setup table entry with 45-day launch timeline
    await ctx.db.insert("franchiseSetup", {
      franchiseId: args.franchiseId,
      franchiserId: franchise.franchiserId,
      projectName: `${franchise.franchiseSlug} Setup`,
      franchiseeName: franchise.franchiseeContact.name,
      location: franchise.address,
      startDate: now,
      targetLaunchDate: launchDate,
      status: "not_started",
      progress: 0,
      investmentAmount: investment.totalInvestment,
      investmentReceived: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      newStage: "launching",
      franchiseWallet: franchiseWalletId,
      franchiseFeeTransferred: investment.franchiseFee,
      setupCostTransferred: investment.setupCost,
      launchDate: new Date(launchDate).toISOString(),
      remainingBalance: investment.workingCapital,
    };
  },
});


// Check if franchise should be closed (balance is empty)
export const checkAndCloseFranchise = mutation({
  args: {
    franchiseId: v.id("franchises"),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Get franchise wallet balance
    const franchiseWallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!franchiseWallet || franchiseWallet.balance <= 0) {
      // Update franchise stage to closed
      await ctx.db.patch(args.franchiseId, {
        stage: "closed",
        updatedAt: Date.now(),
      });

      const now = Date.now();

      // Update stage tracking
      await ctx.db.insert("franchiseStages", {
        franchiseId: args.franchiseId,
        franchiserId: franchise.franchiserId,
        currentStage: "closed",
        subStage: "closing",
        progress: 100,
        stageStartDate: now,
        actualCompletionDate: now,
        notes: "Franchise closed due to empty balance",
        createdAt: now,
        updatedAt: now,
      });

      return {
        success: true,
        newStage: "closed",
        reason: "Empty balance",
        closedDate: new Date(now).toISOString(),
      };
    }

    return {
      success: false,
      currentStage: franchise.stage,
      balance: franchiseWallet.balance,
    };
  },
});

// Get shares by franchise
export const getSharesByFranchise = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const shares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .collect();

    return shares;
  },
});

// Get shares by investor with enhanced status logic
export const getSharesByInvestor = query({
  args: { investorId: v.string() },
  handler: async (ctx, { investorId }) => {
    const shares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_investor", (q) => q.eq("investorId", investorId))
      .collect();

    // Get franchise details for each share
    const sharesWithFranchise = await Promise.all(
      shares.map(async (share) => {
        const franchise = await ctx.db.get(share.franchiseId);
        const franchiser = franchise ? await ctx.db.get(franchise.franchiserId) : null;
        
        // Get investment data to check funding status
        const investment = franchise ? await ctx.db.get(franchise.investmentId) : null;
        
        // Calculate effective share status based on funding and time
        let effectiveStatus = share.status;
        let statusReason = "";
        
        if (share.status === "confirmed" && franchise && investment) {
          const now = Date.now();
          const daysSinceFundingStarted = (now - franchise.createdAt) / (1000 * 60 * 60 * 24);
          const fundingProgress = investment.totalInvestment > 0 
            ? (investment.totalInvested / investment.totalInvestment) * 100 
            : 0;
          
          if (franchise.stage === "ongoing") {
            effectiveStatus = "confirmed"; // Keep as confirmed for active franchises
            statusReason = "Franchise is live and operational";
          } else if (franchise.stage === "launching") {
            effectiveStatus = "confirmed"; // Keep as confirmed for launching franchises
            statusReason = "Franchise approved and launching";
          } else if (franchise.stage === "funding" && fundingProgress >= 100) {
            effectiveStatus = "confirmed"; // Keep as confirmed when funding is complete
            statusReason = "Funding complete, franchise launching";
          } else if (daysSinceFundingStarted > 60 && franchise.stage === "funding" && fundingProgress < 100) {
            effectiveStatus = "refunded";
            statusReason = "Funding period expired (60+ days), refund initiated";
          } else if (franchise.stage === "funding" && fundingProgress < 100) {
            effectiveStatus = "pending";
            statusReason = `Funding in progress (${fundingProgress.toFixed(1)}%)`;
          } else {
            effectiveStatus = "pending";
            statusReason = `Funding in progress (${fundingProgress.toFixed(1)}%)`;
          }
        }
        
        return {
          ...share,
          effectiveStatus,
          statusReason,
          franchise: franchise ? {
            ...franchise,
            franchiser,
            investment: investment ? {
              ...investment,
              fundingProgress: investment.totalInvestment > 0 
                ? (investment.totalInvested / investment.totalInvestment) * 100 
                : 0
            } : null
          } : null,
        };
      })
    );

    return sharesWithFranchise;
  },
});

// Process share refund when funding period expires
export const processShareRefund = mutation({
  args: {
    shareId: v.id("franchiseShares"),
    refundTransactionHash: v.optional(v.string()),
  },
  handler: async (ctx, { shareId, refundTransactionHash }) => {
    const share = await ctx.db.get(shareId);
    if (!share) {
      throw new Error("Share record not found");
    }

    if (share.status !== "confirmed") {
      throw new Error("Only confirmed shares can be refunded");
    }

    // Update share status to refunded
    await ctx.db.patch(shareId, {
      status: "refunded" as any, // We'll need to update the schema to include refunded status
      refundedAt: Date.now(),
      refundTransactionHash,
    });

    // Burn tokens for the refund
    try {
      await ctx.runMutation(api.tokenManagement.burnTokensForRefund, {
        franchiseId: share.franchiseId,
        investorId: share.investorId,
        amount: share.sharesPurchased, // Burn the same amount of tokens
        refundTransactionHash,
      });
    } catch (error) {
      console.error("Failed to burn tokens for refund:", error);
      // Continue with refund even if token burning fails
    }

    // Get franchise and investment data
    const franchise = await ctx.db.get(share.franchiseId);
    const investment = franchise ? await ctx.db.get(franchise.investmentId) : null;

    if (investment) {
      // Update investment totals (subtract the refunded shares)
      const newTotalInvested = Math.max(0, investment.totalInvested - share.totalAmount);
      const newSharesPurchased = Math.max(0, investment.sharesPurchased - share.sharesPurchased);

      await ctx.db.patch(investment._id, {
        totalInvested: newTotalInvested,
        sharesPurchased: newSharesPurchased,
        updatedAt: Date.now(),
      });
    }

    return shareId;
  },
});

// Create invoice
export const createInvoice = mutation({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.string(),
    invoiceNumber: v.string(),
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
    items: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    dueDate: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const invoiceId = await ctx.db.insert("invoices", {
      ...args,
      status: "sent",
      createdAt: now,
      updatedAt: now,
    });

    return invoiceId;
  },
});

// Create invoice for share purchase
export const createInvoiceForSharePurchase = mutation({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.string(),
    sharesPurchased: v.number(),
    sharePrice: v.number(),
    totalAmount: v.number(),
    transactionHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get franchise details for invoice
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }
    
    const invoiceId = await ctx.db.insert("invoices", {
      franchiseId: args.franchiseId,
      investorId: args.investorId,
      invoiceNumber: `INV-${franchise.franchiseSlug}-${Date.now()}`,
      amount: args.totalAmount,
      currency: "USD",
      description: `Franchise share purchase - ${args.sharesPurchased} shares in ${franchise.franchiseSlug}`,
      items: [
        {
          description: "Franchise Shares",
          quantity: args.sharesPurchased,
          unitPrice: args.sharePrice,
          total: args.totalAmount,
        }
      ],
      status: "paid",
      dueDate: now,
      paidAt: now,
      transactionHash: args.transactionHash,
      createdAt: now,
      updatedAt: now,
    });

    return invoiceId;
  },
});

// Get invoices by franchise
export const getInvoicesByFranchise = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .collect();

    return invoices;
  },
});

// Get invoices by investor
export const getInvoicesByInvestor = query({
  args: { investorId: v.string() },
  handler: async (ctx, { investorId }) => {
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_investor", (q) => q.eq("investorId", investorId))
      .collect();

    // Get franchise details for each invoice
    const invoicesWithFranchise = await Promise.all(
      invoices.map(async (invoice) => {
        const franchise = await ctx.db.get(invoice.franchiseId);
        const franchiser = franchise ? await ctx.db.get(franchise.franchiserId) : null;
        return {
          ...invoice,
          franchise: franchise ? {
            ...franchise,
            franchiser,
          } : null,
        };
      })
    );

    return invoicesWithFranchise;
  },
});

// Update franchise status
export const updateFranchiseStatus = mutation({
  args: {
    franchiseId: v.id("franchises"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("active"),
      v.literal("suspended"),
      v.literal("terminated")
    ),
  },
  handler: async (ctx, { franchiseId, status }) => {
    await ctx.db.patch(franchiseId, {
      status,
      updatedAt: Date.now(),
    });
  },
});

// Update invoice status
export const updateInvoiceStatus = mutation({
  args: {
    invoiceId: v.id("invoices"),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    transactionHash: v.optional(v.string()),
  },
  handler: async (ctx, { invoiceId, status, transactionHash }) => {
    const updateData: any = {
      status,
      updatedAt: Date.now(),
    };

    if (status === "paid" && transactionHash) {
      updateData.paidAt = Date.now();
      updateData.transactionHash = transactionHash;
    }

    await ctx.db.patch(invoiceId, updateData);
  },
});

// Get fundraising data for a franchise by slug
export const getFranchiseFundraisingData = query({
  args: { franchiseSlug: v.string() },
  handler: async (ctx, { franchiseSlug }) => {
    // Get the franchise by slug first
    const franchise = await ctx.db
      .query("franchises")
      .withIndex("by_slug", (q) => q.eq("franchiseSlug", franchiseSlug))
      .first();
    
    if (!franchise) return null;
    
    const franchiseId = franchise._id;

    // Get all confirmed shares for this franchise
    const shares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    // Get investment details
    const investment = await ctx.db.get(franchise.investmentId);
    
    if (!investment) {
      throw new Error("Investment data not found for franchise");
    }

    // Calculate aggregated data
    const totalSharesIssued = shares.reduce((sum, share) => sum + share.sharesPurchased, 0);
    const totalAmountRaised = shares.reduce((sum, share) => sum + share.totalAmount, 0);
    const totalShares = investment.sharesIssued || 100000;
    const sharesRemaining = totalShares - totalSharesIssued;
    const progressPercentage = totalShares > 0 ? (totalSharesIssued / totalShares) * 100 : 0;

    return {
      franchiseId,
      totalInvestment: investment.totalInvestment || 100000,
      totalInvested: investment.totalInvested || totalAmountRaised,
      totalShares,
      sharesIssued: totalSharesIssued,
      sharesPurchased: investment.sharesPurchased || totalSharesIssued,
      sharesRemaining,
      invested: totalAmountRaised,
      progressPercentage,
      sharePrice: investment.sharePrice || 1,
      franchiseFee: investment.franchiseFee || 20000,
      setupCost: investment.setupCost || 50000,
      workingCapital: investment.workingCapital || 30000,
      stage: franchise.stage || 'funding',
      status: franchise.status || 'pending',
      shares: shares // Include individual share purchases
    };
  },
});

// Check and transition all franchises that should be in launching stage
// Transition franchise from launching to ongoing stage
export const transitionToOngoingStage = mutation({
  args: {
    franchiseId: v.id("franchises"),
  },
  handler: async (ctx, { franchiseId }) => {
    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Check if franchise is in launching stage
    if (franchise.stage !== "launching") {
      throw new Error("Franchise must be in launching stage to transition to ongoing");
    }

    const now = Date.now();

    // Update franchise stage to ongoing
    await ctx.db.patch(franchiseId, {
      stage: "ongoing",
      updatedAt: now,
    });

    // Get franchise wallet to record the stage transition
    const franchiseWallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .first();

    if (franchiseWallet) {
      // Record the stage transition
      await ctx.db.insert("franchiseWalletTransactions", {
        franchiseWalletId: franchiseWallet._id,
        franchiseId: franchiseId,
        transactionType: "transfer_in", // Using transfer_in as closest match
        amount: 0, // SOL amount
        usdAmount: 0, // No monetary amount for stage transition
        description: `Franchise transitioned from launching to ongoing stage`,
        solanaTransactionHash: `stage_transition_${franchiseId}_${now}`,
        status: "confirmed",
        createdAt: now,
      });
    }

    return {
      success: true,
      message: "Franchise successfully transitioned to ongoing stage",
      franchiseId: franchiseId,
      newStage: "ongoing",
    };
  },
});

export const checkAllFranchiseStages = mutation({
  args: {},
  handler: async (ctx) => {
    const franchises = await ctx.db.query("franchises").collect();
    const results = [];

    for (const franchise of franchises) {
      if (franchise.stage === "funding") {
        const investment = await ctx.db.get(franchise.investmentId);
        if (investment) {
          const fundingProgress = investment.totalInvestment > 0 
            ? (investment.totalInvested / investment.totalInvestment) * 100 
            : 0;

          if (fundingProgress >= 100) {
            // Update franchise stage to launching
            await ctx.db.patch(franchise._id, {
              stage: "launching",
              updatedAt: Date.now(),
            });

            // Get franchiser to access brand wallet
            const franchiser = await ctx.db.get(franchise.franchiserId);
            if (franchiser) {
              // Transfer funds to franchise wallet from escrow/PDA
              const franchiseWallet = await ctx.db
                .query("franchiseWallets")
                .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
                .first();

              if (franchiseWallet) {
                // Update franchise wallet balance with funded amount
                await ctx.db.patch(franchiseWallet._id, {
                  balance: investment.totalInvestment,
                  usdBalance: investment.totalInvestment,
                  updatedAt: Date.now(),
                });

                // Record the funding transfer transaction
                await ctx.db.insert("franchiseWalletTransactions", {
                  franchiseWalletId: franchiseWallet._id,
                  franchiseId: franchise._id,
                  transactionType: "funding",
                  amount: 0, // SOL amount (not used for USD transactions)
                  usdAmount: investment.totalInvestment,
                  description: `Funding completed - $${investment.totalInvestment.toLocaleString()} transferred from escrow to franchise wallet`,
                  solanaTransactionHash: `funding_complete_${franchise._id}_${Date.now()}`,
                  status: "confirmed",
                  createdAt: Date.now(),
                });
              }

              // Transfer funds to brand wallet by creating a brand wallet transaction
              await ctx.db.insert("brandWalletTransactions", {
                franchiserId: franchise.franchiserId,
                franchiseId: franchise._id,
                type: "franchise_funding_complete",
                amount: investment.totalInvestment,
                description: `Franchise funding completed - ${franchise.franchiseSlug} - $${investment.totalInvestment.toLocaleString()} transferred to brand wallet`,
                status: "completed",
                transactionHash: `funding_complete_${franchise._id}_${Date.now()}`,
                createdAt: Date.now(),
              });
            }

            // Create setup table entry with 45-day launch timeline
            const now = Date.now();
            const launchDate = now + (45 * 24 * 60 * 60 * 1000); // 45 days from now

            await ctx.db.insert("franchiseSetup", {
              franchiseId: franchise._id,
              franchiserId: franchise.franchiserId,
              projectName: `${franchise.franchiseSlug} Setup`,
              franchiseeName: franchise.franchiseeContact.name,
              location: franchise.address,
              startDate: now,
              targetLaunchDate: launchDate,
              status: "not_started",
              progress: 0,
              investmentAmount: investment.totalInvestment,
              investmentReceived: true,
              createdAt: now,
              updatedAt: now,
            });

            results.push({
              franchiseId: franchise._id,
              franchiseSlug: franchise.franchiseSlug,
              action: "transitioned",
              fundingProgress,
              newStage: "launching"
            });
          } else {
            results.push({
              franchiseId: franchise._id,
              franchiseSlug: franchise.franchiseSlug,
              action: "no_action",
              fundingProgress,
              reason: "Not fully funded"
            });
          }
        }
      } else {
        results.push({
          franchiseId: franchise._id,
          franchiseSlug: franchise.franchiseSlug,
          action: "no_action",
          currentStage: franchise.stage,
          reason: "Not in funding stage"
        });
      }
    }

    return {
      totalFranchises: franchises.length,
      processed: results.length,
      results
    };
  },
});

// Debug function to check franchise status
export const debugFranchiseStatus = query({
  args: { franchiseSlug: v.string() },
  handler: async (ctx, { franchiseSlug }) => {
    // Get the franchise by slug first
    const franchise = await ctx.db
      .query("franchises")
      .withIndex("by_slug", (q) => q.eq("franchiseSlug", franchiseSlug))
      .first();
    
    if (!franchise) return null;
    
    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) return null;

    // Get all confirmed shares for this franchise
    const shares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    const totalSharesIssued = shares.reduce((sum, share) => sum + share.sharesPurchased, 0);
    const totalAmountRaised = shares.reduce((sum, share) => sum + share.totalAmount, 0);
    const fundingProgress = investment.totalInvestment > 0 
      ? (investment.totalInvested / investment.totalInvestment) * 100 
      : 0;

    return {
      franchiseId: franchise._id,
      franchiseSlug: franchise.franchiseSlug,
      currentStage: franchise.stage,
      totalInvestment: investment.totalInvestment,
      totalInvested: investment.totalInvested,
      totalSharesIssued,
      totalAmountRaised,
      fundingProgress,
      sharesCount: shares.length,
      shouldTransition: fundingProgress >= 100 && franchise.stage === "funding",
      investmentData: investment,
      franchiseData: franchise
    };
  },
});

// Get fundraising data for a franchise by ID
export const getFranchiseFundraisingDataById = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, { franchiseId }) => {
    // Get the franchise by ID
    const franchise = await ctx.db.get(franchiseId);
    
    if (!franchise) return null;

    // Get all confirmed shares for this franchise
    const shares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .filter((q) => q.eq(q.field("status"), "confirmed"))
      .collect();

    // Get investment details
    const investment = await ctx.db.get(franchise.investmentId);
    
    if (!investment) {
      throw new Error("Investment data not found for franchise");
    }

    // Calculate aggregated data
    const totalSharesIssued = shares.reduce((sum, share) => sum + share.sharesPurchased, 0);
    const totalAmountRaised = shares.reduce((sum, share) => sum + share.totalAmount, 0);
    const totalShares = investment.sharesIssued || 100000;
    const sharesRemaining = totalShares - totalSharesIssued;
    const progressPercentage = totalShares > 0 ? (totalSharesIssued / totalShares) * 100 : 0;

    return {
      franchiseId,
      totalInvestment: investment.totalInvestment || 100000,
      totalInvested: investment.totalInvested || totalAmountRaised,
      totalShares,
      sharesIssued: totalSharesIssued,
      sharesPurchased: investment.sharesPurchased || totalSharesIssued,
      sharesRemaining,
      invested: totalAmountRaised,
      progressPercentage,
      sharePrice: investment.sharePrice || 1,
      franchiseFee: investment.franchiseFee || 20000,
      setupCost: investment.setupCost || 50000,
      workingCapital: investment.workingCapital || 30000,
      stage: franchise.stage || 'funding',
      status: franchise.status || 'pending',
      shares: shares // Include individual share purchases
    };
  },
});

// Test function to manually trigger funding completion for testing
export const testFundingCompletion = mutation({
  args: {
    franchiseId: v.id("franchises"),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    const investment = await ctx.db.get(franchise.investmentId);
    if (!investment) {
      throw new Error("Investment data not found");
    }

    // Get franchiser to access brand wallet
    const franchiser = await ctx.db.get(franchise.franchiserId);
    if (!franchiser) {
      throw new Error("Franchiser not found");
    }

    const now = Date.now();

    // Transfer funds to brand wallet by creating a brand wallet transaction
    await ctx.db.insert("brandWalletTransactions", {
      franchiserId: franchise.franchiserId,
      franchiseId: args.franchiseId,
      type: "franchise_funding_complete",
      amount: investment.totalInvestment,
      description: `TEST: Franchise funding completed - ${franchise.franchiseSlug} - $${investment.totalInvestment.toLocaleString()} transferred to brand wallet`,
      status: "completed",
      transactionHash: `test_funding_complete_${args.franchiseId}_${now}`,
      createdAt: now,
    });

    return {
      success: true,
      message: `Test funding transfer completed. $${investment.totalInvestment.toLocaleString()} transferred to brand wallet.`,
      amount: investment.totalInvestment,
      franchiserId: franchise.franchiserId
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
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    
    if (!wallet) return null;

    // Get franchise details
    const franchise = await ctx.db.get(franchiseId);
    if (!franchise) return null;

    // Get franchiser details
    const franchiser = await ctx.db.get(franchise.franchiserId);
    if (!franchiser) return null;

    // Get recent transactions
    const transactions = await ctx.db
      .query("franchiseTransactions")
      .withIndex("by_wallet", (q) => q.eq("walletId", wallet._id))
      .order("desc")
      .take(10);

    return {
      ...wallet,
      franchise: {
        _id: franchise._id,
        franchiseSlug: franchise.franchiseSlug,
        title: franchise.franchiseSlug, // Use franchiseSlug as title since title doesn't exist
        stage: franchise.stage
      },
      franchiser: {
        _id: franchiser._id,
        name: franchiser.name,
        slug: franchiser.slug
      },
      recentTransactions: transactions
    };
  },
});

// Get franchise wallet by franchise slug
export const getFranchiseWalletBySlug = query({
  args: { franchiseSlug: v.string() },
  handler: async (ctx, { franchiseSlug }) => {
    // First get the franchise by slug
    const franchise = await ctx.db
      .query("franchises")
      .withIndex("by_slug", (q) => q.eq("franchiseSlug", franchiseSlug))
      .first();
    
    if (!franchise) return null;

    // Then get the wallet
    return await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

// Get all franchise wallets for a franchiser
export const getFranchiseWalletsByFranchiser = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, { franchiserId }) => {
    // First get all franchises for this franchiser
    const franchises = await ctx.db
      .query("franchises")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchiserId))
      .collect();
    
    // Then get wallets for each franchise
    const wallets = await Promise.all(
      franchises.map(async (franchise) => {
        return await ctx.db
          .query("franchiseWallets")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
          .first();
      })
    );
    
    const validWallets = wallets.filter(Boolean);

    // Get franchise details for each wallet
    const walletsWithDetails = await Promise.all(
      validWallets.map(async (wallet) => {
        if (!wallet) return null;
        
        const franchise = await ctx.db.get(wallet.franchiseId);
        if (!franchise) return null;

        // Get recent transactions count
        const transactionCount = await ctx.db
          .query("franchiseTransactions")
          .withIndex("by_wallet", (q) => q.eq("walletId", wallet._id))
          .collect();

        return {
          ...wallet,
          franchise: {
            _id: franchise._id,
            franchiseSlug: franchise.franchiseSlug,
            title: franchise.franchiseSlug,
            stage: franchise.stage
          },
          transactionCount: transactionCount.length
        };
      })
    );

    return walletsWithDetails.filter(Boolean);
  },
});

// Get franchise wallet transactions
// Debug mutation to create a simple test franchise
export const createTestFranchise = mutation({
  args: {
    franchiserId: v.id("franchiser"),
  },
  handler: async (ctx, { franchiserId }) => {
    const now = Date.now();
    
    // Check if franchiser exists
    const franchiser = await ctx.db.get(franchiserId);
    if (!franchiser) {
      throw new Error("Franchiser not found");
    }
    
    // Get or create a location for this franchiser
    let locationId;
    const existingLocation = await ctx.db
      .query("franchiserLocations")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchiserId))
      .first();
    
    if (existingLocation) {
      locationId = existingLocation._id;
    } else {
      // Create a default location
      locationId = await ctx.db.insert("franchiserLocations", {
        franchiserId,
        city: "Test City",
        state: "Test State",
        country: "Test Country",
        area: "Test Area",
        isNationwide: false,
        registrationCertificate: "TEST-CERT-123",
        minArea: 500,
        franchiseFee: 10000,
        setupCost: 50000,
        workingCapital: 40000,
        status: "active",
        createdAt: now,
      });
    }
    
    // Create investment record first
    const investmentId = await ctx.db.insert("investments", {
      totalInvestment: 100000,
      totalInvested: 0,
      sharesIssued: 1000,
      sharesPurchased: 0,
      sharePrice: 1.0,
      franchiseFee: 10000,
      setupCost: 50000,
      workingCapital: 40000,
      minimumInvestment: 100,
      maximumInvestment: 10000,
      expectedReturn: 0.15,
      investmentStartDate: now,
      investmentEndDate: now + (365 * 24 * 60 * 60 * 1000), // 1 year from now
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    
    // Create a simple test franchise
    const franchiseId = await ctx.db.insert("franchises", {
      franchiserId,
      franchiseeId: `test-franchisee-${now}`,
      locationId: locationId,
      franchiseSlug: `test-franchise-${now}`,
      businessName: `Test Franchise ${now}`,
      address: "123 Test Street, Test City",
      location: {
        area: "Test Area",
        city: "Test City",
        state: "Test State",
        country: "Test Country",
        coordinates: { lat: 25.2048, lng: 55.2708 }, // Dubai coordinates
      },
      buildingName: "Test Building",
      doorNumber: "123",
      sqft: 1000,
      isOwned: false,
      franchiseeContact: {
        name: "Test Franchisee",
        phone: "+1234567890",
        email: "test@example.com",
      },
      investmentId: investmentId,
      status: "pending", // Start as pending for approval
      stage: "funding",
      createdAt: now,
      updatedAt: now,
    });
    
    // Update investment record with franchise ID
    await ctx.db.patch(investmentId, {
      franchiseId: franchiseId,
    });
    
    return {
      franchiseId,
      message: `Test franchise created successfully with ID: ${franchiseId}`,
    };
  },
});

// Debug query to list all franchises with their status and wallet info
export const getAllFranchisesDebug = query({
  args: {},
  handler: async (ctx) => {
    const franchises = await ctx.db.query("franchises").collect();
    
    const franchiseData = await Promise.all(
      franchises.map(async (franchise) => {
        // Check if wallet exists
        const wallet = await ctx.db
          .query("franchiseWallets")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise._id))
          .first();
        
        // Get franchiser info
        const franchiser = await ctx.db.get(franchise.franchiserId);
        
        return {
          _id: franchise._id,
          franchiseSlug: franchise.franchiseSlug,
          status: franchise.status,
          stage: franchise.stage,
          createdAt: franchise.createdAt,
          hasWallet: !!wallet,
          walletAddress: wallet?.walletAddress,
          franchiserName: franchiser?.name,
        };
      })
    );
    
    return franchiseData;
  },
});

export const getFranchiseWalletTransactions = query({
  args: { 
    franchiseId: v.id("franchises"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, { franchiseId, limit = 50 }) => {
    // First get the wallet
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", franchiseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    
    if (!wallet) return [];

    // Get transactions
    return await ctx.db
      .query("franchiseTransactions")
      .withIndex("by_wallet", (q) => q.eq("walletId", wallet._id))
      .order("desc")
      .take(limit);
  },
});
