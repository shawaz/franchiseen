import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all leads
export const getAllLeads = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leads").collect();
  },
});

// Query to get leads by status
export const getLeadsByStatus = query({
  args: { 
    status: v.union(
      v.literal("prospects"),
      v.literal("started"),
      v.literal("contacted"),
      v.literal("meeting"),
      v.literal("onboarded"),
      v.literal("rejected")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Query to get leads by source
export const getLeadsBySource = query({
  args: { source: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_source", (q) => q.eq("source", args.source))
      .collect();
  },
});

// Query to get leads assigned to a user
export const getLeadsByAssignedTo = query({
  args: { assignedTo: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.assignedTo))
      .collect();
  },
});

// Query to get lead by email
export const getLeadByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Query to get leads with filters
export const getFilteredLeads = query({
  args: {
    status: v.optional(v.union(
      v.literal("prospects"),
      v.literal("started"),
      v.literal("contacted"),
      v.literal("meeting"),
      v.literal("onboarded"),
      v.literal("rejected")
    )),
    source: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let leads;
    
    // Apply filters
    if (args.status) {
      leads = await ctx.db
        .query("leads")
        .withIndex("by_status", (q) => q.eq("status", args.status as "prospects" | "started" | "contacted" | "meeting" | "onboarded" | "rejected"))
        .collect();
    } else if (args.source) {
      leads = await ctx.db
        .query("leads")
        .withIndex("by_source", (q) => q.eq("source", args.source as string))
        .collect();
    } else if (args.assignedTo) {
      leads = await ctx.db
        .query("leads")
        .withIndex("by_assignedTo", (q) => q.eq("assignedTo", args.assignedTo as string))
        .collect();
    } else {
      leads = await ctx.db.query("leads").collect();
    }
    
    // Apply search filter if provided
    if (args.searchQuery) {
      const searchLower = args.searchQuery.toLowerCase();
      return leads.filter(lead => 
        lead.firstName.toLowerCase().includes(searchLower) ||
        lead.lastName.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        (lead.company && lead.company.toLowerCase().includes(searchLower)) ||
        (lead.phone && lead.phone.includes(searchLower))
      );
    }
    
    return leads;
  },
});

// Mutation to create a new lead
export const createLead = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    source: v.string(),
    status: v.union(
      v.literal("prospects"),
      v.literal("started"),
      v.literal("contacted"),
      v.literal("meeting"),
      v.literal("onboarded"),
      v.literal("rejected")
    ),
    industry: v.optional(v.string()),
    businessType: v.optional(v.string()),
    investmentRange: v.optional(v.string()),
    preferredLocation: v.optional(v.string()),
    timeline: v.optional(v.string()),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    importedFrom: v.optional(v.string()),
    importBatchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if lead already exists
    const existingLead = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingLead) {
      throw new Error("Lead with this email already exists");
    }
    
    return await ctx.db.insert("leads", {
      ...args,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });
  },
});

// Mutation to update lead status
export const updateLeadStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("prospects"),
      v.literal("started"),
      v.literal("contacted"),
      v.literal("meeting"),
      v.literal("onboarded"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.leadId, {
      status: args.status,
      updatedAt: now,
      lastActivityAt: now,
    });
    return args.leadId;
  },
});

// Mutation to update lead information
export const updateLead = mutation({
  args: {
    leadId: v.id("leads"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    company: v.optional(v.string()),
    website: v.optional(v.string()),
    industry: v.optional(v.string()),
    businessType: v.optional(v.string()),
    investmentRange: v.optional(v.string()),
    preferredLocation: v.optional(v.string()),
    timeline: v.optional(v.string()),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
    lastContactDate: v.optional(v.number()),
    nextFollowUpDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { leadId, ...updateData } = args;
    
    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    const now = Date.now();
    await ctx.db.patch(leadId, {
      ...cleanUpdateData,
      updatedAt: now,
      lastActivityAt: now,
    });
    
    return leadId;
  },
});

// Mutation to assign lead to user
export const assignLead = mutation({
  args: {
    leadId: v.id("leads"),
    assignedTo: v.string(),
    assignedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.leadId, {
      assignedTo: args.assignedTo,
      assignedBy: args.assignedBy,
      updatedAt: now,
      lastActivityAt: now,
    });
    return args.leadId;
  },
});

// Mutation to delete lead
export const deleteLead = mutation({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.leadId);
    return args.leadId;
  },
});

// Mutation to import leads from franchisebazar.com
export const importLeadsFromFranchiseBazar = mutation({
  args: {
    leads: v.array(v.object({
      firstName: v.string(),
      lastName: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      company: v.optional(v.string()),
      website: v.optional(v.string()),
      industry: v.optional(v.string()),
      businessType: v.optional(v.string()),
      investmentRange: v.optional(v.string()),
      preferredLocation: v.optional(v.string()),
      timeline: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
    importBatchId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];
    
    for (const leadData of args.leads) {
      try {
        // Check if lead already exists
        const existingLead = await ctx.db
          .query("leads")
          .withIndex("by_email", (q) => q.eq("email", leadData.email))
          .first();
        
        if (!existingLead) {
          const leadId = await ctx.db.insert("leads", {
            ...leadData,
            source: "franchisebazar.com",
            status: "prospects",
            importedFrom: "franchisebazar.com",
            importBatchId: args.importBatchId,
            createdAt: now,
            updatedAt: now,
            lastActivityAt: now,
          });
          results.push({ success: true, leadId, email: leadData.email });
        } else {
          results.push({ success: false, error: "Lead already exists", email: leadData.email });
        }
      } catch (error) {
        results.push({ success: false, error: error instanceof Error ? error.message : "Unknown error", email: leadData.email });
      }
    }
    
    return {
      totalProcessed: args.leads.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  },
});

// Query to get lead statistics
export const getLeadStatistics = query({
  args: {},
  handler: async (ctx) => {
    const allLeads = await ctx.db.query("leads").collect();
    
    const stats = {
      total: allLeads.length,
      byStatus: {
        prospects: 0,
        started: 0,
        contacted: 0,
        meeting: 0,
        onboarded: 0,
        rejected: 0,
      },
      bySource: {} as Record<string, number>,
      byMonth: {} as Record<string, number>,
    };
    
    allLeads.forEach(lead => {
      // Count by status
      stats.byStatus[lead.status]++;
      
      // Count by source
      stats.bySource[lead.source] = (stats.bySource[lead.source] || 0) + 1;
      
      // Count by month
      const month = new Date(lead.createdAt).toISOString().slice(0, 7); // YYYY-MM
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });
    
    return stats;
  },
});
