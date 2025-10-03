// In convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  franchiser: defineTable({
    ownerWalletAddress: v.string(), // User's wallet (who owns/manages the brand)
    brandWalletAddress: v.string(), // Brand's wallet (for operations)
    brandWalletSecretKey: v.optional(v.string()), // Encrypted secret key for brand wallet
    logoUrl: v.optional(v.id("_storage")),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    industry: v.string(),
    category: v.string(),
    website: v.optional(v.string()),
    interiorImages: v.array(v.id("_storage")),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_ownerWallet", ["ownerWalletAddress"]).index("by_brandWallet", ["brandWalletAddress"]),

  franchiserLocations: defineTable({
    franchiserId: v.id("franchiser"),
    country: v.string(),
    isNationwide: v.boolean(),
    city: v.optional(v.string()),
    registrationCertificate: v.string(),
    minArea: v.number(),
    franchiseFee: v.number(),
    setupCost: v.number(),
    workingCapital: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("inactive")
    ),
    createdAt: v.number(),
  }).index("by_franchiser", ["franchiserId"]),

  franchiserProducts: defineTable({
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
    createdAt: v.number(),
  }).index("by_franchiser", ["franchiserId"]),

  files: defineTable({
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    uploadedAt: v.number(),
  }),

  // Master data tables
  countries: defineTable({
    name: v.string(),
    code: v.string(), // ISO country code (e.g., "AE", "US", "GB")
    flag: v.optional(v.string()), // Flag emoji or URL
    currency: v.optional(v.string()), // Currency code (e.g., "AED", "USD", "GBP")
    timezone: v.optional(v.string()), // Timezone (e.g., "Asia/Dubai", "America/New_York")
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_code", ["code"]).index("by_active", ["isActive"]),

  cities: defineTable({
    name: v.string(),
    countryId: v.id("countries"),
    countryCode: v.string(), // For easier querying
    state: v.optional(v.string()), // State/Province
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    population: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_country", ["countryId"]).index("by_countryCode", ["countryCode"]).index("by_active", ["isActive"]),

  industries: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()), // Icon name or URL
    isActive: v.boolean(),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_active", ["isActive"]).index("by_sortOrder", ["sortOrder"]),

  categories: defineTable({
    name: v.string(),
    industryId: v.id("industries"),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_industry", ["industryId"]).index("by_active", ["isActive"]).index("by_sortOrder", ["sortOrder"]),

  productCategories: defineTable({
    name: v.string(),
    categoryId: v.id("categories"),
    industryId: v.id("industries"), // For easier querying
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_category", ["categoryId"]).index("by_industry", ["industryId"]).index("by_active", ["isActive"]).index("by_sortOrder", ["sortOrder"]),

  // Franchise tables
  franchises: defineTable({
    franchiserId: v.id("franchiser"),
    franchiseeId: v.string(), // Franchisee's wallet address
    locationId: v.id("franchiserLocations"),
    franchiseSlug: v.string(), // e.g., "nike-01", "nike-02"
    businessName: v.string(),
    address: v.string(), // Full address string for display
    // Detailed location breakdown
    location: v.object({
      area: v.optional(v.string()), // Area/Neighborhood
      city: v.string(),
      state: v.string(),
      country: v.string(),
      pincode: v.optional(v.string()), // Postal/ZIP code
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    }),
    buildingName: v.optional(v.string()),
    doorNumber: v.optional(v.string()),
    sqft: v.number(),
    isOwned: v.boolean(),
    landlordContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      email: v.string(),
    })),
    franchiseeContact: v.object({
      name: v.string(),
      phone: v.string(),
      email: v.string(),
    }),
    investmentId: v.id("investments"), // Reference to investment table
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("active"),
      v.literal("suspended"),
      v.literal("terminated")
    ),
    stage: v.union(
      v.literal("funding"),
      v.literal("launching"),
      v.literal("ongoing"),
      v.literal("closed")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchiser", ["franchiserId"]).index("by_franchisee", ["franchiseeId"]).index("by_slug", ["franchiseSlug"]).index("by_stage", ["stage"]).index("by_investment", ["investmentId"]).index("by_location_city", ["location.city"]).index("by_location_state", ["location.state"]).index("by_location_country", ["location.country"]),

  // Investment table
  investments: defineTable({
    franchiseId: v.optional(v.id("franchises")),
    totalInvestment: v.number(), // Total investment required
    totalInvested: v.number(), // Amount invested so far
    sharesIssued: v.number(), // Total shares issued
    sharesPurchased: v.number(), // Shares purchased by investors
    sharePrice: v.number(), // Price per share
    franchiseFee: v.number(), // Initial franchise fee
    setupCost: v.number(), // Setup and equipment costs
    workingCapital: v.number(), // Working capital requirement
    minimumInvestment: v.number(), // Minimum investment per investor
    maximumInvestment: v.optional(v.number()), // Maximum investment per investor
    expectedReturn: v.optional(v.number()), // Expected return rate
    investmentStartDate: v.optional(v.number()), // When investment period starts
    investmentEndDate: v.optional(v.number()), // When investment period ends
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchise", ["franchiseId"]).index("by_status", ["status"]),

  franchiseShares: defineTable({
    franchiseId: v.id("franchises"),
    investorId: v.string(), // Investor's wallet address
    sharesPurchased: v.number(),
    sharePrice: v.number(),
    totalAmount: v.number(),
    transactionHash: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("failed")
    ),
    purchasedAt: v.number(),
    createdAt: v.number(),
  }).index("by_franchise", ["franchiseId"]).index("by_investor", ["investorId"]).index("by_status", ["status"]),

  invoices: defineTable({
    franchiseId: v.id("franchises"),
    investorId: v.string(), // Investor's wallet address
    invoiceNumber: v.string(),
    amount: v.number(),
    currency: v.string(),
    description: v.string(),
    items: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    dueDate: v.number(),
    paidAt: v.optional(v.number()),
    transactionHash: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchise", ["franchiseId"]).index("by_investor", ["investorId"]).index("by_status", ["status"]).index("by_invoiceNumber", ["invoiceNumber"]),

  // Admin Users Management
  adminUsers: defineTable({
    walletAddress: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.id("_storage")),
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    ),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_walletAddress", ["walletAddress"]),

  // Team Management with Department Access
  adminTeam: defineTable({
    userId: v.id("adminUsers"),
    name: v.string(),
    email: v.string(),
    avatar: v.optional(v.id("_storage")),
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member")
    ),
    departments: v.array(v.union(
      v.literal("management"),
      v.literal("operations"),
      v.literal("finance"),
      v.literal("people"),
      v.literal("marketing"),
      v.literal("sales"),
      v.literal("support"),
      v.literal("software")
    )),
    permissions: v.array(v.string()), // Additional specific permissions
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    ),
    invitedBy: v.optional(v.id("adminUsers")),
    lastLoginAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // AI Chat Messages
  aiChatMessages: defineTable({
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    userId: v.string(),
    timestamp: v.number(),
  }).index("by_userId", ["userId"]),

  // Property Management
  properties: defineTable({
    // Basic Property Information
    address: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    buildingName: v.string(),
    doorNumber: v.string(),
    sqft: v.number(),
    costPerSqft: v.number(),
    
    // Property Details
    propertyType: v.union(
      v.literal("commercial"),
      v.literal("retail"),
      v.literal("office"),
      v.literal("warehouse"),
      v.literal("mixed_use")
    ),
    floor: v.optional(v.number()),
    parkingSpaces: v.optional(v.number()),
    amenities: v.array(v.string()), // e.g., ["AC", "Parking", "Security"]
    images: v.array(v.id("_storage")),
    
    // Owner/Landlord Information
    landlordContact: v.object({
      name: v.string(),
      phone: v.string(),
      email: v.string(),
      company: v.optional(v.string()),
    }),
    
    // Property Status and Stages
    stage: v.union(
      v.literal("listing"), // Listing empty properties
      v.literal("requested"), // Requested when creating franchise
      v.literal("blocked"), // Blocked during fundraising
      v.literal("rented"), // Property rented/leased by franchise
      v.literal("sold") // Property sold or franchise closed
    ),
    
    // Associated Franchise Information
    franchiseId: v.optional(v.id("franchises")),
    franchiserId: v.optional(v.id("franchiser")),
    
    // Verification and Approval
    isVerified: v.boolean(),
    verificationNotes: v.optional(v.string()),
    verifiedBy: v.optional(v.string()), // Admin user ID
    verifiedAt: v.optional(v.number()),
    
    // Contact and Communication History
    contactHistory: v.array(v.object({
      date: v.number(),
      type: v.union(
        v.literal("call"),
        v.literal("email"),
        v.literal("meeting"),
        v.literal("inspection")
      ),
      notes: v.string(),
      contactedBy: v.string(), // Admin user ID
      outcome: v.optional(v.string()),
    })),
    
    // Lease/Rental Information (when applicable)
    leaseTerms: v.optional(v.object({
      startDate: v.number(),
      endDate: v.number(),
      monthlyRent: v.number(),
      securityDeposit: v.number(),
      maintenanceResponsibility: v.string(),
      renewalTerms: v.optional(v.string()),
    })),
    
    // Availability
    isAvailable: v.boolean(),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    
    // Admin Assignment
    assignedTo: v.optional(v.string()), // Admin user ID responsible
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_stage", ["stage"])
    .index("by_franchise", ["franchiseId"])
    .index("by_franchiser", ["franchiserId"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_available", ["isAvailable"])
    .index("by_verified", ["isVerified"])
    .index("by_createdAt", ["createdAt"]),

  // Franchise Wallets
  franchiseWallets: defineTable({
    franchiseId: v.id("franchises"),
    franchiserId: v.id("franchiser"),
    walletAddress: v.string(),
    balance: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchise", ["franchiseId"])
    .index("by_franchiser", ["franchiserId"])
    .index("by_status", ["status"]),

  // Franchise Transactions
  franchiseTransactions: defineTable({
    franchiseId: v.id("franchises"),
    walletId: v.id("franchiseWallets"),
    type: v.union(
      v.literal("initial_funding"),
      v.literal("expense"),
      v.literal("revenue"),
      v.literal("transfer"),
      v.literal("refund")
    ),
    amount: v.number(),
    description: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    transactionHash: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_franchise", ["franchiseId"])
    .index("by_wallet", ["walletId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Franchise Setup Management
  franchiseSetup: defineTable({
    franchiseId: v.id("franchises"),
    franchiserId: v.id("franchiser"),
    projectName: v.string(),
    franchiseeName: v.string(),
    location: v.string(),
    startDate: v.number(),
    targetLaunchDate: v.number(),
    status: v.union(
      v.literal("not_started"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("delayed")
    ),
    progress: v.number(), // 0-100
    investmentAmount: v.number(),
    investmentReceived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchise", ["franchiseId"])
    .index("by_franchiser", ["franchiserId"])
    .index("by_status", ["status"]),

  // Leads management
  leads: defineTable({
    // Basic Information
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    
    // Lead Details
    source: v.string(), // e.g., "franchisebazar.com", "website", "referral", "cold_call"
    status: v.union(
      v.literal("prospects"),
      v.literal("started"),
      v.literal("contacted"),
      v.literal("meeting"),
      v.literal("onboarded"),
      v.literal("rejected")
    ),
    
    // Business Information
    industry: v.optional(v.string()),
    businessType: v.optional(v.string()),
    investmentRange: v.optional(v.string()),
    preferredLocation: v.optional(v.string()),
    timeline: v.optional(v.string()),
    
    // Notes and Communication
    notes: v.optional(v.string()),
    lastContactDate: v.optional(v.number()),
    nextFollowUpDate: v.optional(v.number()),
    
    // Assignment
    assignedTo: v.optional(v.string()), // Admin user ID
    assignedBy: v.optional(v.string()), // Admin user ID who assigned
    
    // Import Information
    importedFrom: v.optional(v.string()), // Source URL or identifier
    importBatchId: v.optional(v.string()), // For tracking import batches
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActivityAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_source", ["source"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_createdAt", ["createdAt"]),
});