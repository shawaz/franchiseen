"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import crypto from "crypto";

// Send OTP action (uses Node.js for crypto and email)
export const sendOTP = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Check if user exists before sending OTP
    const existingUser = await ctx.runQuery(api.userManagement.getCurrentUserProfile, { email });
    
    if (!existingUser) {
      throw new Error("Account not found");
    }

    // Generate a simple 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the OTP before storing
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Store OTP temporarily (in production, use proper session management)
    await ctx.runMutation(api.auth.storeOTP, {
      email,
      code: hashedOTP,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Franchiseen <noreply@franchiseen.com>",
        to: [email],
        subject: "Your Franchiseen Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Franchiseen!</h2>
            <p>Your verification code is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return { success: true };
  },
});

// Send OTP for signup (doesn't check if user exists)
export const sendSignupOTP = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Generate a simple 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the OTP before storing
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Store OTP temporarily (in production, use proper session management)
    await ctx.runMutation(api.auth.storeOTP, {
      email,
      code: hashedOTP,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Franchiseen <noreply@franchiseen.com>",
        to: [email],
        subject: "Your Franchiseen Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Franchiseen!</h2>
            <p>Your verification code is:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return { success: true };
  },
});
