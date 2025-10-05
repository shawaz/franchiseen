import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { 
  generateWalletWithEncryptedPrivateKey, 
  generateUserKey,
  decryptPrivateKey,
  recreateKeypairFromEncryptedPrivateKey
} from "../src/lib/crypto";

// Get current user profile
export const getCurrentUserProfile = query({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, { email }) => {
    if (!email) {
      return null;
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    return profile;
  },
});

// Create user profile after signup
export const createUserProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.optional(v.number()),
    country: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { userId, firstName, lastName, dateOfBirth, country, avatar }) => {

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      throw new Error("Profile already exists");
    }

    // Get user email from auth
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate user-specific key for encryption
    const userKey = generateUserKey(userId, user.email || "", Date.now());
    
    // Generate Solana wallet with encrypted private key
    const walletData = generateWalletWithEncryptedPrivateKey(userKey);
    const walletAddress = walletData.publicKey;

    // Create user profile
    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      email: user.email || "",
      firstName,
      lastName,
      dateOfBirth,
      country,
      avatar,
      walletAddress,
      privateKey: walletData.encryptedPrivateKey,
      isWalletGenerated: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Convert private key bytes to base58 for display
    const privateKeyBase58 = bs58.encode(walletData.privateKeyBytes);
    
    return { 
      profileId, 
      walletAddress: walletData.publicKey,
      privateKey: privateKeyBase58 // Return base58-encoded private key for display
    };
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    country: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { userId, firstName, lastName, dateOfBirth, country, avatar }) => {

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Update profile
    await ctx.db.patch(profile._id, {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
      ...(country && { country }),
      ...(avatar && { avatar }),
      updatedAt: Date.now(),
    });

    return profile._id;
  },
});

// Get user by wallet address (for existing functionality)
export const getUserByWalletAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", walletAddress))
      .first();

    return profile;
  },
});

// Get user's private key (decrypted)
export const getUserPrivateKey = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!profile || !profile.privateKey) {
      throw new Error("User profile or private key not found");
    }

    // Get user data for key generation
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate the same user key used for encryption
    const userKey = generateUserKey(userId, user.email || "", profile.createdAt);
    
    // Decrypt the private key
    const decryptedPrivateKey = decryptPrivateKey(profile.privateKey, userKey);
    
    return {
      privateKey: Array.from(decryptedPrivateKey), // Convert to regular array for JSON response
      publicKey: profile.walletAddress
    };
  },
});

// Get all user wallets with their transaction data (for admin view)
export const getAllUserWallets = query({
  args: {},
  handler: async (ctx) => {
    // Get all user profiles first
    const allProfiles = await ctx.db
      .query("userProfiles")
      .collect();
    
    console.log('getAllUserWallets: Total profiles found:', allProfiles.length);
    
    // Filter profiles with valid wallet addresses
    const profiles = allProfiles.filter(profile => 
      profile.walletAddress && 
      profile.walletAddress !== null && 
      profile.walletAddress !== ""
    );
    
    console.log('getAllUserWallets: Profiles with wallets:', profiles.length);
    console.log('getAllUserWallets: Wallet addresses:', profiles.map(p => p.walletAddress));

    // Get user data for each profile
    const walletsWithUserData = await Promise.all(
      profiles.map(async (profile) => {
        const user = await ctx.db.get(profile.userId);
        if (!user) return null;

        // Get user's franchise shares
        const shares = await ctx.db
          .query("franchiseShares")
          .filter((q) => q.eq(q.field("investorId"), profile.walletAddress))
          .collect();

        // Calculate totals
        const totalInvested = shares.reduce((sum, share) => sum + share.totalAmount, 0);
        const totalShares = shares.reduce((sum, share) => sum + share.sharesPurchased, 0);
        
        // Get franchise data for earnings calculation (simplified)
        const totalEarnings = 0; // This would need to be calculated from actual earnings data

        // Get last activity from shares
        const lastActivity = shares.length > 0 
          ? Math.max(...shares.map(share => share.purchasedAt))
          : profile.createdAt;

        return {
          id: profile._id,
          address: profile.walletAddress!,
          balance: 0, // This would need to be fetched from blockchain or stored separately
          totalInvested,
          totalEarnings,
          transactionCount: shares.length,
          lastActivity: new Date(lastActivity).toISOString(),
          status: profile.isWalletGenerated ? 'active' : 'inactive' as 'active' | 'inactive' | 'suspended',
          user: {
            name: `${profile.firstName} ${profile.lastName}`,
            email: profile.email,
            joinedDate: new Date(profile.createdAt).toISOString()
          },
          shares // Include shares for detailed view
        };
      })
    );

    // Filter out null entries
    return walletsWithUserData.filter(Boolean);
  },
});


