import { mutation } from "./_generated/server";

// Creates a handful of sample brands + franchise listings so the
// homepage has something to display on a freshly created Convex project.
export const seedSampleFranchises = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("franchises").first();
    if (existing) {
      return { success: false, message: "Franchises already exist. Skipping seed." };
    }

    const now = Date.now();

    // Reuse an industry/category if present, otherwise create minimal ones.
    async function ensureIndustry(name: string, icon: string) {
      const found = await ctx.db
        .query("industries")
        .filter((q) => q.eq(q.field("name"), name))
        .first();
      if (found) return found._id;
      return await ctx.db.insert("industries", {
        name,
        icon,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    async function ensureCategory(name: string, industryId: Awaited<ReturnType<typeof ensureIndustry>>, icon: string) {
      const found = await ctx.db
        .query("categories")
        .filter((q) => q.eq(q.field("name"), name))
        .first();
      if (found) return found._id;
      return await ctx.db.insert("categories", {
        name,
        industryId,
        icon,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    const foodIndustryId = await ensureIndustry("Food & Beverage", "🍽️");
    const fitnessIndustryId = await ensureIndustry("Health & Fitness", "💪");
    const techIndustryId = await ensureIndustry("Technology", "💻");

    const qsrCategoryId = await ensureCategory("Quick Service Restaurant", foodIndustryId, "🍔");
    const gymCategoryId = await ensureCategory("Fitness Centers", fitnessIndustryId, "🏋️");
    const itCategoryId = await ensureCategory("IT Support", techIndustryId, "🛠️");

    // Seed owner user for the sample brands.
    const ownerUserId = await ctx.db.insert("users", {
      fullName: "Sample Brand Owner",
      email: "sample-owner@franchiseen.com",
      createdAt: now,
      updatedAt: now,
    });

    const brands = [
      {
        name: "Urban Bites Cafe",
        slug: "urban-bites-cafe",
        description: "A modern quick-service cafe serving fresh, healthy bites.",
        industry: "Food & Beverage",
        category: "Quick Service Restaurant",
        categoryId: qsrCategoryId,
        franchiseSlug: "urban-bites-cafe-01",
        businessName: "Urban Bites Cafe - Downtown Dubai",
        city: "Dubai",
        state: "Dubai",
        country: "United Arab Emirates",
        coordinates: { lat: 25.2048, lng: 55.2708 },
        sqft: 1200,
        totalInvestment: 75000,
        sharePrice: 1,
        franchiseFee: 15000,
        setupCost: 35000,
        workingCapital: 25000,
        stage: "funding" as const,
      },
      {
        name: "FitZone Gym",
        slug: "fitzone-gym",
        description: "Boutique fitness studio offering strength and conditioning classes.",
        industry: "Health & Fitness",
        category: "Fitness Centers",
        categoryId: gymCategoryId,
        franchiseSlug: "fitzone-gym-01",
        businessName: "FitZone Gym - Business Bay",
        city: "Dubai",
        state: "Dubai",
        country: "United Arab Emirates",
        coordinates: { lat: 25.1857, lng: 55.2611 },
        sqft: 3500,
        totalInvestment: 150000,
        sharePrice: 1,
        franchiseFee: 25000,
        setupCost: 90000,
        workingCapital: 35000,
        stage: "launching" as const,
      },
      {
        name: "TechFix Repair",
        slug: "techfix-repair",
        description: "Same-day electronics and phone repair services.",
        industry: "Technology",
        category: "IT Support",
        categoryId: itCategoryId,
        franchiseSlug: "techfix-repair-01",
        businessName: "TechFix Repair - Al Reem Island",
        city: "Abu Dhabi",
        state: "Abu Dhabi",
        country: "United Arab Emirates",
        coordinates: { lat: 24.4539, lng: 54.3773 },
        sqft: 600,
        totalInvestment: 40000,
        sharePrice: 1,
        franchiseFee: 8000,
        setupCost: 18000,
        workingCapital: 14000,
        stage: "ongoing" as const,
      },
    ];

    const createdFranchiseIds = [];

    for (const brand of brands) {
      const franchiserId = await ctx.db.insert("franchiser", {
        ownerUserId,
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        industry: brand.industry,
        category: brand.category,
        interiorImages: [],
        royaltyPercentage: 5,
        status: "approved",
        createdAt: now,
        updatedAt: now,
      });

      const locationId = await ctx.db.insert("franchiserLocations", {
        franchiserId,
        country: brand.country,
        state: brand.state,
        city: brand.city,
        isNationwide: false,
        registrationCertificate: "SAMPLE-CERT",
        minArea: brand.sqft,
        franchiseFee: brand.franchiseFee,
        setupCost: brand.setupCost,
        workingCapital: brand.workingCapital,
        status: "active",
        createdAt: now,
      });

      const investmentId = await ctx.db.insert("investments", {
        totalInvestment: brand.totalInvestment,
        totalInvested: 0,
        sharesIssued: brand.totalInvestment / brand.sharePrice,
        sharesPurchased: 0,
        sharePrice: brand.sharePrice,
        franchiseFee: brand.franchiseFee,
        setupCost: brand.setupCost,
        workingCapital: brand.workingCapital,
        minimumInvestment: 1,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });

      const franchiseId = await ctx.db.insert("franchises", {
        franchiserId,
        franchiseeId: "sample-franchisee",
        locationId,
        franchiseSlug: brand.franchiseSlug,
        businessName: brand.businessName,
        address: `${brand.businessName}, ${brand.city}, ${brand.country}`,
        location: {
          city: brand.city,
          state: brand.state,
          country: brand.country,
          coordinates: brand.coordinates,
        },
        sqft: brand.sqft,
        isOwned: false,
        franchiseeContact: {
          name: "Sample Franchisee",
          phone: "+971500000000",
          email: "sample-franchisee@franchiseen.com",
        },
        investmentId,
        status: "approved",
        stage: brand.stage,
        createdAt: now,
        updatedAt: now,
      });

      // Investment row references the franchise back; patch it in.
      await ctx.db.patch(investmentId, { franchiseId });

      createdFranchiseIds.push(franchiseId);
    }

    return {
      success: true,
      message: `Seeded ${createdFranchiseIds.length} sample franchises`,
      franchiseIds: createdFranchiseIds,
    };
  },
});
