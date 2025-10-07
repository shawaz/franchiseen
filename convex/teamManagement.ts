import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Add team member to franchise
export const addTeamMember = mutation({
  args: {
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
    salary: v.number(),
    hourlyRate: v.optional(v.number()),
    isHourly: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if user is already part of this franchise team
    const existingMember = await ctx.db
      .query("franchiseTeam")
      .withIndex("by_franchiseId", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existingMember) {
      throw new Error("User is already part of this franchise team");
    }

    // Generate permissions based on role
    const permissions = generatePermissionsForRole(args.role);

    return await ctx.db.insert("franchiseTeam", {
      franchiseId: args.franchiseId,
      userId: args.userId,
      role: args.role,
      salary: args.salary,
      hourlyRate: args.hourlyRate,
      isHourly: args.isHourly,
      hireDate: now,
      status: "active",
      permissions,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update team member
export const updateTeamMember = mutation({
  args: {
    teamMemberId: v.id("franchiseTeam"),
    role: v.optional(v.union(
      v.literal("manager"), 
      v.literal("cashier"), 
      v.literal("cook"), 
      v.literal("server"), 
      v.literal("cleaner"),
      v.literal("supervisor")
    )),
    salary: v.optional(v.number()),
    hourlyRate: v.optional(v.number()),
    isHourly: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("terminated"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { teamMemberId, ...updateData } = args;
    const now = Date.now();

    // If role is being updated, update permissions too
    const patchData: any = { ...updateData, updatedAt: now };
    if (updateData.role) {
      patchData.permissions = generatePermissionsForRole(updateData.role);
    }

    await ctx.db.patch(teamMemberId, patchData);

    return teamMemberId;
  },
});

// Remove team member
export const removeTeamMember = mutation({
  args: {
    teamMemberId: v.id("franchiseTeam"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    await ctx.db.patch(args.teamMemberId, {
      status: "terminated",
      updatedAt: now,
    });

    return args.teamMemberId;
  },
});

// Get franchise team members
export const getFranchiseTeam = query({
  args: {
    franchiseId: v.id("franchises"),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("franchiseTeam")
      .withIndex("by_franchiseId", (q) => q.eq("franchiseId", args.franchiseId));

    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field("status"), "active"));
    }

    const teamMembers = await query.collect();

    // Get user details for each team member
    const teamWithDetails = await Promise.all(
      teamMembers.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user: user ? {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatar: user.avatar,
          } : null,
        };
      })
    );

    return teamWithDetails;
  },
});

// Get team member by user ID
export const getTeamMemberByUser = query({
  args: {
    franchiseId: v.id("franchises"),
    userId: v.id("userProfiles"),
  },
  handler: async (ctx, args) => {
    const teamMember = await ctx.db
      .query("franchiseTeam")
      .withIndex("by_franchiseId", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!teamMember) {
      return null;
    }

    const user = await ctx.db.get(args.userId);
    return {
      ...teamMember,
      user: user ? {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
      } : null,
    };
  },
});

// Get team summary
export const getTeamSummary = query({
  args: {
    franchiseId: v.id("franchises"),
  },
  handler: async (ctx, args) => {
    const teamMembers = await ctx.db
      .query("franchiseTeam")
      .withIndex("by_franchiseId", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const roleCounts = teamMembers.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalMonthlySalaries = teamMembers.reduce((sum, member) => {
      return sum + (member.isHourly ? (member.hourlyRate || 0) * 160 : member.salary);
    }, 0);

    return {
      totalMembers: teamMembers.length,
      roleCounts,
      totalMonthlySalaries,
      averageSalary: teamMembers.length > 0 ? totalMonthlySalaries / teamMembers.length : 0,
    };
  },
});

// Check if user has permission
export const checkUserPermission = query({
  args: {
    franchiseId: v.id("franchises"),
    userId: v.id("userProfiles"),
    permission: v.string(),
  },
  handler: async (ctx, args) => {
    const teamMember = await ctx.db
      .query("franchiseTeam")
      .withIndex("by_franchiseId", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.and(
        q.eq(q.field("userId"), args.userId),
        q.eq(q.field("status"), "active")
      ))
      .first();

    if (!teamMember) {
      return false;
    }

    return teamMember.permissions.includes(args.permission);
  },
});

// Helper function to generate permissions based on role
function generatePermissionsForRole(role: string): string[] {
  const basePermissions = ["view_schedule", "view_inventory"];
  
  switch (role) {
    case "manager":
      return [
        ...basePermissions,
        "manage_team",
        "manage_budget",
        "manage_inventory",
        "view_financials",
        "manage_pos",
        "approve_orders",
        "manage_schedule",
        "view_reports",
        "manage_suppliers",
      ];
    case "supervisor":
      return [
        ...basePermissions,
        "manage_pos",
        "approve_orders",
        "view_inventory",
        "manage_schedule",
        "view_reports",
      ];
    case "cashier":
      return [
        ...basePermissions,
        "use_pos",
        "process_orders",
        "view_inventory",
      ];
    case "cook":
      return [
        ...basePermissions,
        "view_orders",
        "update_order_status",
        "view_inventory",
      ];
    case "server":
      return [
        ...basePermissions,
        "view_orders",
        "update_order_status",
      ];
    case "cleaner":
      return [
        ...basePermissions,
        "view_schedule",
      ];
    default:
      return basePermissions;
  }
}
