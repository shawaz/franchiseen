import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Get chat history for a user
export const getChatHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    return messages;
  },
});

// Get user context for AI
export const getUserContext = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const adminUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", userId))
      .first();

    if (adminUser) {
      const franchises = await ctx.db.query("franchises").collect();
      const applications = await ctx.db.query("franchiseApplications").collect();
      const properties = await ctx.db.query("properties").collect();

      return {
        role: adminUser.role,
        type: "admin",
        name: adminUser.name,
        stats: {
          totalFranchises: franchises.length,
          pendingApplications: applications.filter(a => a.status === "pending").length,
          activeProperties: properties.filter(p => p.isAvailable).length,
        }
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", userId))
      .first();

    if (user) {
      const franchiser = await ctx.db
        .query("franchiser")
        .withIndex("by_ownerUser", (q) => q.eq("ownerUserId", user._id))
        .first();

      if (franchiser) {
        const franchises = await ctx.db
          .query("franchises")
          .withIndex("by_franchiser", (q) => q.eq("franchiserId", franchiser._id))
          .collect();

        return {
          role: "owner",
          type: "franchiser",
          name: franchiser.name,
          stats: {
            totalLocations: franchises.length,
            industry: franchiser.industry,
          }
        };
      }
    }

    return {
      role: "guest",
      type: "unknown"
    };
  }
});

// Send a message and get AI response
export const sendMessage = action({
  args: {
    content: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { content, userId }): Promise<{ userMessageId: any, aiMessageId: any }> => {
    // Save user message
    const userMessageId = await ctx.runMutation(internal.aiChat.saveUserMessage, {
      content,
      userId,
    });

    const context = await ctx.runQuery(internal.aiChat.getUserContext, { userId });

    let aiResponse = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      aiResponse = "Please set GEMINI_API_KEY environment variable in your Convex dashboard to enable AI.";
    } else {
      try {
        const systemInstruction = `You are an AI assistant for Franchiseen. The user is a ${context.type} with role ${context.role}. Context data: ${JSON.stringify(context.stats || {})}. Use this context to answer their questions specifically. Do not hallucinate data outside of this context. Act confident but concise.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemInstruction }]
            },
            contents: [{ parts: [{ text: content }] }]
          })
        });

        const data = await response.json();

        if (data.error) {
          console.error("Gemini API Error:", data.error);
          aiResponse = "Sorry, I encountered an error communicating with Google Gemini.";
        } else if (data && data.candidates && data.candidates.length > 0) {
          aiResponse = data.candidates[0].content.parts[0].text;
        } else {
          aiResponse = "Sorry, I couldn't generate a response.";
        }
      } catch (error) {
        console.error("Fetch error:", error);
        aiResponse = "Sorry, failed to connect to the AI service.";
      }
    }

    // Save AI response
    const aiMessageId = await ctx.runMutation(internal.aiChat.saveAiMessage, {
      content: aiResponse,
      userId,
    });

    return { userMessageId, aiMessageId };
  },
});

// Clear chat history for a user
export const clearChatHistory = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const messages = await ctx.db
      .query("aiChatMessages")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    return { deletedCount: messages.length };
  },
});

// Save a user message
export const saveUserMessage = internalMutation({
  args: {
    content: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { content, userId }) => {
    return await ctx.db.insert("aiChatMessages", {
      content,
      role: "user",
      userId,
      timestamp: Date.now(),
    });
  },
});

// Save an AI message
export const saveAiMessage = internalMutation({
  args: {
    content: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { content, userId }) => {
    return await ctx.db.insert("aiChatMessages", {
      content,
      role: "assistant",
      userId,
      timestamp: Date.now(),
    });
  },
});
