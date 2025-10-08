import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all products for a franchiser
export const getProducts = query({
  args: { 
    franchiserId: v.id("franchiser"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("franchiserProducts")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .collect();
    
    if (args.limit) {
      return products.slice(0, args.limit);
    }
    
    return products;
  },
});

// Get product by ID
export const getProductById = query({
  args: { productId: v.id("franchiserProducts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

// Create product
export const createProduct = mutation({
  args: {
    franchiserId: v.id("franchiser"),
    name: v.string(),
    description: v.optional(v.string()),
    cost: v.number(),
    price: v.number(),
    images: v.array(v.id("_storage")),
    category: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("archived")
    ),
    stockQuantity: v.number(),
    minStockLevel: v.optional(v.number()),
    maxStockLevel: v.optional(v.number()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("franchiserProducts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Update product
export const updateProduct = mutation({
  args: {
    productId: v.id("franchiserProducts"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    cost: v.optional(v.number()),
    price: v.optional(v.number()),
    images: v.optional(v.array(v.id("_storage"))),
    category: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("archived")
    )),
    stockQuantity: v.optional(v.number()),
    minStockLevel: v.optional(v.number()),
    maxStockLevel: v.optional(v.number()),
    unit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { productId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(productId, cleanUpdates);
    return productId;
  },
});

// Delete product
export const deleteProduct = mutation({
  args: { productId: v.id("franchiserProducts") },
  handler: async (ctx, args) => {
    // Check if product is used in any stock transfers
    const transfers = await ctx.db
      .query("stockTransfers")
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .collect();
    
    if (transfers.length > 0) {
      throw new Error("Cannot delete product with existing stock transfers");
    }
    
    await ctx.db.delete(args.productId);
    return args.productId;
  },
});

// Adjust warehouse stock
export const adjustWarehouseStock = mutation({
  args: {
    productId: v.id("franchiserProducts"),
    quantity: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    const newStock = product.stockQuantity + args.quantity;
    
    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }
    
    await ctx.db.patch(args.productId, {
      stockQuantity: newStock,
    });
    
    return {
      productId: args.productId,
      oldStock: product.stockQuantity,
      newStock,
      adjustment: args.quantity,
      reason: args.reason,
    };
  },
});

// Get low stock products
export const getLowStockProducts = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("franchiserProducts")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .collect();
    
    return products.filter(product => {
      const minLevel = product.minStockLevel || 0;
      return product.stockQuantity <= minLevel;
    });
  },
});

// Get warehouse stock summary
export const getWarehouseStockSummary = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("franchiserProducts")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", args.franchiserId))
      .collect();
    
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => 
      p.stockQuantity <= (p.minStockLevel || 0)
    ).length;
    const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.stockQuantity * p.cost), 0);
    
    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      totalStockValue,
    };
  },
});

// Bulk update stock levels
export const bulkUpdateWarehouseStock = mutation({
  args: {
    updates: v.array(v.object({
      productId: v.id("franchiserProducts"),
      stockQuantity: v.number(),
      minStockLevel: v.optional(v.number()),
      maxStockLevel: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const update of args.updates) {
      const product = await ctx.db.get(update.productId);
      if (!product) continue;
      
      await ctx.db.patch(update.productId, {
        stockQuantity: update.stockQuantity,
        ...(update.minStockLevel !== undefined && { minStockLevel: update.minStockLevel }),
        ...(update.maxStockLevel !== undefined && { maxStockLevel: update.maxStockLevel }),
      });
      
      results.push({
        productId: update.productId,
        productName: product.name,
        updated: true,
      });
    }
    
    return results;
  },
});

