import { mutation } from "./_generated/server";

// Sample data for seeding the database
export const seedCountries = mutation({
  args: {},
  handler: async (ctx) => {
    const countries = [
      { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", currency: "AED", timezone: "Asia/Dubai" },
      { name: "United States", code: "US", flag: "🇺🇸", currency: "USD", timezone: "America/New_York" },
      { name: "United Kingdom", code: "GB", flag: "🇬🇧", currency: "GBP", timezone: "Europe/London" },
      { name: "Canada", code: "CA", flag: "🇨🇦", currency: "CAD", timezone: "America/Toronto" },
      { name: "Australia", code: "AU", flag: "🇦🇺", currency: "AUD", timezone: "Australia/Sydney" },
      { name: "Germany", code: "DE", flag: "🇩🇪", currency: "EUR", timezone: "Europe/Berlin" },
      { name: "France", code: "FR", flag: "🇫🇷", currency: "EUR", timezone: "Europe/Paris" },
      { name: "Italy", code: "IT", flag: "🇮🇹", currency: "EUR", timezone: "Europe/Rome" },
      { name: "Spain", code: "ES", flag: "🇪🇸", currency: "EUR", timezone: "Europe/Madrid" },
      { name: "Japan", code: "JP", flag: "🇯🇵", currency: "JPY", timezone: "Asia/Tokyo" },
      { name: "South Korea", code: "KR", flag: "🇰🇷", currency: "KRW", timezone: "Asia/Seoul" },
      { name: "Singapore", code: "SG", flag: "🇸🇬", currency: "SGD", timezone: "Asia/Singapore" },
      { name: "India", code: "IN", flag: "🇮🇳", currency: "INR", timezone: "Asia/Kolkata" },
      { name: "China", code: "CN", flag: "🇨🇳", currency: "CNY", timezone: "Asia/Shanghai" },
      { name: "Brazil", code: "BR", flag: "🇧🇷", currency: "BRL", timezone: "America/Sao_Paulo" },
    ];

    const results = [];
    for (const country of countries) {
      const id = await ctx.db.insert("countries", {
        ...country,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.push(id);
    }
    return results;
  },
});

export const seedIndustries = mutation({
  args: {},
  handler: async (ctx) => {
    const industries = [
      { name: "Food & Beverage", description: "Restaurants, cafes, food delivery", icon: "🍽️", sortOrder: 1 },
      { name: "Retail", description: "Fashion, electronics, general merchandise", icon: "🛍️", sortOrder: 2 },
      { name: "Health & Fitness", description: "Gyms, spas, wellness centers", icon: "💪", sortOrder: 3 },
      { name: "Education", description: "Tutoring, language schools, training centers", icon: "📚", sortOrder: 4 },
      { name: "Beauty & Personal Care", description: "Salons, spas, beauty products", icon: "💄", sortOrder: 5 },
      { name: "Automotive", description: "Car services, parts, accessories", icon: "🚗", sortOrder: 6 },
      { name: "Home Services", description: "Cleaning, maintenance, repairs", icon: "🏠", sortOrder: 7 },
      { name: "Technology", description: "IT services, software, gadgets", icon: "💻", sortOrder: 8 },
      { name: "Entertainment", description: "Gaming, events, leisure activities", icon: "🎮", sortOrder: 9 },
      { name: "Professional Services", description: "Legal, accounting, consulting", icon: "💼", sortOrder: 10 },
    ];

    const results = [];
    for (const industry of industries) {
      const id = await ctx.db.insert("industries", {
        ...industry,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.push(id);
    }
    return results;
  },
});

export const seedCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // First get all industries to link categories
    const industries = await ctx.db.query("industries").collect();
    const foodIndustry = industries.find(i => i.name === "Food & Beverage");
    const retailIndustry = industries.find(i => i.name === "Retail");
    const healthIndustry = industries.find(i => i.name === "Health & Fitness");
    const educationIndustry = industries.find(i => i.name === "Education");
    const beautyIndustry = industries.find(i => i.name === "Beauty & Personal Care");

    if (!foodIndustry || !retailIndustry || !healthIndustry || !educationIndustry || !beautyIndustry) {
      throw new Error("Required industries not found. Please seed industries first.");
    }

    const categories = [
      // Food & Beverage categories
      { name: "Fast Food", industryId: foodIndustry._id, description: "Quick service restaurants", icon: "🍔", sortOrder: 1 },
      { name: "Coffee & Tea", industryId: foodIndustry._id, description: "Coffee shops and tea houses", icon: "☕", sortOrder: 2 },
      { name: "Fine Dining", industryId: foodIndustry._id, description: "Upscale restaurants", icon: "🍽️", sortOrder: 3 },
      { name: "Bakery & Pastry", industryId: foodIndustry._id, description: "Bread, cakes, and pastries", icon: "🥖", sortOrder: 4 },
      { name: "Ice Cream & Desserts", industryId: foodIndustry._id, description: "Frozen treats and sweets", icon: "🍦", sortOrder: 5 },

      // Retail categories
      { name: "Fashion & Apparel", industryId: retailIndustry._id, description: "Clothing and accessories", icon: "👗", sortOrder: 1 },
      { name: "Electronics", industryId: retailIndustry._id, description: "Gadgets and electronic devices", icon: "📱", sortOrder: 2 },
      { name: "Home & Garden", industryId: retailIndustry._id, description: "Furniture and home decor", icon: "🏡", sortOrder: 3 },
      { name: "Sports & Outdoors", industryId: retailIndustry._id, description: "Athletic gear and outdoor equipment", icon: "⚽", sortOrder: 4 },
      { name: "Books & Media", industryId: retailIndustry._id, description: "Books, movies, and music", icon: "📖", sortOrder: 5 },

      // Health & Fitness categories
      { name: "Gyms & Fitness", industryId: healthIndustry._id, description: "Fitness centers and gyms", icon: "🏋️", sortOrder: 1 },
      { name: "Yoga & Pilates", industryId: healthIndustry._id, description: "Mind-body fitness studios", icon: "🧘", sortOrder: 2 },
      { name: "Spas & Wellness", industryId: healthIndustry._id, description: "Relaxation and wellness centers", icon: "🧖", sortOrder: 3 },
      { name: "Sports Training", industryId: healthIndustry._id, description: "Athletic training facilities", icon: "🏃", sortOrder: 4 },

      // Education categories
      { name: "Language Schools", industryId: educationIndustry._id, description: "Language learning centers", icon: "🗣️", sortOrder: 1 },
      { name: "Tutoring Centers", industryId: educationIndustry._id, description: "Academic tutoring services", icon: "📝", sortOrder: 2 },
      { name: "Professional Training", industryId: educationIndustry._id, description: "Career and skill development", icon: "🎓", sortOrder: 3 },
      { name: "Arts & Crafts", industryId: educationIndustry._id, description: "Creative learning studios", icon: "🎨", sortOrder: 4 },

      // Beauty & Personal Care categories
      { name: "Hair Salons", industryId: beautyIndustry._id, description: "Hair styling and cutting", icon: "💇", sortOrder: 1 },
      { name: "Nail Salons", industryId: beautyIndustry._id, description: "Manicure and pedicure services", icon: "💅", sortOrder: 2 },
      { name: "Skincare Clinics", industryId: beautyIndustry._id, description: "Facial and skin treatments", icon: "✨", sortOrder: 3 },
      { name: "Massage Therapy", industryId: beautyIndustry._id, description: "Therapeutic massage services", icon: "💆", sortOrder: 4 },
    ];

    const results = [];
    for (const category of categories) {
      const id = await ctx.db.insert("categories", {
        ...category,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.push(id);
    }
    return results;
  },
});

export const seedProductCategories = mutation({
  args: {},
  handler: async (ctx) => {
    // Get categories to link product categories
    const categories = await ctx.db.query("categories").collect();
    const fastFoodCategory = categories.find(c => c.name === "Fast Food");
    const coffeeCategory = categories.find(c => c.name === "Coffee & Tea");
    const fashionCategory = categories.find(c => c.name === "Fashion & Apparel");
    const electronicsCategory = categories.find(c => c.name === "Electronics");
    const gymCategory = categories.find(c => c.name === "Gyms & Fitness");

    if (!fastFoodCategory || !coffeeCategory || !fashionCategory || !electronicsCategory || !gymCategory) {
      throw new Error("Required categories not found. Please seed categories first.");
    }

    const productCategories = [
      // Fast Food product categories
      { name: "Burgers", categoryId: fastFoodCategory._id, industryId: fastFoodCategory.industryId, description: "Hamburgers and sandwiches", icon: "🍔", sortOrder: 1 },
      { name: "Pizza", categoryId: fastFoodCategory._id, industryId: fastFoodCategory.industryId, description: "Pizza varieties", icon: "🍕", sortOrder: 2 },
      { name: "Fried Chicken", categoryId: fastFoodCategory._id, industryId: fastFoodCategory.industryId, description: "Chicken and poultry", icon: "🍗", sortOrder: 3 },
      { name: "Mexican Food", categoryId: fastFoodCategory._id, industryId: fastFoodCategory.industryId, description: "Tacos, burritos, and wraps", icon: "🌮", sortOrder: 4 },
      { name: "Asian Food", categoryId: fastFoodCategory._id, industryId: fastFoodCategory.industryId, description: "Chinese, Japanese, Thai cuisine", icon: "🍜", sortOrder: 5 },

      // Coffee & Tea product categories
      { name: "Coffee Drinks", categoryId: coffeeCategory._id, industryId: coffeeCategory.industryId, description: "Espresso, latte, cappuccino", icon: "☕", sortOrder: 1 },
      { name: "Tea Varieties", categoryId: coffeeCategory._id, industryId: coffeeCategory.industryId, description: "Green, black, herbal teas", icon: "🍵", sortOrder: 2 },
      { name: "Cold Beverages", categoryId: coffeeCategory._id, industryId: coffeeCategory.industryId, description: "Iced coffee, smoothies", icon: "🧊", sortOrder: 3 },
      { name: "Pastries & Snacks", categoryId: coffeeCategory._id, industryId: coffeeCategory.industryId, description: "Muffins, croissants, cookies", icon: "🥐", sortOrder: 4 },

      // Fashion & Apparel product categories
      { name: "Men's Clothing", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Shirts, pants, suits", icon: "👔", sortOrder: 1 },
      { name: "Women's Clothing", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Dresses, tops, skirts", icon: "👗", sortOrder: 2 },
      { name: "Accessories", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Bags, jewelry, watches", icon: "👜", sortOrder: 3 },
      { name: "Shoes", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Sneakers, heels, boots", icon: "👠", sortOrder: 4 },
      { name: "Children's Wear", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Kids clothing and accessories", icon: "👶", sortOrder: 5 },

      // Electronics product categories
      { name: "Smartphones", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Mobile phones and accessories", icon: "📱", sortOrder: 1 },
      { name: "Computers", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Laptops, desktops, tablets", icon: "💻", sortOrder: 2 },
      { name: "Audio Equipment", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Headphones, speakers", icon: "🎧", sortOrder: 3 },
      { name: "Gaming", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Gaming consoles and accessories", icon: "🎮", sortOrder: 4 },
      { name: "Home Appliances", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Kitchen and home electronics", icon: "🏠", sortOrder: 5 },

      // Gyms & Fitness product categories
      { name: "Cardio Equipment", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Treadmills, bikes, ellipticals", icon: "🏃", sortOrder: 1 },
      { name: "Strength Training", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Weights, machines, benches", icon: "🏋️", sortOrder: 2 },
      { name: "Functional Fitness", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Kettlebells, TRX, functional equipment", icon: "⚡", sortOrder: 3 },
      { name: "Yoga & Pilates", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Mats, blocks, props", icon: "🧘", sortOrder: 4 },
      { name: "Supplements", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Protein, vitamins, nutrition", icon: "💊", sortOrder: 5 },
    ];

    const results = [];
    for (const productCategory of productCategories) {
      const id = await ctx.db.insert("productCategories", {
        ...productCategory,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      results.push(id);
    }
    return results;
  },
});

export const seedAllData = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Seed countries
      const countries = [
        { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", currency: "AED", timezone: "Asia/Dubai" },
        { name: "United States", code: "US", flag: "🇺🇸", currency: "USD", timezone: "America/New_York" },
        { name: "United Kingdom", code: "GB", flag: "🇬🇧", currency: "GBP", timezone: "Europe/London" },
        { name: "Canada", code: "CA", flag: "🇨🇦", currency: "CAD", timezone: "America/Toronto" },
        { name: "Australia", code: "AU", flag: "🇦🇺", currency: "AUD", timezone: "Australia/Sydney" },
        { name: "Germany", code: "DE", flag: "🇩🇪", currency: "EUR", timezone: "Europe/Berlin" },
        { name: "France", code: "FR", flag: "🇫🇷", currency: "EUR", timezone: "Europe/Paris" },
        { name: "Italy", code: "IT", flag: "🇮🇹", currency: "EUR", timezone: "Europe/Rome" },
        { name: "Spain", code: "ES", flag: "🇪🇸", currency: "EUR", timezone: "Europe/Madrid" },
        { name: "Japan", code: "JP", flag: "🇯🇵", currency: "JPY", timezone: "Asia/Tokyo" },
        { name: "South Korea", code: "KR", flag: "🇰🇷", currency: "KRW", timezone: "Asia/Seoul" },
        { name: "Singapore", code: "SG", flag: "🇸🇬", currency: "SGD", timezone: "Asia/Singapore" },
        { name: "India", code: "IN", flag: "🇮🇳", currency: "INR", timezone: "Asia/Kolkata" },
        { name: "China", code: "CN", flag: "🇨🇳", currency: "CNY", timezone: "Asia/Shanghai" },
        { name: "Brazil", code: "BR", flag: "🇧🇷", currency: "BRL", timezone: "America/Sao_Paulo" },
      ];

      const countryResults = [];
      for (const country of countries) {
        const id = await ctx.db.insert("countries", {
          ...country,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        countryResults.push(id);
      }
      console.log(`Seeded ${countryResults.length} countries`);

      // Seed industries
      const industries = [
        { name: "Food & Beverage", description: "Restaurants, cafes, fast food, and beverage franchises" },
        { name: "Retail", description: "Clothing, electronics, home goods, and specialty retail" },
        { name: "Health & Fitness", description: "Gyms, wellness centers, and health-related services" },
        { name: "Education", description: "Tutoring, language learning, and educational services" },
        { name: "Automotive", description: "Car services, parts, and automotive-related businesses" },
        { name: "Beauty & Personal Care", description: "Salons, spas, and personal care services" },
        { name: "Home Services", description: "Cleaning, maintenance, and home improvement services" },
        { name: "Technology", description: "IT services, software, and technology solutions" },
      ];

      const industryResults = [];
      for (const industry of industries) {
        const id = await ctx.db.insert("industries", {
          ...industry,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        industryResults.push(id);
      }
      console.log(`Seeded ${industryResults.length} industries`);

      // Seed categories
      const categories = [
        { name: "Quick Service Restaurant", industryId: industryResults[0], description: "Fast food and quick service dining" },
        { name: "Casual Dining", industryId: industryResults[0], description: "Casual sit-down restaurants" },
        { name: "Coffee & Tea", industryId: industryResults[0], description: "Coffee shops and tea houses" },
        { name: "Fashion Retail", industryId: industryResults[1], description: "Clothing and fashion retail" },
        { name: "Electronics", industryId: industryResults[1], description: "Electronics and technology retail" },
        { name: "Fitness Centers", industryId: industryResults[2], description: "Gyms and fitness facilities" },
        { name: "Wellness", industryId: industryResults[2], description: "Wellness and spa services" },
        { name: "Tutoring", industryId: industryResults[3], description: "Academic tutoring services" },
        { name: "Language Learning", industryId: industryResults[3], description: "Language education services" },
        { name: "Auto Repair", industryId: industryResults[4], description: "Automotive repair services" },
        { name: "Auto Parts", industryId: industryResults[4], description: "Automotive parts and accessories" },
        { name: "Hair Salons", industryId: industryResults[5], description: "Hair styling and beauty services" },
        { name: "Nail Salons", industryId: industryResults[5], description: "Nail care and beauty services" },
        { name: "Cleaning Services", industryId: industryResults[6], description: "Residential and commercial cleaning" },
        { name: "Home Maintenance", industryId: industryResults[6], description: "Home repair and maintenance" },
        { name: "IT Support", industryId: industryResults[7], description: "Computer and IT support services" },
        { name: "Software", industryId: industryResults[7], description: "Software development and services" },
      ];

      const categoryResults = [];
      for (const category of categories) {
        const id = await ctx.db.insert("categories", {
          ...category,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        categoryResults.push(id);
      }
      console.log(`Seeded ${categoryResults.length} categories`);

      // Seed product categories
      const productCategories = [
        { name: "Food Items", categoryId: categoryResults[0], industryId: industryResults[0], description: "Food products and ingredients" },
        { name: "Beverages", categoryId: categoryResults[0], industryId: industryResults[0], description: "Drinks and beverage products" },
        { name: "Clothing", categoryId: categoryResults[3], industryId: industryResults[1], description: "Apparel and fashion items" },
        { name: "Electronics", categoryId: categoryResults[4], industryId: industryResults[1], description: "Electronic devices and accessories" },
        { name: "Home Goods", categoryId: categoryResults[3], industryId: industryResults[1], description: "Home and household items" },
        { name: "Beauty Products", categoryId: categoryResults[11], industryId: industryResults[5], description: "Cosmetics and beauty supplies" },
        { name: "Health Supplements", categoryId: categoryResults[6], industryId: industryResults[2], description: "Vitamins and health supplements" },
        { name: "Books & Media", categoryId: categoryResults[7], industryId: industryResults[3], description: "Books, magazines, and media" },
        { name: "Toys & Games", categoryId: categoryResults[3], industryId: industryResults[1], description: "Children's toys and games" },
        { name: "Sports Equipment", categoryId: categoryResults[5], industryId: industryResults[2], description: "Sports and fitness equipment" },
      ];

      const productCategoryResults = [];
      for (const productCategory of productCategories) {
        const id = await ctx.db.insert("productCategories", {
          ...productCategory,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        productCategoryResults.push(id);
      }
      console.log(`Seeded ${productCategoryResults.length} product categories`);

      return {
        countries: countryResults.length,
        industries: industryResults.length,
        categories: categoryResults.length,
        productCategories: productCategoryResults.length,
      };
    } catch (error) {
      console.error("Error seeding data:", error);
      throw error;
    }
  },
});