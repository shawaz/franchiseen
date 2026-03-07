import { query } from "./_generated/server"
import { v } from "convex/values"

// Get approved brands for the marketplace home feed, grouped by category
export const getMarketplaceBrands = query({
  args: {},
  handler: async (ctx) => {
    const brands = await ctx.db
      .query("franchiser")
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect()

    // Get all categories for name resolution
    const allCategories = await ctx.db.query("categories").collect()
    const categoryMap = new Map(allCategories.map((cat) => [cat._id, cat.name]))

    // Resolve logos and enrich with counts
    const enrichedBrands = await Promise.all(
      brands.map(async (brand) => {
        const logoUrl = brand.logoUrl ? await ctx.storage.getUrl(brand.logoUrl) : null

        const locations = await ctx.db
          .query("franchiserLocations")
          .withIndex("by_franchiser", (q) => q.eq("franchiserId", brand._id))
          .collect()

        // Get minimum franchise fee from locations
        const minFranchiseFee =
          locations.length > 0 ? Math.min(...locations.map((l) => l.franchiseFee)) : 0

        return {
          _id: brand._id,
          name: brand.name,
          slug: brand.slug,
          description: brand.description,
          category: brand.category,
          categoryName: categoryMap.get(brand.category as any) || brand.category,
          industry: brand.industry,
          resolvedLogoUrl: logoUrl,
          locationCount: locations.length,
          minFranchiseFee,
          type: brand.type,
          royaltyPercentage: brand.royaltyPercentage,
          estimatedMonthlyRevenue: brand.estimatedMonthlyRevenue,
        }
      }),
    )

    // Group by category name
    const grouped: Record<string, typeof enrichedBrands> = {}
    for (const brand of enrichedBrands) {
      const cat = brand.categoryName
      if (!grouped[cat]) grouped[cat] = []
      grouped[cat].push(brand)
    }

    return grouped
  },
})

// Get a flat list of all approved brands (for search)
export const getMarketplaceBrandsList = query({
  args: {
    search: v.optional(v.string()),
  },
  handler: async (ctx, { search }) => {
    let brands = await ctx.db
      .query("franchiser")
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect()

    if (search) {
      const term = search.toLowerCase()
      brands = brands.filter(
        (b) => b.name.toLowerCase().includes(term) || b.description.toLowerCase().includes(term),
      )
    }

    return Promise.all(
      brands.map(async (brand) => {
        const logoUrl = brand.logoUrl ? await ctx.storage.getUrl(brand.logoUrl) : null
        return {
          _id: brand._id,
          name: brand.name,
          slug: brand.slug,
          description: brand.description,
          category: brand.category,
          resolvedLogoUrl: logoUrl,
        }
      }),
    )
  },
})

// Get user's deals/franchises with brand and stage info
export const getMyDeals = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId)
    if (!user) return []

    // Get franchises where user is franchisee (by wallet) or applications by userId
    const applications = await ctx.db
      .query("franchiseApplications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect()

    // Get franchise data for each application
    const deals = await Promise.all(
      applications.map(async (app) => {
        let brand = null
        let franchise = null
        let investment = null

        if (app.franchiserId) {
          brand = await ctx.db.get(app.franchiserId)
        }

        if (app.franchiseId) {
          franchise = await ctx.db.get(app.franchiseId)
          if (franchise) {
            investment = await ctx.db
              .query("investments")
              .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise!._id))
              .first()
          }
        }

        const logoUrl = brand?.logoUrl ? await ctx.storage.getUrl(brand.logoUrl) : null

        return {
          applicationId: app._id,
          status: app.status,
          applicantName: app.applicantName,
          createdAt: app.createdAt,
          brand: brand
            ? {
                _id: brand._id,
                name: brand.name,
                resolvedLogoUrl: logoUrl,
              }
            : null,
          franchise: franchise
            ? {
                _id: franchise._id,
                businessName: franchise.businessName,
                stage: franchise.stage,
                status: franchise.status,
              }
            : null,
          investment: investment
            ? {
                totalInvestment: investment.totalInvestment,
                totalInvested: investment.totalInvested,
                sharePrice: investment.sharePrice,
              }
            : null,
        }
      }),
    )

    return deals
  },
})

// Get full brand detail for the brand detail screen
export const getBrandDetail = query({
  args: { franchiserId: v.id("franchiser") },
  handler: async (ctx, { franchiserId }) => {
    const brand = await ctx.db.get(franchiserId)
    if (!brand) return null

    // Resolve category name
    const allCategories = await ctx.db.query("categories").collect()
    const categoryMap = new Map(allCategories.map((cat) => [cat._id, cat.name]))

    // Resolve logo URL
    const logoUrl = brand.logoUrl ? await ctx.storage.getUrl(brand.logoUrl) : null

    // Resolve interior images
    const interiorUrls = await Promise.all(
      (brand.interiorImages || []).map((imgId) => ctx.storage.getUrl(imgId)),
    )

    // Get active locations/outlets
    const locations = await ctx.db
      .query("franchiserLocations")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchiserId))
      .collect()

    // Get active products
    const rawProducts = await ctx.db
      .query("franchiserProducts")
      .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchiserId))
      .filter((q) => q.neq(q.field("status"), "archived"))
      .collect()

    const products = await Promise.all(
      rawProducts.map(async (product) => {
        const imageUrls = await Promise.all(
          (product.images || []).map((imgId) => ctx.storage.getUrl(imgId)),
        )
        return {
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          cost: product.cost,
          category: product.category,
          status: product.status,
          resolvedImageUrls: imageUrls.filter(Boolean) as string[],
        }
      }),
    )

    const activeLocs = locations.filter((l) => l.status === "active")
    const minFranchiseFee =
      activeLocs.length > 0 ? Math.min(...activeLocs.map((l) => l.franchiseFee)) : null

    return {
      _id: brand._id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      industry: brand.industry,
      category: brand.category,
      categoryName: categoryMap.get(brand.category as any) || brand.category,
      website: brand.website,
      type: brand.type,
      royaltyPercentage: brand.royaltyPercentage,
      estimatedMonthlyRevenue: brand.estimatedMonthlyRevenue,
      setupBy: brand.setupBy,
      resolvedLogoUrl: logoUrl,
      resolvedInteriorUrls: interiorUrls.filter(Boolean) as string[],
      locations: locations.map((l) => ({
        _id: l._id,
        country: l.country,
        state: l.state,
        city: l.city,
        area: l.area,
        isNationwide: l.isNationwide,
        minArea: l.minArea,
        franchiseFee: l.franchiseFee,
        setupCost: l.setupCost,
        workingCapital: l.workingCapital,
        status: l.status,
      })),
      products,
      locationCount: locations.length,
      productCount: products.length,
      minFranchiseFee,
    }
  },
})

// Get deal detail for the deal detail screen
export const getDealDetail = query({
  args: { applicationId: v.id("franchiseApplications") },
  handler: async (ctx, { applicationId }) => {
    const application = await ctx.db.get(applicationId)
    if (!application) return null

    let brand = null
    let franchise = null
    let investment = null

    if (application.franchiserId) {
      brand = await ctx.db.get(application.franchiserId)
    }

    if (application.franchiseId) {
      franchise = await ctx.db.get(application.franchiseId)
      if (franchise) {
        investment = await ctx.db
          .query("investments")
          .withIndex("by_franchise", (q) => q.eq("franchiseId", franchise!._id))
          .first()
      }
    }

    const logoUrl = brand?.logoUrl ? await ctx.storage.getUrl(brand.logoUrl) : null

    // Map stage to progress value
    const stageProgress: Record<string, number> = {
      funding: 0.25,
      launching: 0.5,
      ongoing: 0.75,
      closed: 1.0,
    }

    const progress = franchise?.stage ? stageProgress[franchise.stage] ?? 0.25 : 0.25

    return {
      applicationId: application._id,
      status: application.status,
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      applicantPhone: application.applicantPhone,
      message: application.message,
      createdAt: application.createdAt,
      brand: brand
        ? {
            _id: brand._id,
            name: brand.name,
            resolvedLogoUrl: logoUrl,
            industry: brand.industry,
          }
        : null,
      franchise: franchise
        ? {
            _id: franchise._id,
            businessName: franchise.businessName,
            stage: franchise.stage,
            status: franchise.status,
            address: franchise.address,
            location: franchise.location,
            sqft: franchise.sqft,
          }
        : null,
      investment: investment
        ? {
            _id: investment._id,
            totalInvestment: investment.totalInvestment,
            totalInvested: investment.totalInvested,
            franchiseFee: investment.franchiseFee,
            setupCost: investment.setupCost,
            workingCapital: investment.workingCapital,
            sharePrice: investment.sharePrice,
            sharesIssued: investment.sharesIssued,
            sharesPurchased: investment.sharesPurchased,
            status: investment.status,
          }
        : null,
      progress,
    }
  },
})

// Get brands owned by a user (for profile switcher)
export const getMyBrands = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const brands = await ctx.db
      .query("franchiser")
      .withIndex("by_ownerUser", (q) => q.eq("ownerUserId", userId))
      .collect()

    return Promise.all(
      brands.map(async (brand) => {
        const logoUrl = brand.logoUrl ? await ctx.storage.getUrl(brand.logoUrl) : null

        const allCategories = await ctx.db.query("categories").collect()
        const categoryMap = new Map(allCategories.map((cat) => [cat._id, cat.name]))

        return {
          _id: brand._id,
          name: brand.name,
          slug: brand.slug,
          status: brand.status,
          resolvedLogoUrl: logoUrl,
          category: brand.category,
          categoryName: categoryMap.get(brand.category as any) || brand.category,
          industry: brand.industry,
          createdAt: brand.createdAt,
        }
      }),
    )
  },
})

// Get all active industries with their categories (for brand registration dropdowns)
export const getIndustriesAndCategories = query({
  args: {},
  handler: async (ctx) => {
    const industries = await ctx.db
      .query("industries")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect()

    const categories = await ctx.db
      .query("categories")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect()

    return { industries, categories }
  },
})

// Get user's investment portfolio
export const getMyPortfolio = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    const shares = await ctx.db
      .query("franchiseShares")
      .withIndex("by_investor", (q) => q.eq("investorId", walletAddress))
      .collect()

    const portfolio = await Promise.all(
      shares.map(async (share) => {
        const franchise = await ctx.db.get(share.franchiseId)
        if (!franchise) return null

        const brand = await ctx.db.get(franchise.franchiserId)
        const logoUrl = brand?.logoUrl ? await ctx.storage.getUrl(brand.logoUrl) : null

        return {
          ...share,
          franchise: {
            _id: franchise._id,
            businessName: franchise.businessName,
            stage: franchise.stage,
          },
          brand: brand
            ? {
                _id: brand._id,
                name: brand.name,
                resolvedLogoUrl: logoUrl,
              }
            : null,
        }
      }),
    )

    return portfolio.filter(Boolean)
  },
})
