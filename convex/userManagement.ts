import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get current user profile
export const getCurrentUserProfile = query({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, { email }) => {
    if (!email) {
      return null;
    }

    // Find user by email - now all profile data is in users table
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    return user;
  },
});

// Get user by Privy ID
export const getUserByPrivyId = query({
  args: { privyUserId: v.string() },
  handler: async (ctx, { privyUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_privyUserId", (q) => q.eq("privyUserId", privyUserId))
      .first();

    return user;
  },
});

// Sync Privy user to database (creates or updates)
export const syncPrivyUser = mutation({
  args: {
    privyUserId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    walletAddress: v.optional(v.string()),
  },
  handler: async (ctx, { privyUserId, email, fullName, avatarUrl, walletAddress }) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_privyUserId", (q) => q.eq("privyUserId", privyUserId))
      .first();

    const now = Date.now();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: email || existingUser.email,
        fullName: fullName || existingUser.fullName,
        avatarUrl: avatarUrl || existingUser.avatarUrl,
        walletAddress: walletAddress || existingUser.walletAddress,
        updatedAt: now,
      });
      return existingUser._id;
    } else {
      // Create new user with Privy data
      const userId = await ctx.db.insert("users", {
        privyUserId,
        email,
        fullName,
        avatarUrl,
        walletAddress,
        createdAt: now,
        updatedAt: now,
      });
      return userId;
    }
  },
});

// Update user fullName
export const updateUserFullName = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.string(),
  },
  handler: async (ctx, { userId, fullName }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      fullName,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Update user wallet address
export const updateUserWalletAddress = mutation({
  args: {
    userId: v.id("users"),
    walletAddress: v.string(),
  },
  handler: async (ctx, { userId, walletAddress }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(userId, {
      walletAddress,
      updatedAt: Date.now(),
    });

    return userId;
  },
});

// Get user by Clerk ID (for mobile app)
// Uses email-based lookup until schema with by_clerkUserId index is deployed
export const getUserByClerkId = query({
  args: { clerkUserId: v.string(), email: v.optional(v.string()) },
  handler: async (ctx, { email }) => {
    if (!email) return null
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first()
  },
})

// Sync Clerk user to database (creates or updates by email)
// Uses only existing deployed indexes (by_email) until clerkUserId schema is deployed
export const syncClerkUser = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, { email, fullName, avatarUrl }) => {
    const now = Date.now()

    // Look up by email using the existing by_email index
    if (email) {
      const existingByEmail = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first()

      if (existingByEmail) {
        await ctx.db.patch(existingByEmail._id, {
          fullName: fullName || existingByEmail.fullName,
          avatarUrl: avatarUrl || existingByEmail.avatarUrl,
          updatedAt: now,
        })
        return existingByEmail._id
      }
    }

    // Create new user
    return await ctx.db.insert("users", {
      email,
      fullName,
      avatarUrl,
      createdAt: now,
      updatedAt: now,
    })
  },
})

// Get user by wallet address (for existing functionality)
export const getUserByWalletAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", walletAddress))
      .first();

    return user;
  },
});


// Get all user wallets with their transaction data (for admin view)
export const getAllUserWallets = query({
  args: {},
  handler: async (ctx) => {
    // Get all users with wallet addresses
    const allUsers = await ctx.db
      .query("users")
      .collect();

    console.log('getAllUserWallets: Total users found:', allUsers.length);

    // Filter users with valid wallet addresses
    const profiles = allUsers.filter(user =>
      user.walletAddress &&
      user.walletAddress !== null &&
      user.walletAddress !== ""
    );

    console.log('getAllUserWallets: Profiles with wallets:', profiles.length);
    console.log('getAllUserWallets: Wallet addresses:', profiles.map(p => p.walletAddress));

    // Get user data for each user with wallet
    const walletsWithUserData = await Promise.all(
      profiles.map(async (user) => {
        // Get user's franchise shares
        const shares = await ctx.db
          .query("franchiseShares")
          .filter((q) => q.eq(q.field("investorId"), user.walletAddress))
          .collect();

        // Calculate totals
        const totalInvested = shares.reduce((sum, share) => sum + share.totalAmount, 0);
        const totalShares = shares.reduce((sum, share) => sum + share.sharesPurchased, 0);

        // Get franchise data for earnings calculation (simplified)
        const totalEarnings = 0; // This would need to be calculated from actual earnings data

        // Get last activity from shares
        const lastActivity = shares.length > 0
          ? Math.max(...shares.map(share => share.purchasedAt))
          : (user.createdAt || Date.now());

        return {
          id: user._id,
          address: user.walletAddress!,
          balance: 0, // This would need to be fetched from blockchain or stored separately
          totalInvested,
          totalEarnings,
          transactionCount: shares.length,
          lastActivity: new Date(lastActivity).toISOString(),
          status: user.walletAddress ? 'active' : 'inactive' as 'active' | 'inactive' | 'suspended',
          user: {
            name: user.fullName || user.email || 'Unknown',
            email: user.email || '',
            joinedDate: new Date(user.createdAt || Date.now()).toISOString()
          },
          shares // Include shares for detailed view
        };
      })
    );

    // Filter out null entries
    return walletsWithUserData.filter(Boolean);
  },
});


