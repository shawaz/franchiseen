import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    // Get all categories to link product categories
    const categories = await ctx.db.query("categories").collect();
    const industries = await ctx.db.query("industries").collect();

    // Find specific categories
    const fastFoodCategory = categories.find(c => c.name === "Fast Food");
    const coffeeCategory = categories.find(c => c.name === "Coffee & Tea");
    const fineDiningCategory = categories.find(c => c.name === "Fine Dining");
    const bakeryCategory = categories.find(c => c.name === "Bakery & Pastry");
    const iceCreamCategory = categories.find(c => c.name === "Ice Cream & Desserts");
    const fashionCategory = categories.find(c => c.name === "Fashion & Apparel");
    const electronicsCategory = categories.find(c => c.name === "Electronics");
    const homeGardenCategory = categories.find(c => c.name === "Home & Garden");
    const sportsCategory = categories.find(c => c.name === "Sports & Outdoors");
    const booksCategory = categories.find(c => c.name === "Books & Media");
    const gymCategory = categories.find(c => c.name === "Gyms & Fitness");
    const yogaCategory = categories.find(c => c.name === "Yoga & Pilates");
    const spaCategory = categories.find(c => c.name === "Spas & Wellness");
    const sportsTrainingCategory = categories.find(c => c.name === "Sports Training");
    const languageCategory = categories.find(c => c.name === "Language Schools");
    const tutoringCategory = categories.find(c => c.name === "Tutoring Centers");
    const trainingCategory = categories.find(c => c.name === "Professional Training");
    const artsCategory = categories.find(c => c.name === "Arts & Crafts");
    const hairCategory = categories.find(c => c.name === "Hair Salons");
    const nailCategory = categories.find(c => c.name === "Nail Salons");
    const skincareCategory = categories.find(c => c.name === "Skincare Clinics");
    const massageCategory = categories.find(c => c.name === "Massage Therapy");

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
      { name: "Sandwiches", categoryId: fastFoodCategory._id, industryId: fastFoodCategory.industryId, description: "Subs, wraps, and deli sandwiches", icon: "🥪", sortOrder: 6 },
      { name: "Salads", categoryId: fastFoodCategory._id, industryId: fastFoodCategory.industryId, description: "Fresh salads and healthy options", icon: "🥗", sortOrder: 7 },

      // Coffee & Tea product categories
      { name: "Coffee Drinks", categoryId: coffeeCategory._id, industryId: coffeeCategory.industryId, description: "Espresso, latte, cappuccino", icon: "☕", sortOrder: 1 },
      { name: "Tea Varieties", categoryId: coffeeCategory._id, industryId: coffeeCategory.industryId, description: "Green, black, herbal teas", icon: "🍵", sortOrder: 2 },
      { name: "Cold Beverages", categoryId: coffeeCategory._id, industryId: coffeeCategory.industryId, description: "Iced coffee, smoothies", icon: "🧊", sortOrder: 3 },
      { name: "Pastries & Snacks", categoryId: coffeeCategory._id, industryId: coffeeCategory.industryId, description: "Muffins, croissants, cookies", icon: "🥐", sortOrder: 4 },
      { name: "Breakfast Items", categoryId: coffeeCategory._id, industryId: coffeeCategory.industryId, description: "Bagels, breakfast sandwiches", icon: "🥯", sortOrder: 5 },
      { name: "Specialty Drinks", categoryId: coffeeCategory._id, industryId: coffeeCategory.industryId, description: "Frappes, seasonal drinks", icon: "🌟", sortOrder: 6 },

      // Fine Dining product categories
      { name: "Appetizers", categoryId: fineDiningCategory?._id, industryId: fineDiningCategory?.industryId, description: "Starters and appetizers", icon: "🥂", sortOrder: 1 },
      { name: "Main Courses", categoryId: fineDiningCategory?._id, industryId: fineDiningCategory?.industryId, description: "Entrees and main dishes", icon: "🍽️", sortOrder: 2 },
      { name: "Desserts", categoryId: fineDiningCategory?._id, industryId: fineDiningCategory?.industryId, description: "Fine dining desserts", icon: "🍰", sortOrder: 3 },
      { name: "Wine & Beverages", categoryId: fineDiningCategory?._id, industryId: fineDiningCategory?.industryId, description: "Wine pairings and cocktails", icon: "🍷", sortOrder: 4 },

      // Bakery & Pastry product categories
      { name: "Bread", categoryId: bakeryCategory?._id, industryId: bakeryCategory?.industryId, description: "Fresh bread and rolls", icon: "🥖", sortOrder: 1 },
      { name: "Cakes", categoryId: bakeryCategory?._id, industryId: bakeryCategory?.industryId, description: "Birthday and celebration cakes", icon: "🎂", sortOrder: 2 },
      { name: "Pastries", categoryId: bakeryCategory?._id, industryId: bakeryCategory?.industryId, description: "Croissants, danishes, tarts", icon: "🥐", sortOrder: 3 },
      { name: "Cookies & Biscuits", categoryId: bakeryCategory?._id, industryId: bakeryCategory?.industryId, description: "Sweet treats and cookies", icon: "🍪", sortOrder: 4 },
      { name: "Donuts", categoryId: bakeryCategory?._id, industryId: bakeryCategory?.industryId, description: "Fresh donuts and glazed treats", icon: "🍩", sortOrder: 5 },

      // Ice Cream & Desserts product categories
      { name: "Ice Cream", categoryId: iceCreamCategory?._id, industryId: iceCreamCategory?.industryId, description: "Ice cream flavors and scoops", icon: "🍦", sortOrder: 1 },
      { name: "Frozen Yogurt", categoryId: iceCreamCategory?._id, industryId: iceCreamCategory?.industryId, description: "Frozen yogurt and toppings", icon: "🍨", sortOrder: 2 },
      { name: "Milkshakes", categoryId: iceCreamCategory?._id, industryId: iceCreamCategory?.industryId, description: "Thick shakes and smoothies", icon: "🥤", sortOrder: 3 },
      { name: "Sundaes", categoryId: iceCreamCategory?._id, industryId: iceCreamCategory?.industryId, description: "Ice cream sundaes and parfaits", icon: "🍧", sortOrder: 4 },

      // Fashion & Apparel product categories
      { name: "Men's Clothing", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Shirts, pants, suits", icon: "👔", sortOrder: 1 },
      { name: "Women's Clothing", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Dresses, tops, skirts", icon: "👗", sortOrder: 2 },
      { name: "Accessories", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Bags, jewelry, watches", icon: "👜", sortOrder: 3 },
      { name: "Shoes", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Sneakers, heels, boots", icon: "👠", sortOrder: 4 },
      { name: "Children's Wear", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Kids clothing and accessories", icon: "👶", sortOrder: 5 },
      { name: "Activewear", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Athletic and workout clothing", icon: "🏃", sortOrder: 6 },
      { name: "Underwear & Lingerie", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Intimate apparel", icon: "👙", sortOrder: 7 },
      { name: "Outerwear", categoryId: fashionCategory._id, industryId: fashionCategory.industryId, description: "Jackets, coats, and outerwear", icon: "🧥", sortOrder: 8 },

      // Electronics product categories
      { name: "Smartphones", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Mobile phones and accessories", icon: "📱", sortOrder: 1 },
      { name: "Computers", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Laptops, desktops, tablets", icon: "💻", sortOrder: 2 },
      { name: "Audio Equipment", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Headphones, speakers", icon: "🎧", sortOrder: 3 },
      { name: "Gaming", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Gaming consoles and accessories", icon: "🎮", sortOrder: 4 },
      { name: "Home Appliances", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Kitchen and home electronics", icon: "🏠", sortOrder: 5 },
      { name: "Cameras", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Digital cameras and photography", icon: "📷", sortOrder: 6 },
      { name: "Wearables", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Smartwatches and fitness trackers", icon: "⌚", sortOrder: 7 },
      { name: "TV & Home Theater", categoryId: electronicsCategory._id, industryId: electronicsCategory.industryId, description: "Televisions and entertainment", icon: "📺", sortOrder: 8 },

      // Home & Garden product categories
      { name: "Furniture", categoryId: homeGardenCategory?._id, industryId: homeGardenCategory?.industryId, description: "Home and office furniture", icon: "🪑", sortOrder: 1 },
      { name: "Home Decor", categoryId: homeGardenCategory?._id, industryId: homeGardenCategory?.industryId, description: "Decorative items and accessories", icon: "🖼️", sortOrder: 2 },
      { name: "Garden Tools", categoryId: homeGardenCategory?._id, industryId: homeGardenCategory?.industryId, description: "Gardening equipment and tools", icon: "🌱", sortOrder: 3 },
      { name: "Plants & Seeds", categoryId: homeGardenCategory?._id, industryId: homeGardenCategory?.industryId, description: "Indoor and outdoor plants", icon: "🌿", sortOrder: 4 },
      { name: "Kitchenware", categoryId: homeGardenCategory?._id, industryId: homeGardenCategory?.industryId, description: "Cooking and kitchen accessories", icon: "🍳", sortOrder: 5 },
      { name: "Bedding", categoryId: homeGardenCategory?._id, industryId: homeGardenCategory?.industryId, description: "Sheets, pillows, and comforters", icon: "🛏️", sortOrder: 6 },

      // Sports & Outdoors product categories
      { name: "Athletic Equipment", categoryId: sportsCategory?._id, industryId: sportsCategory?.industryId, description: "Sports gear and equipment", icon: "⚽", sortOrder: 1 },
      { name: "Outdoor Gear", categoryId: sportsCategory?._id, industryId: sportsCategory?.industryId, description: "Camping and hiking equipment", icon: "🎒", sortOrder: 2 },
      { name: "Water Sports", categoryId: sportsCategory?._id, industryId: sportsCategory?.industryId, description: "Swimming and water activities", icon: "🏊", sortOrder: 3 },
      { name: "Winter Sports", categoryId: sportsCategory?._id, industryId: sportsCategory?.industryId, description: "Skiing and snowboarding gear", icon: "⛷️", sortOrder: 4 },
      { name: "Team Sports", categoryId: sportsCategory?._id, industryId: sportsCategory?.industryId, description: "Basketball, football, soccer gear", icon: "🏀", sortOrder: 5 },

      // Books & Media product categories
      { name: "Books", categoryId: booksCategory?._id, industryId: booksCategory?.industryId, description: "Fiction, non-fiction, textbooks", icon: "📚", sortOrder: 1 },
      { name: "Movies & TV", categoryId: booksCategory?._id, industryId: booksCategory?.industryId, description: "DVDs, Blu-rays, streaming", icon: "🎬", sortOrder: 2 },
      { name: "Music", categoryId: booksCategory?._id, industryId: booksCategory?.industryId, description: "CDs, vinyl, digital music", icon: "🎵", sortOrder: 3 },
      { name: "Magazines", categoryId: booksCategory?._id, industryId: booksCategory?.industryId, description: "Periodicals and magazines", icon: "📰", sortOrder: 4 },
      { name: "Educational Materials", categoryId: booksCategory?._id, industryId: booksCategory?.industryId, description: "Learning resources and tools", icon: "📖", sortOrder: 5 },

      // Gyms & Fitness product categories
      { name: "Cardio Equipment", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Treadmills, bikes, ellipticals", icon: "🏃", sortOrder: 1 },
      { name: "Strength Training", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Weights, machines, benches", icon: "🏋️", sortOrder: 2 },
      { name: "Functional Fitness", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Kettlebells, TRX, functional equipment", icon: "⚡", sortOrder: 3 },
      { name: "Yoga & Pilates", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Mats, blocks, props", icon: "🧘", sortOrder: 4 },
      { name: "Supplements", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Protein, vitamins, nutrition", icon: "💊", sortOrder: 5 },
      { name: "Fitness Apparel", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Workout clothes and gear", icon: "👕", sortOrder: 6 },
      { name: "Recovery Tools", categoryId: gymCategory._id, industryId: gymCategory.industryId, description: "Foam rollers, massage tools", icon: "🛠️", sortOrder: 7 },

      // Yoga & Pilates product categories
      { name: "Yoga Mats", categoryId: yogaCategory?._id, industryId: yogaCategory?.industryId, description: "Yoga mats and accessories", icon: "🧘", sortOrder: 1 },
      { name: "Pilates Equipment", categoryId: yogaCategory?._id, industryId: yogaCategory?.industryId, description: "Pilates reformers and props", icon: "🤸", sortOrder: 2 },
      { name: "Meditation Tools", categoryId: yogaCategory?._id, industryId: yogaCategory?.industryId, description: "Cushions, blocks, meditation aids", icon: "🕯️", sortOrder: 3 },
      { name: "Yoga Clothing", categoryId: yogaCategory?._id, industryId: yogaCategory?.industryId, description: "Yoga pants, tops, and activewear", icon: "👖", sortOrder: 4 },

      // Spas & Wellness product categories
      { name: "Skincare Products", categoryId: spaCategory?._id, industryId: spaCategory?.industryId, description: "Facial and body care products", icon: "✨", sortOrder: 1 },
      { name: "Massage Oils", categoryId: spaCategory?._id, industryId: spaCategory?.industryId, description: "Essential oils and massage products", icon: "🫒", sortOrder: 2 },
      { name: "Wellness Supplements", categoryId: spaCategory?._id, industryId: spaCategory?.industryId, description: "Vitamins and wellness products", icon: "💊", sortOrder: 3 },
      { name: "Spa Accessories", categoryId: spaCategory?._id, industryId: spaCategory?.industryId, description: "Towels, robes, spa equipment", icon: "🛁", sortOrder: 4 },

      // Sports Training product categories
      { name: "Training Equipment", categoryId: sportsTrainingCategory?._id, industryId: sportsTrainingCategory?.industryId, description: "Sports training gear", icon: "🏃", sortOrder: 1 },
      { name: "Protective Gear", categoryId: sportsTrainingCategory?._id, industryId: sportsTrainingCategory?.industryId, description: "Helmets, pads, safety equipment", icon: "🛡️", sortOrder: 2 },
      { name: "Performance Nutrition", categoryId: sportsTrainingCategory?._id, industryId: sportsTrainingCategory?.industryId, description: "Sports nutrition and supplements", icon: "🥤", sortOrder: 3 },
      { name: "Recovery Equipment", categoryId: sportsTrainingCategory?._id, industryId: sportsTrainingCategory?.industryId, description: "Recovery and rehabilitation tools", icon: "🩹", sortOrder: 4 },

      // Language Schools product categories
      { name: "Language Books", categoryId: languageCategory?._id, industryId: languageCategory?.industryId, description: "Textbooks and learning materials", icon: "📚", sortOrder: 1 },
      { name: "Audio Materials", categoryId: languageCategory?._id, industryId: languageCategory?.industryId, description: "CDs, audio courses, podcasts", icon: "🎧", sortOrder: 2 },
      { name: "Digital Resources", categoryId: languageCategory?._id, industryId: languageCategory?.industryId, description: "Apps, online courses, software", icon: "💻", sortOrder: 3 },
      { name: "Cultural Materials", categoryId: languageCategory?._id, industryId: languageCategory?.industryId, description: "Cultural books and resources", icon: "🌍", sortOrder: 4 },

      // Tutoring Centers product categories
      { name: "Educational Books", categoryId: tutoringCategory?._id, industryId: tutoringCategory?.industryId, description: "Textbooks and study guides", icon: "📖", sortOrder: 1 },
      { name: "Study Materials", categoryId: tutoringCategory?._id, industryId: tutoringCategory?.industryId, description: "Workbooks, practice tests", icon: "📝", sortOrder: 2 },
      { name: "Digital Learning", categoryId: tutoringCategory?._id, industryId: tutoringCategory?.industryId, description: "Online platforms and software", icon: "💻", sortOrder: 3 },
      { name: "Art Supplies", categoryId: tutoringCategory?._id, industryId: tutoringCategory?.industryId, description: "Pens, pencils, art materials", icon: "✏️", sortOrder: 4 },

      // Professional Training product categories
      { name: "Training Materials", categoryId: trainingCategory?._id, industryId: trainingCategory?.industryId, description: "Professional development resources", icon: "📋", sortOrder: 1 },
      { name: "Certification Prep", categoryId: trainingCategory?._id, industryId: trainingCategory?.industryId, description: "Exam prep and certification materials", icon: "🎓", sortOrder: 2 },
      { name: "Software Training", categoryId: trainingCategory?._id, industryId: trainingCategory?.industryId, description: "Software and technical training", icon: "💻", sortOrder: 3 },
      { name: "Leadership Materials", categoryId: trainingCategory?._id, industryId: trainingCategory?.industryId, description: "Management and leadership resources", icon: "👔", sortOrder: 4 },

      // Arts & Crafts product categories
      { name: "Art Supplies", categoryId: artsCategory?._id, industryId: artsCategory?.industryId, description: "Paints, brushes, canvases", icon: "🎨", sortOrder: 1 },
      { name: "Craft Materials", categoryId: artsCategory?._id, industryId: artsCategory?.industryId, description: "Paper, glue, craft supplies", icon: "✂️", sortOrder: 2 },
      { name: "Jewelry Making", categoryId: artsCategory?._id, industryId: artsCategory?.industryId, description: "Beads, wire, jewelry tools", icon: "💎", sortOrder: 3 },
      { name: "Pottery Supplies", categoryId: artsCategory?._id, industryId: artsCategory?.industryId, description: "Clay, pottery tools, kilns", icon: "🏺", sortOrder: 4 },

      // Hair Salons product categories
      { name: "Hair Products", categoryId: hairCategory?._id, industryId: hairCategory?.industryId, description: "Shampoo, conditioner, styling products", icon: "🧴", sortOrder: 1 },
      { name: "Hair Tools", categoryId: hairCategory?._id, industryId: hairCategory?.industryId, description: "Brushes, combs, styling tools", icon: "💇", sortOrder: 2 },
      { name: "Hair Accessories", categoryId: hairCategory?._id, industryId: hairCategory?.industryId, description: "Clips, bands, decorative items", icon: "🎀", sortOrder: 3 },
      { name: "Hair Color", categoryId: hairCategory?._id, industryId: hairCategory?.industryId, description: "Dyes, highlights, color treatments", icon: "🌈", sortOrder: 4 },

      // Nail Salons product categories
      { name: "Nail Polish", categoryId: nailCategory?._id, industryId: nailCategory?.industryId, description: "Nail polish and nail art", icon: "💅", sortOrder: 1 },
      { name: "Nail Tools", categoryId: nailCategory?._id, industryId: nailCategory?.industryId, description: "Files, clippers, manicure tools", icon: "✂️", sortOrder: 2 },
      { name: "Nail Art", categoryId: nailCategory?._id, industryId: nailCategory?.industryId, description: "Decals, stickers, nail art supplies", icon: "✨", sortOrder: 3 },
      { name: "Nail Care", categoryId: nailCategory?._id, industryId: nailCategory?.industryId, description: "Cuticle oil, hand cream, treatments", icon: "🧴", sortOrder: 4 },

      // Skincare Clinics product categories
      { name: "Facial Products", categoryId: skincareCategory?._id, industryId: skincareCategory?.industryId, description: "Cleansers, toners, moisturizers", icon: "🧼", sortOrder: 1 },
      { name: "Anti-Aging", categoryId: skincareCategory?._id, industryId: skincareCategory?.industryId, description: "Serums, creams, treatments", icon: "⏰", sortOrder: 2 },
      { name: "Sun Protection", categoryId: skincareCategory?._id, industryId: skincareCategory?.industryId, description: "Sunscreen, SPF products", icon: "☀️", sortOrder: 3 },
      { name: "Professional Treatments", categoryId: skincareCategory?._id, industryId: skincareCategory?.industryId, description: "Peels, masks, clinical products", icon: "🔬", sortOrder: 4 },

      // Massage Therapy product categories
      { name: "Massage Oils", categoryId: massageCategory?._id, industryId: massageCategory?.industryId, description: "Essential oils and massage oils", icon: "🫒", sortOrder: 1 },
      { name: "Massage Tools", categoryId: massageCategory?._id, industryId: massageCategory?.industryId, description: "Stones, rollers, massage tools", icon: "🪨", sortOrder: 2 },
      { name: "Aromatherapy", categoryId: massageCategory?._id, industryId: massageCategory?.industryId, description: "Essential oils and aromatherapy", icon: "🕯️", sortOrder: 3 },
      { name: "Therapeutic Products", categoryId: massageCategory?._id, industryId: massageCategory?.industryId, description: "Pain relief and therapeutic items", icon: "💆", sortOrder: 4 },
    ];

    const results = [];
    for (const productCategory of productCategories) {
      // Only insert if both category and industry exist
      if (productCategory.categoryId && productCategory.industryId) {
        const id = await ctx.db.insert("productCategories", {
          name: productCategory.name,
          categoryId: productCategory.categoryId,
          industryId: productCategory.industryId,
          description: productCategory.description,
          icon: productCategory.icon,
          sortOrder: productCategory.sortOrder,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        results.push(id);
      }
    }
    return results;
  },
});

// Query functions for product categories
export const getProductCategoriesByIndustry = query({
  args: { industryId: v.id("industries") },
  handler: async (ctx, { industryId }) => {
    return await ctx.db
      .query("productCategories")
      .withIndex("by_industry", (q) => q.eq("industryId", industryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

export const getProductCategoriesByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, { categoryId }) => {
    return await ctx.db
      .query("productCategories")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
  },
});

export const getAllProductCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("productCategories")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();
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

// Seed super admin user
export const seedSuperAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const superAdminWallet = "AWKkqeEFHsC8LqPcYAf1ivWkAwji2zZmiPWvpXacCNtn";
    
    // Check if super admin already exists
    const existingAdmin = await ctx.db
      .query("adminUsers")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", superAdminWallet))
      .first();
    
    if (existingAdmin) {
      console.log("Super admin already exists");
      return existingAdmin._id;
    }

    // Create super admin user
    const adminUserId = await ctx.db.insert("adminUsers", {
      walletAddress: superAdminWallet,
      email: "admin@franchiseen.com",
      name: "Super Admin",
      role: "super_admin",
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add to team with all departments
    await ctx.db.insert("adminTeam", {
      userId: adminUserId,
      name: "Super Admin",
      email: "admin@franchiseen.com",
      role: "super_admin",
      departments: ["management", "operations", "finance", "people", "marketing", "sales", "support", "software"],
      permissions: ["all"],
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log("Super admin created successfully");
    return adminUserId;
  },
});