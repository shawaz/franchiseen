import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Script to add sample products with stock data
export const seedSampleProducts = mutation({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, args) => {
    const sampleProducts = [
      {
        franchiserId: args.franchiserId,
        name: "Premium Coffee Beans",
        description: "High-quality arabica coffee beans from Colombia",
        cost: 8.50,
        price: 15.99,
        images: [],
        category: "Food & Beverage",
        status: "active" as const,
        stockQuantity: 150,
        minStockLevel: 20,
        maxStockLevel: 200,
        unit: "kg",
        createdAt: Date.now(),
      },
      {
        franchiserId: args.franchiserId,
        name: "Organic Green Tea",
        description: "Premium organic green tea leaves",
        cost: 12.00,
        price: 22.99,
        images: [],
        category: "Food & Beverage",
        status: "active" as const,
        stockQuantity: 8, // Low stock
        minStockLevel: 15,
        maxStockLevel: 100,
        unit: "boxes",
        createdAt: Date.now(),
      },
      {
        franchiserId: args.franchiserId,
        name: "Artisan Chocolate",
        description: "Handcrafted dark chocolate bars",
        cost: 4.50,
        price: 9.99,
        images: [],
        category: "Food & Beverage",
        status: "active" as const,
        stockQuantity: 0, // Out of stock
        minStockLevel: 10,
        maxStockLevel: 50,
        unit: "pieces",
        createdAt: Date.now(),
      },
      {
        franchiserId: args.franchiserId,
        name: "Ceramic Mugs",
        description: "Premium ceramic coffee mugs",
        cost: 6.00,
        price: 14.99,
        images: [],
        category: "Accessories",
        status: "active" as const,
        stockQuantity: 45,
        minStockLevel: 10,
        maxStockLevel: 80,
        unit: "pieces",
        createdAt: Date.now(),
      },
      {
        franchiserId: args.franchiserId,
        name: "Stainless Steel Bottles",
        description: "Insulated stainless steel water bottles",
        cost: 18.00,
        price: 35.99,
        images: [],
        category: "Accessories",
        status: "active" as const,
        stockQuantity: 25,
        minStockLevel: 5,
        maxStockLevel: 40,
        unit: "pieces",
        createdAt: Date.now(),
      },
    ];

    const productIds = [];
    for (const product of sampleProducts) {
      const id = await ctx.db.insert("franchiserProducts", product);
      productIds.push(id);
    }

    return productIds;
  },
});
