import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new franchise
export const createFranchise = mutation({
  args: {
    franchiserId: v.id("franchiser"),
    franchiseeId: v.string(),
    locationId: v.id("franchiserLocations"),
    franchiseSlug: v.string(),
    businessName: v.string(),
    address: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
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
      coordinates: args.coordinates,
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

    return franchiseId;
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

// Get franchises by franchiser
export const getFranchisesByFranchiser = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, { franchiserId }) => {
    const franchises = await ctx.db
      .query("franchises")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchiserId))
      .collect();

    return franchises;
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

    // Update the investment record with new totals
    const newTotalInvested = investment.totalInvested + args.totalAmount;
    const newSharesPurchased = investment.sharesPurchased + args.sharesPurchased;

    await ctx.db.patch(investment._id, {
      totalInvested: newTotalInvested,
      sharesPurchased: newSharesPurchased,
      updatedAt: now,
    });

    return shareId;
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

// Get shares by investor
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
        return {
          ...share,
          franchise: franchise ? {
            ...franchise,
            franchiser,
          } : null,
        };
      })
    );

    return sharesWithFranchise;
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
  },
  handler: async (ctx, { franchiseId, stage }) => {
    await ctx.db.patch(franchiseId, {
      stage,
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
      shares: shares // Include individual share purchases
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
      shares: shares // Include individual share purchases
    };
  },
});
