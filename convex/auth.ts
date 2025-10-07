import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const storeOTP = mutation({
  args: { 
    email: v.string(),
    code: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, { email, code, expiresAt }) => {
    await ctx.db.insert("otpCodes", {
      email,
      code,
      expiresAt,
      createdAt: Date.now(),
    });
  },
});

export const verifyOTP = mutation({
  args: { email: v.string(), code: v.string(), hashedCode: v.string() },
  handler: async (ctx, { email, code, hashedCode }) => {
    const otpRecord = await ctx.db
      .query("otpCodes")
      .withIndex("by_email", (q) => q.eq("email", email))
      .filter((q) => q.eq(q.field("code"), hashedCode))
      .first();

    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
      throw new Error("Invalid or expired OTP");
    }

    // Delete the used OTP
    await ctx.db.delete(otpRecord._id);

    // Check if user exists
    let existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    // If user doesn't exist, create them (this is a signup flow)
    if (!existingUser) {
      const userId = await ctx.db.insert("users", {
        email,
      });
      existingUser = { _id: userId, _creationTime: Date.now(), email };
    }

    // At this point, existingUser is guaranteed to exist
    return { success: true, userId: existingUser!._id };
  },
});

export const signOut = mutation({
  args: {},
  handler: async (ctx) => {
    // Simple sign out - in production, invalidate session tokens
    return { success: true };
  },
});

