const { ConvexHttpClient } = require("convex/browser");

// Initialize Convex client
const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function seedData() {
  try {
    console.log("🌱 Starting to seed Convex database...");
    
    // Clear existing data first
    console.log("🧹 Clearing existing data...");
    await client.mutation("seedData:clearFranchiseData", {});
    
    // Seed new data
    console.log("📦 Seeding franchise data...");
    const result = await client.mutation("seedData:seedFranchiseData", {});
    
    console.log("✅ Successfully seeded database!");
    console.log(`📊 Created ${result.length} records:`, result);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeding
seedData();
