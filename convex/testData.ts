import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create test franchise shares for an investor
export const createTestFranchiseShares = mutation({
  args: {
    investorId: v.string(),
  },
  handler: async (ctx, { investorId }) => {
    // Get a random franchise to associate with
    const franchises = await ctx.db.query("franchises").collect();
    if (franchises.length === 0) {
      throw new Error("No franchises found. Please create a franchise first.");
    }
    
    const randomFranchise = franchises[Math.floor(Math.random() * franchises.length)];
    
    // Create test share data
    const testShares = [
      {
        franchiseId: randomFranchise._id,
        investorId: investorId,
        sharesPurchased: 10,
        sharePrice: 100,
        totalAmount: 1000,
        transactionHash: `test_tx_${Date.now()}_1`,
        status: "confirmed" as const,
        purchasedAt: Date.now() - 86400000, // 1 day ago
        createdAt: Date.now() - 86400000,
      },
      {
        franchiseId: randomFranchise._id,
        investorId: investorId,
        sharesPurchased: 5,
        sharePrice: 100,
        totalAmount: 500,
        transactionHash: `test_tx_${Date.now()}_2`,
        status: "pending" as const,
        purchasedAt: Date.now() - 172800000, // 2 days ago
        createdAt: Date.now() - 172800000,
      },
    ];

    // Insert test shares
    const shareIds = [];
    for (const share of testShares) {
      const shareId = await ctx.db.insert("franchiseShares", share);
      shareIds.push(shareId);
    }

    return { 
      success: true, 
      shareIds,
      message: `Created ${testShares.length} test shares for investor ${investorId}` 
    };
  },
});

// Create test invoices for an investor
export const createTestInvoices = mutation({
  args: {
    investorId: v.string(),
  },
  handler: async (ctx, { investorId }) => {
    // Get a random franchise to associate with
    const franchises = await ctx.db.query("franchises").collect();
    if (franchises.length === 0) {
      throw new Error("No franchises found. Please create a franchise first.");
    }
    
    const randomFranchise = franchises[Math.floor(Math.random() * franchises.length)];
    
    // Create test invoice data
    const testInvoices = [
      {
        franchiseId: randomFranchise._id,
        investorId: investorId,
        invoiceNumber: `INV-${Date.now()}-001`,
        amount: 1000,
        currency: "USD",
        description: "Franchise share purchase - 10 shares",
        items: [
          {
            description: "Franchise Shares",
            quantity: 10,
            unitPrice: 100,
            total: 1000,
          }
        ],
        status: "paid" as const,
        dueDate: Date.now() + 86400000, // 1 day from now
        paidAt: Date.now() - 86400000, // Paid 1 day ago
        transactionHash: `test_tx_${Date.now()}_1`,
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
      {
        franchiseId: randomFranchise._id,
        investorId: investorId,
        invoiceNumber: `INV-${Date.now()}-002`,
        amount: 500,
        currency: "USD",
        description: "Franchise share purchase - 5 shares",
        items: [
          {
            description: "Franchise Shares",
            quantity: 5,
            unitPrice: 100,
            total: 500,
          }
        ],
        status: "sent" as const,
        dueDate: Date.now() + 172800000, // 2 days from now
        createdAt: Date.now() - 172800000,
        updatedAt: Date.now() - 172800000,
      },
    ];

    // Insert test invoices
    const invoiceIds = [];
    for (const invoice of testInvoices) {
      const invoiceId = await ctx.db.insert("invoices", invoice);
      invoiceIds.push(invoiceId);
    }

    return { 
      success: true, 
      invoiceIds,
      message: `Created ${testInvoices.length} test invoices for investor ${investorId}` 
    };
  },
});

// Debug query to get investor data
export const debugInvestorData = query({
  args: {
    investorId: v.string(),
  },
  handler: async (ctx, { investorId }) => {
    const shares = await ctx.db
      .query("franchiseShares")
      .filter((q) => q.eq(q.field("investorId"), investorId))
      .collect();

    const invoices = await ctx.db
      .query("invoices")
      .filter((q) => q.eq(q.field("investorId"), investorId))
      .collect();

    return {
      investorId,
      sharesCount: shares.length,
      invoicesCount: invoices.length,
      shares: shares,
      invoices: invoices,
    };
  },
});
