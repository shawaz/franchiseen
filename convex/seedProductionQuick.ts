/**
 * Quick seed script for production database
 * This populates essential master data needed for the app to function
 */

import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const seedEssentialData = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("🌱 Starting production database seed...");

    // Check if data already exists
    const existingIndustries = await ctx.db.query("industries").collect();
    if (existingIndustries.length > 0) {
      console.log("⚠️ Data already exists. Skipping seed.");
      return { message: "Data already exists", success: false };
    }

    try {
      // 1. Seed Industries
      const industryIds: Record<string, Id<"industries">> = {};
      
      const industries = [
        { name: "Food & Beverage", icon: "🍔", description: "Restaurants, cafes, and food services" },
        { name: "Retail", icon: "🛍️", description: "Shops and retail stores" },
        { name: "Services", icon: "💼", description: "Professional and personal services" },
        { name: "Health & Fitness", icon: "💪", description: "Gyms, wellness, and health services" },
        { name: "Education", icon: "📚", description: "Training and educational services" },
        { name: "Technology", icon: "💻", description: "Tech services and products" },
      ];

      console.log("Creating industries...");
      for (const industry of industries) {
        const id = await ctx.db.insert("industries", {
          name: industry.name,
          icon: industry.icon,
          description: industry.description,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        industryIds[industry.name] = id;
        console.log(`✅ Created industry: ${industry.name}`);
      }

      // 2. Seed Categories
      console.log("Creating categories...");
      const categories = [
        // Food & Beverage
        { name: "Quick Service Restaurant (QSR)", icon: "🍔", industryName: "Food & Beverage" },
        { name: "Casual Dining", icon: "🍽️", industryName: "Food & Beverage" },
        { name: "Cafe & Bakery", icon: "☕", industryName: "Food & Beverage" },
        { name: "Ice Cream & Desserts", icon: "🍦", industryName: "Food & Beverage" },
        { name: "Juice & Smoothie Bar", icon: "🥤", industryName: "Food & Beverage" },
        
        // Retail
        { name: "Fashion & Apparel", icon: "👗", industryName: "Retail" },
        { name: "Convenience Store", icon: "🏪", industryName: "Retail" },
        { name: "Specialty Retail", icon: "🎁", industryName: "Retail" },
        
        // Services
        { name: "Beauty & Salon", icon: "💇", industryName: "Services" },
        { name: "Cleaning Services", icon: "🧹", industryName: "Services" },
        { name: "Pet Services", icon: "🐕", industryName: "Services" },
        
        // Health & Fitness
        { name: "Gym & Fitness Center", icon: "🏋️", industryName: "Health & Fitness" },
        { name: "Yoga & Wellness", icon: "🧘", industryName: "Health & Fitness" },
        
        // Education
        { name: "Tutoring & Learning Center", icon: "📖", industryName: "Education" },
        { name: "Early Childhood Education", icon: "🎨", industryName: "Education" },
        
        // Technology
        { name: "IT Services", icon: "💻", industryName: "Technology" },
        { name: "Mobile Repair", icon: "📱", industryName: "Technology" },
      ];

      for (const category of categories) {
        const industryId = industryIds[category.industryName];
        if (industryId) {
          await ctx.db.insert("categories", {
            name: category.name,
            icon: category.icon,
            industryId: industryId,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          console.log(`✅ Created category: ${category.name}`);
        }
      }

      // 3. Seed Product Categories (for product management)
      console.log("Creating product categories...");
      const allCategories = await ctx.db.query("categories").collect();
      
      const productCategories = [
        // Food categories
        { name: "Burgers", icon: "🍔" },
        { name: "Pizza", icon: "🍕" },
        { name: "Sandwiches", icon: "🥪" },
        { name: "Salads", icon: "🥗" },
        { name: "Beverages", icon: "🥤" },
        { name: "Desserts", icon: "🍰" },
        { name: "Coffee", icon: "☕" },
        { name: "Breakfast", icon: "🍳" },
        
        // Retail categories
        { name: "Clothing", icon: "👕" },
        { name: "Accessories", icon: "👜" },
        { name: "Footwear", icon: "👟" },
        { name: "Electronics", icon: "📱" },
        
        // General
        { name: "Other", icon: "📦" },
      ];

      for (const productCat of productCategories) {
        // Associate with first relevant category (or all categories)
        const relevantCategory = allCategories[0]; // For simplicity, use first category
        if (relevantCategory) {
          await ctx.db.insert("productCategories", {
            name: productCat.name,
            icon: productCat.icon,
            industryId: relevantCategory.industryId,
            categoryId: relevantCategory._id,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
          console.log(`✅ Created product category: ${productCat.name}`);
        }
      }

      console.log("✅ Production database seeded successfully!");
      
      return {
        success: true,
        message: "Production database seeded with essential data",
        stats: {
          industries: industries.length,
          categories: categories.length,
          productCategories: productCategories.length,
        }
      };
      
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      throw new Error(`Failed to seed database: ${error}`);
    }
  },
});

