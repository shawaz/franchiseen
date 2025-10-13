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

    // Find user by email - now all profile data is in users table
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    return user;
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

    // Get user
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if profile data already exists
    if (user.walletAddress) {
      throw new Error("Profile already exists");
    }

    // Generate user-specific key for encryption
    const userKey = generateUserKey(userId, user.email || "", Date.now());
    
    // Generate Solana wallet with encrypted private key
    const walletData = generateWalletWithEncryptedPrivateKey(userKey);
    const walletAddress = walletData.publicKey;

    // Update user record with profile data
    await ctx.db.patch(userId, {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      dateOfBirth,
      country,
      walletAddress,
      privateKey: walletData.encryptedPrivateKey,
      isWalletGenerated: true,
      updatedAt: Date.now(),
    });

    // Convert private key bytes to base58 for display
    const privateKeyBase58 = bs58.encode(walletData.privateKeyBytes);
    
    return { 
      profileId: userId, 
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

    const user = await ctx.db.get(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Update user with profile data
    const updates: any = {
      updatedAt: Date.now(),
    };
    
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (firstName || lastName) {
      updates.fullName = `${firstName || user.firstName || ''} ${lastName || user.lastName || ''}`.trim();
    }
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (country) updates.country = country;
    if (avatar) updates.avatarUrl = avatar;

    await ctx.db.patch(userId, updates);

    return userId;
  },
});

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

// Get user's private key (decrypted)
export const getUserPrivateKey = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Get user
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.privateKey) {
      throw new Error("User private key not found");
    }

    // Generate the same user key used for encryption
    const userKey = generateUserKey(userId, user.email || "", user.createdAt || Date.now());
    
    // Decrypt the private key
    const decryptedPrivateKey = decryptPrivateKey(user.privateKey, userKey);
    
    return {
      privateKey: Array.from(decryptedPrivateKey), // Convert to regular array for JSON response
      publicKey: user.walletAddress
    };
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
          status: user.isWalletGenerated ? 'active' : 'inactive' as 'active' | 'inactive' | 'suspended',
          user: {
            name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
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


