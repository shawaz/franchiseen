import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get comprehensive inventory overview for a franchise
export const getInventoryOverview = query({
  args: {
    franchiseId: v.id("franchises"),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    // Get all products for this franchise
    const products = await ctx.db
      .query("franchiserProducts")
      .filter(q => q.eq(q.field("franchiserId"), franchise.franchiserId))
      .collect();

    // Calculate inventory metrics
    const totalProducts = products.length;
    const lowStockItems = products.filter(product => 
      product.stockQuantity <= (product.minStockLevel || 10)
    ).length;
    const outOfStockItems = products.filter(product => 
      product.stockQuantity === 0
    ).length;
    const totalStockValue = products.reduce((sum, product) => 
      sum + (product.stockQuantity * product.cost), 0
    );

    // Get category breakdown
    const categoryBreakdown = products.reduce((acc, product) => {
      const category = product.category;
      const value = product.stockQuantity * product.cost;
      acc[category] = {
        count: (acc[category]?.count || 0) + 1,
        totalValue: (acc[category]?.totalValue || 0) + value,
        totalStock: (acc[category]?.totalStock || 0) + product.stockQuantity,
      };
      return acc;
    }, {} as Record<string, { count: number; totalValue: number; totalStock: number }>);

    // Get stock status distribution
    const stockStatusDistribution = {
      inStock: products.filter(product => 
        product.stockQuantity > (product.minStockLevel || 10)
      ).length,
      lowStock: products.filter(product => 
        product.stockQuantity > 0 && product.stockQuantity <= (product.minStockLevel || 10)
      ).length,
      outOfStock: outOfStockItems,
    };

    return {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalStockValue,
      categoryBreakdown,
      stockStatusDistribution,
      products: products.map(product => ({
        ...product,
        totalValue: product.stockQuantity * product.cost,
        isLowStock: product.stockQuantity <= (product.minStockLevel || 10),
        isOutOfStock: product.stockQuantity === 0,
      })),
    };
  },
});

// Get low stock alerts for a franchise
export const getLowStockAlerts = query({
  args: {
    franchiseId: v.id("franchises"),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    const products = await ctx.db
      .query("franchiserProducts")
      .filter(q => q.eq(q.field("franchiserId"), franchise.franchiserId))
      .collect();

    const threshold = args.threshold || 10;
    
    const lowStockProducts = products
      .filter(product => product.stockQuantity <= threshold)
      .map(product => ({
        ...product,
        alertLevel: product.stockQuantity === 0 ? 'critical' : 'warning',
        daysUntilStockout: Math.ceil(product.stockQuantity / 5), // Mock calculation
        recommendedOrderQuantity: (product.maxStockLevel || 50) - product.stockQuantity,
      }))
      .sort((a, b) => a.stockQuantity - b.stockQuantity);

    return lowStockProducts;
  },
});

// Get inventory analytics for a franchise
export const getInventoryAnalytics = query({
  args: {
    franchiseId: v.id("franchises"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    const products = await ctx.db
      .query("franchiserProducts")
      .filter(q => q.eq(q.field("franchiserId"), franchise.franchiserId))
      .collect();

    // Calculate turnover rates (mock data for now)
    const turnoverRates = products.map(product => ({
      productId: product._id,
      productName: product.name,
      turnoverRate: Math.random() * 12, // Mock: 0-12 times per year
      avgMonthlySales: Math.random() * product.stockQuantity,
      daysOfStock: Math.ceil(product.stockQuantity / (Math.random() * 5 + 1)),
    }));

    // Calculate ABC analysis (mock data)
    const abcAnalysis = products
      .map(product => ({
        productId: product._id,
        productName: product.name,
        totalValue: product.stockQuantity * product.cost,
        category: product.category,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .map((product, index) => ({
        ...product,
        abcCategory: index < products.length * 0.2 ? 'A' : 
                    index < products.length * 0.5 ? 'B' : 'C',
      }));

    return {
      turnoverRates,
      abcAnalysis,
      totalInventoryValue: products.reduce((sum, product) => 
        sum + (product.stockQuantity * product.cost), 0
      ),
      avgInventoryValue: products.length > 0 ? 
        products.reduce((sum, product) => sum + (product.stockQuantity * product.cost), 0) / products.length : 0,
    };
  },
});

// Bulk update stock levels
export const bulkUpdateStock = mutation({
  args: {
    franchiseId: v.id("franchises"),
    updates: v.array(v.object({
      productId: v.id("franchiserProducts"),
      newStockQuantity: v.number(),
      reason: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    const results = [];
    
    for (const update of args.updates) {
      const product = await ctx.db.get(update.productId);
      if (!product || product.franchiserId !== franchise.franchiserId) {
        continue;
      }

      const oldStock = product.stockQuantity;
      
      await ctx.db.patch(update.productId, {
        stockQuantity: update.newStockQuantity,
      });

      results.push({
        productId: update.productId,
        productName: product.name,
        oldStock,
        newStock: update.newStockQuantity,
        difference: update.newStockQuantity - oldStock,
        reason: update.reason,
      });
    }

    return results;
  },
});

// Get stock movement history (mock implementation)
export const getStockMovementHistory = query({
  args: {
    franchiseId: v.id("franchises"),
    productId: v.optional(v.id("franchiserProducts")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // This would typically query a stock movements table
    // For now, return mock data
    const movements = [
      {
        id: "movement_1",
        productId: args.productId,
        productName: "Sample Product",
        type: "sale",
        quantity: -5,
        timestamp: Date.now() - 86400000, // 1 day ago
        reason: "POS Sale",
        reference: "Order #12345",
      },
      {
        id: "movement_2",
        productId: args.productId,
        productName: "Sample Product",
        type: "restock",
        quantity: 50,
        timestamp: Date.now() - 172800000, // 2 days ago
        reason: "Stock Transfer",
        reference: "Transfer #67890",
      },
    ];

    return movements.slice(0, args.limit || 10);
  },
});

// Get inventory recommendations
export const getInventoryRecommendations = query({
  args: {
    franchiseId: v.id("franchises"),
  },
  handler: async (ctx, args) => {
    const franchise = await ctx.db.get(args.franchiseId);
    if (!franchise) {
      throw new Error("Franchise not found");
    }

    const products = await ctx.db
      .query("franchiserProducts")
      .filter(q => q.eq(q.field("franchiserId"), franchise.franchiserId))
      .collect();

    const recommendations = [];

    // Low stock recommendations
    const lowStockProducts = products.filter(product => 
      product.stockQuantity <= (product.minStockLevel || 10)
    );

    if (lowStockProducts.length > 0) {
      recommendations.push({
        type: "low_stock",
        priority: "high",
        title: "Low Stock Alert",
        description: `${lowStockProducts.length} products are running low on stock`,
        products: lowStockProducts.map(product => ({
          id: product._id,
          name: product.name,
          currentStock: product.stockQuantity,
          minLevel: product.minStockLevel || 10,
          recommendedOrder: (product.maxStockLevel || 50) - product.stockQuantity,
        })),
      });
    }

    // Overstock recommendations
    const overstockProducts = products.filter(product => 
      product.stockQuantity > (product.maxStockLevel || 100)
    );

    if (overstockProducts.length > 0) {
      recommendations.push({
        type: "overstock",
        priority: "medium",
        title: "Overstock Alert",
        description: `${overstockProducts.length} products have excess inventory`,
        products: overstockProducts.map(product => ({
          id: product._id,
          name: product.name,
          currentStock: product.stockQuantity,
          maxLevel: product.maxStockLevel || 100,
          excessStock: product.stockQuantity - (product.maxStockLevel || 100),
        })),
      });
    }

    // Slow-moving inventory
    const slowMovingProducts = products
      .filter(product => product.stockQuantity > 0)
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .slice(0, 5);

    if (slowMovingProducts.length > 0) {
      recommendations.push({
        type: "slow_moving",
        priority: "low",
        title: "Slow-Moving Inventory",
        description: "Consider promotional strategies for these products",
        products: slowMovingProducts.map(product => ({
          id: product._id,
          name: product.name,
          currentStock: product.stockQuantity,
          category: product.category,
        })),
      });
    }

    return recommendations;
  },
});

