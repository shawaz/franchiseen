// In convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth tables
  ...authTables,

  // OTP codes for email verification
  otpCodes: defineTable({
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
  
  // User profile table with additional fields
  userProfiles: defineTable({
    userId: v.id("users"),
        email: v.string(),
        firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.optional(v.number()),
    country: v.optional(v.string()), // User's country
    avatar: v.optional(v.id("_storage")),
        walletAddress: v.optional(v.string()),
        privateKey: v.optional(v.string()), // Encrypted private key
        isWalletGenerated: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_email", ["email"])
    .index("by_walletAddress", ["walletAddress"])
    .index("by_country", ["country"]),

  franchiser: defineTable({
    ownerUserId: v.id("userProfiles"), // User's ID (who owns/manages the brand)
    brandWalletAddress: v.string(), // Brand's wallet (for operations)
    logoUrl: v.optional(v.id("_storage")),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    industry: v.string(),
    category: v.string(),
    website: v.optional(v.string()),
    interiorImages: v.array(v.id("_storage")),
    type: v.optional(v.union(
      v.literal("FOCO"), // Franchise Owned Company Operated
      v.literal("FOFO")  // Franchise Owned Franchise Operated
    )), // Added franchise type
    royaltyPercentage: v.optional(v.number()), // Added royalty percentage
    estimatedMonthlyRevenue: v.optional(v.number()), // Added estimated monthly revenue
    setupBy: v.optional(v.union(
      v.literal("DESIGN_INTERIOR_BY_BRAND"),
      v.literal("DESIGN_INTERIOR_BY_FRANCHISEEN"),
      v.literal("DESIGN_BY_BRAND_INTERIOR_BY_FRANCHISEEN")
    )), // Added setup by field
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_ownerUser", ["ownerUserId"]).index("by_brandWallet", ["brandWalletAddress"]),

  franchiserLocations: defineTable({
    franchiserId: v.id("franchiser"),
    country: v.string(),
    state: v.optional(v.string()),
    city: v.optional(v.string()),
    area: v.optional(v.string()),
    isNationwide: v.boolean(),
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
  }).index("by_franchiser", ["franchiserId"]).index("by_country", ["country"]).index("by_state", ["state"]).index("by_city", ["city"]).index("by_area", ["area"]),

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
    // Stock/Inventory fields
    stockQuantity: v.number(), // Current stock quantity
    minStockLevel: v.optional(v.number()), // Minimum stock level for alerts
    maxStockLevel: v.optional(v.number()), // Maximum stock level
    unit: v.optional(v.string()), // Unit of measurement (e.g., "pieces", "kg", "liters")
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
      v.literal("rejected"),
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
      v.literal("failed"),
      v.literal("refunded")
    ),
    purchasedAt: v.number(),
    refundedAt: v.optional(v.number()),
    refundTransactionHash: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_franchise", ["franchiseId"]).index("by_investor", ["investorId"]).index("by_status", ["status"]),

  // SPL Token Management for Franchise Shares
  franchiseTokens: defineTable({
    franchiseId: v.id("franchises"),
    tokenMint: v.string(), // SPL token mint address
    tokenName: v.string(), // e.g., "Nike Dubai Shares"
    tokenSymbol: v.string(), // e.g., "NIKE-DXB"
    tokenDecimals: v.number(), // Usually 6 for shares
    totalSupply: v.number(), // Total tokens minted
    circulatingSupply: v.number(), // Tokens in circulation
    sharePrice: v.number(), // Price per token in USD
    status: v.union(
      v.literal("created"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchise", ["franchiseId"]).index("by_token_mint", ["tokenMint"]).index("by_status", ["status"]),

  // Token Holdings for Investors
  tokenHoldings: defineTable({
    franchiseId: v.id("franchises"),
    tokenMint: v.string(), // SPL token mint address
    investorId: v.string(), // Investor's wallet address
    balance: v.number(), // Current token balance
    totalPurchased: v.number(), // Total tokens ever purchased
    totalSold: v.number(), // Total tokens ever sold
    averagePurchasePrice: v.number(), // Average price paid per token
    lastTransactionAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchise", ["franchiseId"]).index("by_investor", ["investorId"]).index("by_token_mint", ["tokenMint"]).index("by_franchise_investor", ["franchiseId", "investorId"]),

  // Token Transactions (mint, burn, transfer)
  tokenTransactions: defineTable({
    franchiseId: v.id("franchises"),
    tokenMint: v.string(),
    fromInvestorId: v.optional(v.string()), // null for minting
    toInvestorId: v.optional(v.string()), // null for burning
    amount: v.number(),
    transactionType: v.union(
      v.literal("mint"), // New tokens created
      v.literal("burn"), // Tokens destroyed (refunds)
      v.literal("transfer"), // Tokens moved between wallets
      v.literal("purchase"), // Tokens purchased with fiat/crypto
      v.literal("sale") // Tokens sold
    ),
    pricePerToken: v.optional(v.number()), // Price at time of transaction
    totalValue: v.optional(v.number()), // amount × pricePerToken
    solanaTransactionHash: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  }).index("by_franchise", ["franchiseId"]).index("by_token_mint", ["tokenMint"]).index("by_investor", ["toInvestorId"]).index("by_type", ["transactionType"]).index("by_status", ["status"]),

  // Franchise Wallets - Each franchise gets its own Solana wallet
  franchiseWallets: defineTable({
    franchiseId: v.id("franchises"),
    walletAddress: v.string(), // Solana wallet address (public key)
    walletSecretKey: v.optional(v.string()), // Encrypted secret key for signing transactions
    walletName: v.string(), // e.g., "Nike Dubai Franchise Wallet"
    balance: v.number(), // Current SOL balance
    usdBalance: v.number(), // USD equivalent
    totalIncome: v.number(), // Total income received
    totalExpenses: v.number(), // Total expenses paid
    totalPayouts: v.number(), // Total payouts to investors
    totalRoyalties: v.number(), // Total royalties paid to brand
    monthlyRevenue: v.number(), // Current month revenue
    monthlyExpenses: v.number(), // Current month expenses
    transactionCount: v.number(), // Total number of transactions
    lastActivity: v.number(), // Timestamp of last activity
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended"),
      v.literal("maintenance")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchise", ["franchiseId"]).index("by_wallet_address", ["walletAddress"]).index("by_status", ["status"]),

  // Franchise Wallet Transactions
  franchiseWalletTransactions: defineTable({
    franchiseWalletId: v.id("franchiseWallets"),
    franchiseId: v.id("franchises"),
    transactionType: v.union(
      v.literal("income"), // Revenue from sales
      v.literal("expense"), // Operational expenses
      v.literal("payout"), // Payout to investors
      v.literal("royalty"), // Royalty payment to brand
      v.literal("transfer_in"), // Transfer from brand wallet
      v.literal("transfer_out"), // Transfer to brand wallet
      v.literal("funding"), // Initial funding
      v.literal("refund") // Refund to investor
    ),
    amount: v.number(), // Amount in SOL
    usdAmount: v.number(), // USD equivalent at time of transaction
    description: v.string(),
    category: v.optional(v.string()), // e.g., "rent", "utilities", "inventory"
    solanaTransactionHash: v.string(), // Solana transaction hash for explorer
    fromAddress: v.optional(v.string()), // Source wallet address
    toAddress: v.optional(v.string()), // Destination wallet address
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("failed")
    ),
    metadata: v.optional(v.object({
      notes: v.optional(v.string()),
      attachments: v.optional(v.array(v.string())),
      tags: v.optional(v.array(v.string())),
    })),
    createdAt: v.number(),
  }).index("by_franchise_wallet", ["franchiseWalletId"]).index("by_franchise", ["franchiseId"]).index("by_type", ["transactionType"]).index("by_status", ["status"]).index("by_solana_hash", ["solanaTransactionHash"]),

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
    
    // Property Registration Details
    propertyName: v.optional(v.string()),
    propertySubType: v.optional(v.union(
      v.literal("builder"),
      v.literal("agent")
    )),
    ownershipType: v.optional(v.union(
      v.literal("owned"),
      v.literal("rented"),
      v.literal("lease")
    )),
    description: v.optional(v.string()),
    specialNotes: v.optional(v.string()),
    
    // Fundraising and Timeline Information
    fundraisingStartDate: v.optional(v.number()),
    blockagePeriod: v.optional(v.number()), // in days
    isFullyFunded: v.optional(v.boolean()),
    franchiseSetupStart: v.optional(v.number()),
    contractGenerated: v.optional(v.boolean()),
    
    // Penalty System
    penaltyHistory: v.array(v.object({
      date: v.number(),
      type: v.union(
        v.literal("late_update"),
        v.literal("false_availability"),
        v.literal("contract_breach"),
        v.literal("misinformation")
      ),
      amount: v.number(),
      reason: v.string(),
      imposedBy: v.string(), // Admin user ID
      status: v.union(
        v.literal("pending"),
        v.literal("paid"),
        v.literal("waived"),
        v.literal("disputed")
      ),
      notes: v.optional(v.string()),
    })),
    totalPenalties: v.number(),
    unpaidPenalties: v.number(),
    
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_stage", ["stage"])
    .index("by_franchise", ["franchiseId"])
    .index("by_franchiser", ["franchiserId"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_available", ["isAvailable"])
    .index("by_verified", ["isVerified"])
    .index("by_createdAt", ["createdAt"])
    .index("by_ownershipType", ["ownershipType"])
    .index("by_propertySubType", ["propertySubType"]),


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

  // Stock Transfers between warehouse and franchise outlets
  stockTransfers: defineTable({
    franchiseId: v.id("franchises"),
    productId: v.id("franchiserProducts"),
    requestedQuantity: v.number(),
    approvedQuantity: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("completed")),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchiseId", ["franchiseId"])
    .index("by_status", ["status"]),

  // Franchise Expenses
  franchiseExpenses: defineTable({
    franchiseId: v.id("franchises"),
    category: v.string(),
    amount: v.number(),
    description: v.string(),
    receiptUrl: v.optional(v.id("_storage")),
    expenseDate: v.number(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("card"),
      v.literal("wallet"),
      v.literal("transfer"),
      v.literal("bank_transfer")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("cancelled")
    ),
    // Optional fields for additional functionality
    approvedBy: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    isApproved: v.optional(v.boolean()),
    isAutoPaid: v.optional(v.boolean()),
    vendor: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchise", ["franchiseId"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_expenseDate", ["expenseDate"]),

  // Franchise Budget Management
  franchiseBudgets: defineTable({
    franchiseId: v.id("franchises"),
    monthlyBudget: v.number(), // Total monthly budget
    teamSalaries: v.number(), // Total team salary budget
    rent: v.number(), // Monthly rent
    utilities: v.number(), // Monthly utilities
    supplies: v.number(), // Monthly supplies budget
    marketing: v.number(), // Monthly marketing budget
    maintenance: v.number(), // Monthly maintenance budget
    taxes: v.number(), // Monthly tax budget
    insurance: v.number(), // Monthly insurance budget
    otherExpenses: v.number(), // Other monthly expenses
    month: v.number(), // Month (1-12)
    year: v.number(), // Year
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchiseId", ["franchiseId"])
    .index("by_franchise_month_year", ["franchiseId", "month", "year"]),

  // Franchise Team Management
  franchiseTeam: defineTable({
    franchiseId: v.id("franchises"),
    userId: v.id("userProfiles"),
    role: v.union(
      v.literal("manager"), 
      v.literal("cashier"), 
      v.literal("cook"), 
      v.literal("server"), 
      v.literal("cleaner"),
      v.literal("supervisor")
    ),
    salary: v.number(), // Monthly salary
    hourlyRate: v.optional(v.number()), // Hourly rate for hourly employees
    isHourly: v.boolean(), // Whether employee is paid hourly or monthly
    hireDate: v.number(),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("terminated")),
    permissions: v.array(v.string()), // Array of permissions
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchiseId", ["franchiseId"])
    .index("by_userId", ["userId"])
    .index("by_role", ["role"]),

  // Franchise Payouts
  franchisePayouts: defineTable({
    franchiseId: v.id("franchises"),
    franchiserId: v.id("franchiser"),
    period: v.string(), // e.g., "2024-10-08" or "October 2024"
    payoutType: v.union(v.literal("daily"), v.literal("monthly")),
    grossRevenue: v.number(), // Total revenue before any deductions
    royaltyAmount: v.number(), // Amount to brand wallet
    platformFeeAmount: v.number(), // Amount to platform
    netRevenue: v.number(), // After royalty and platform fee
    toTokenHolders: v.number(), // Amount distributed to token holders
    toReserve: v.number(), // Amount added to reserve fund
    reserveBalanceBefore: v.number(), // Reserve balance before payout
    reserveBalanceAfter: v.number(), // Reserve balance after payout
    reservePercentage: v.number(), // Reserve % at time of payout
    distributionRule: v.string(), // e.g., "Critical Reserve (< 25%)"
    totalShares: v.number(), // Total shares at time of payout
    shareholderCount: v.number(), // Number of shareholders
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    processedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_franchise", ["franchiseId"])
    .index("by_franchiser", ["franchiserId"])
    .index("by_status", ["status"]),

  // Shareholder Payouts (new implementation)
  shareholderPayouts: defineTable({
    payoutId: v.id("franchisePayouts"),
    franchiseId: v.id("franchises"),
    investorId: v.string(), // Wallet address
    shares: v.number(), // Number of shares held
    totalShares: v.number(), // Total shares at time of payout
    sharePercentage: v.number(), // Percentage of total shares
    payoutAmount: v.number(), // Amount paid out
    period: v.string(), // Same as payout period
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
  }).index("by_payout", ["payoutId"])
    .index("by_franchise_investor", ["franchiseId", "investorId"])
    .index("by_investor", ["investorId"]),

  // Brand Wallet Transactions
  brandWalletTransactions: defineTable({
    franchiserId: v.id("franchiser"),
    franchiseId: v.optional(v.id("franchises")),
    type: v.union(
      v.literal("franchise_funding_complete"),
      v.literal("franchise_fee"),
      v.literal("setup_cost"),
      v.literal("royalty"), // Added for ongoing royalty payments
      v.literal("revenue"),
      v.literal("expense"),
      v.literal("transfer")
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
  }).index("by_franchiser", ["franchiserId"])
    .index("by_franchise", ["franchiseId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),

  // Company Income (Platform Fees)
  companyIncome: defineTable({
    type: v.union(
      v.literal("platform_fee_share_purchase"),
      v.literal("platform_fee_payout"),
      v.literal("subscription"),
      v.literal("listing_fee"),
      v.literal("other")
    ),
    amount: v.number(),
    description: v.string(),
    franchiseId: v.optional(v.id("franchises")),
    franchiserId: v.optional(v.id("franchiser")),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    ),
    transactionHash: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_type", ["type"])
    .index("by_franchise", ["franchiseId"])
    .index("by_franchiser", ["franchiserId"])
    .index("by_status", ["status"]),

  // Franchise Stage Management
  franchiseStages: defineTable({
    franchiseId: v.id("franchises"),
    franchiserId: v.id("franchiser"),
    currentStage: v.union(
      v.literal("funding"),
      v.literal("launching"),
      v.literal("ongoing"),
      v.literal("closed")
    ),
    subStage: v.optional(v.union(
      v.literal("contacting_property"),
      v.literal("checking_location"),
      v.literal("signing_agreement"),
      v.literal("creating_pda"),
      v.literal("collecting_investments"),
      v.literal("transferring_fees"),
      v.literal("setting_up"),
      v.literal("operational"),
      v.literal("closing")
    )),
    progress: v.number(), // 0-100
    stageStartDate: v.number(),
    estimatedCompletionDate: v.optional(v.number()),
    actualCompletionDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_franchise", ["franchiseId"])
    .index("by_franchiser", ["franchiserId"])
    .index("by_stage", ["currentStage"])
    .index("by_subStage", ["subStage"]),

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