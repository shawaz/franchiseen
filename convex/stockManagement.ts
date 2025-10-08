import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a stock transfer request from franchise to brand
export const requestStockTransfer = mutation({
  args: {
    franchiseId: v.id("franchises"),
    productId: v.id("franchiserProducts"),
    requestedQuantity: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create stock transfer request
    const transferId = await ctx.db.insert("stockTransfers", {
      franchiseId: args.franchiseId,
      productId: args.productId,
      requestedQuantity: args.requestedQuantity,
      status: "pending",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return transferId;
  },
});

// Approve stock transfer (brand side)
export const approveStockTransfer = mutation({
  args: {
    transferId: v.id("stockTransfers"),
    approvedQuantity: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get the transfer request
    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) {
      throw new Error("Transfer not found");
    }

    // Get the product to check warehouse stock
    const product = await ctx.db.get(transfer.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Check if there's enough warehouse stock
    if (product.stockQuantity < args.approvedQuantity) {
      throw new Error("Insufficient warehouse stock");
    }

    // Update transfer status
    await ctx.db.patch(args.transferId, {
      status: "approved",
      approvedQuantity: args.approvedQuantity,
      notes: args.notes,
      updatedAt: now,
    });

    // Deduct from warehouse stock
    await ctx.db.patch(transfer.productId, {
      stockQuantity: product.stockQuantity - args.approvedQuantity,
    });

    return args.transferId;
  },
});

// Reject stock transfer (brand side)
export const rejectStockTransfer = mutation({
  args: {
    transferId: v.id("stockTransfers"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Get the transfer request
    const transfer = await ctx.db.get(args.transferId);
    if (!transfer) {
      throw new Error("Transfer not found");
    }

    // Update transfer status
    await ctx.db.patch(args.transferId, {
      status: "rejected",
      notes: args.notes,
      updatedAt: now,
    });

    return args.transferId;
  },
});

// Get stock transfer requests for a franchise
export const getStockTransfersByFranchise = query({
  args: {
    franchiseId: v.id("franchises"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transfers = await ctx.db
      .query("stockTransfers")
      .filter(q => q.eq(q.field("franchiseId"), args.franchiseId))
      .order("desc")
      .take(args.limit || 50);

    // Populate product details
    const transfersWithProducts = await Promise.all(
      transfers.map(async (transfer) => {
        const product = await ctx.db.get(transfer.productId);
        const franchise = await ctx.db.get(transfer.franchiseId);
        
        return {
          ...transfer,
          product,
          franchise,
        };
      })
    );

    return transfersWithProducts;
  },
});

// Get pending stock transfer requests for brand management
export const getPendingStockTransfers = query({
  args: {
    franchiserId: v.id("franchiser"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get all franchises for this franchiser
    const franchises = await ctx.db
      .query("franchises")
      .filter(q => q.eq(q.field("franchiserId"), args.franchiserId))
      .collect();

    const franchiseIds = franchises.map(f => f._id);

    // Get pending transfers for these franchises
    const transfers = await ctx.db
      .query("stockTransfers")
      .filter(q => q.eq(q.field("status"), "pending"))
      .order("desc")
      .take(args.limit || 50);

    const filteredTransfers = transfers.filter(transfer => 
      franchiseIds.includes(transfer.franchiseId)
    );

    // Populate details
    const transfersWithDetails = await Promise.all(
      filteredTransfers.map(async (transfer) => {
        const product = await ctx.db.get(transfer.productId);
        const franchise = await ctx.db.get(transfer.franchiseId);
        
        return {
          ...transfer,
          product,
          franchise,
        };
      })
    );

    return transfersWithDetails;
  },
});

// Get warehouse stock levels (real data)
export const getWarehouseStock = query({
  args: {
    franchiserId: v.id("franchiser"),
  },
  handler: async (ctx, args) => {
    // Get all products for this franchiser
    const products = await ctx.db
      .query("franchiserProducts")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .collect();

    // Return actual warehouse stock levels from database
    const warehouseStock = products.map(product => ({
      productId: product._id,
      productName: product.name,
      productCategory: product.category,
      productSku: `SKU-${product._id.slice(-6)}`,
      warehouseStock: product.stockQuantity,
      minWarehouseLevel: product.minStockLevel || 50,
      maxWarehouseLevel: product.maxStockLevel || 1000,
      unit: product.unit || "units",
      cost: product.cost,
      price: product.price,
      status: product.status,
      createdAt: product.createdAt,
    }));

    return warehouseStock;
  },
});
