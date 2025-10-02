import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all admin users
export const getAllAdminUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("adminUsers")
      .order("desc")
      .collect();
    
    return users;
  },
});

// Get all team members
export const getAllTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    const teamMembers = await ctx.db
      .query("adminTeam")
      .order("desc")
      .collect();
    
    return teamMembers;
  },
});

// Get team member by wallet address
export const getTeamMemberByWallet = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, { walletAddress }) => {
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", walletAddress))
      .first();
    
    if (!user) return null;
    
    const teamMember = await ctx.db
      .query("adminTeam")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
    
    return teamMember;
  },
});

// Create admin user
export const createAdminUser = mutation({
  args: {
    walletAddress: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member")
    ),
  },
  handler: async (ctx, { walletAddress, email, name, role }) => {
    const existingUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", walletAddress))
      .first();
    
    if (existingUser) {
      throw new Error("User already exists");
    }
    
    const userId = await ctx.db.insert("adminUsers", {
      walletAddress,
      email,
      name,
      role,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return userId;
  },
});

// Add team member
export const addTeamMember = mutation({
  args: {
    userId: v.id("adminUsers"),
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
    permissions: v.array(v.string()),
    invitedBy: v.optional(v.id("adminUsers")),
  },
  handler: async (ctx, { userId, departments, permissions, invitedBy }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const existingTeamMember = await ctx.db
      .query("adminTeam")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    
    if (existingTeamMember) {
      throw new Error("User is already a team member");
    }
    
    const teamMemberId = await ctx.db.insert("adminTeam", {
      userId,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      departments,
      permissions,
      status: "active",
      invitedBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    return teamMemberId;
  },
});

// Update team member
export const updateTeamMember = mutation({
  args: {
    teamMemberId: v.id("adminTeam"),
    departments: v.optional(v.array(v.union(
      v.literal("management"),
      v.literal("operations"),
      v.literal("finance"),
      v.literal("people"),
      v.literal("marketing"),
      v.literal("sales"),
      v.literal("support"),
      v.literal("software")
    ))),
    permissions: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    )),
  },
  handler: async (ctx, { teamMemberId, departments, permissions, status }) => {
    const teamMember = await ctx.db.get(teamMemberId);
    if (!teamMember) {
      throw new Error("Team member not found");
    }
    
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    if (departments !== undefined) updateData.departments = departments;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (status !== undefined) updateData.status = status;
    
    await ctx.db.patch(teamMemberId, updateData);
    
    return teamMemberId;
  },
});

// Remove team member
export const removeTeamMember = mutation({
  args: { teamMemberId: v.id("adminTeam") },
  handler: async (ctx, { teamMemberId }) => {
    await ctx.db.delete(teamMemberId);
  },
});

// Create user and add to team in one step
export const createUserAndAddToTeam = mutation({
  args: {
    walletAddress: v.string(),
    email: v.string(),
    name: v.string(),
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
    permissions: v.array(v.string()),
  },
  handler: async (ctx, { walletAddress, email, name, role, departments, permissions }) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_walletAddress", (q) => q.eq("walletAddress", walletAddress))
      .first();
    
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create admin user
    const userId = await ctx.db.insert("adminUsers", {
      walletAddress,
      email,
      name,
      role,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Add to team
    const teamMemberId = await ctx.db.insert("adminTeam", {
      userId,
      name,
      email,
      role,
      departments,
      permissions,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, teamMemberId };
  },
});

// Update user status
export const updateUserStatus = mutation({
  args: {
    userId: v.id("adminUsers"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    ),
  },
  handler: async (ctx, { userId, status }) => {
    await ctx.db.patch(userId, {
      status,
      updatedAt: Date.now(),
    });
  },
});
