import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query all properties with optional filtering
export const getProperties = query({
  args: {
    stage: v.optional(v.union(
      v.literal("listing"),
      v.literal("requested"),
      v.literal("blocked"),
      v.literal("rented"),
      v.literal("sold")
    )),
    assignedTo: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    isVerified: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { stage, assignedTo, isAvailable, isVerified, limit = 50 } = args;
    
    // Apply filters
    let query;
    if (stage) {
      query = ctx.db.query("properties").withIndex("by_stage", (q) => q.eq("stage", stage));
    } else if (assignedTo) {
      query = ctx.db.query("properties").withIndex("by_assignedTo", (q) => q.eq("assignedTo", assignedTo));
    } else if (isAvailable !== undefined) {
      query = ctx.db.query("properties").withIndex("by_available", (q) => q.eq("isAvailable", isAvailable));
    } else if (isVerified !== undefined) {
      query = ctx.db.query("properties").withIndex("by_verified", (q) => q.eq("isVerified", isVerified));
    } else {
      query = ctx.db.query("properties").withIndex("by_createdAt");
    }
    
    const properties = await query.order("desc").take(limit);
    
    // Get additional details for each property
    const propertiesWithDetails = await Promise.all(
      properties.map(async (property) => {
        let franchiseDetails = null;
        let franchiserDetails = null;
        
        if (property.franchiseId) {
          franchiseDetails = await ctx.db.get(property.franchiseId);
        }
        
        if (property.franchiserId) {
          franchiserDetails = await ctx.db.get(property.franchiserId);
        }
        
        return {
          ...property,
          franchiseDetails,
          franchiserDetails,
        };
      })
    );
    
    return propertiesWithDetails;
  },
});

// Get a single property by ID
export const getProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    
    if (!property) {
      return null;
    }
    
    let franchiseDetails = null;
    let franchiserDetails = null;
    
    if (property.franchiseId) {
      franchiseDetails = await ctx.db.get(property.franchiseId);
    }
    
    if (property.franchiserId) {
      franchiserDetails = await ctx.db.get(property.franchiserId);
    }
    
    return {
      ...property,
      franchiseDetails,
      franchiserDetails,
    };
  },
});

// Create a new property listing
export const createProperty = mutation({
  args: {
    address: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    buildingName: v.string(),
    doorNumber: v.string(),
    sqft: v.number(),
    costPerSqft: v.number(),
    propertyType: v.union(
      v.literal("commercial"),
      v.literal("retail"),
      v.literal("office"),
      v.literal("warehouse"),
      v.literal("mixed_use")
    ),
    floor: v.optional(v.number()),
    parkingSpaces: v.optional(v.number()),
    amenities: v.array(v.string()),
    images: v.array(v.id("_storage")),
    landlordContact: v.object({
      name: v.string(),
      phone: v.string(),
      email: v.string(),
      company: v.optional(v.string()),
    }),
    assignedTo: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("properties", {
      ...args,
      stage: "listing",
      isVerified: false,
      isAvailable: true,
      contactHistory: [],
      penaltyHistory: [],
      totalPenalties: 0,
      unpaidPenalties: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update property stage
export const updatePropertyStage = mutation({
  args: {
    propertyId: v.id("properties"),
    stage: v.union(
      v.literal("listing"),
      v.literal("requested"),
      v.literal("blocked"),
      v.literal("rented"),
      v.literal("sold")
    ),
    franchiseId: v.optional(v.id("franchises")),
    franchiserId: v.optional(v.id("franchiser")),
    notes: v.optional(v.string()),
    updatedBy: v.string(), // Admin user ID
  },
  handler: async (ctx, args) => {
    const { propertyId, stage, franchiseId, franchiserId, notes, updatedBy } = args;
    
    const property = await ctx.db.get(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    // Add to contact history
    const contactEntry = {
      date: Date.now(),
      type: "meeting" as const,
      notes: `Stage updated to: ${stage}${notes ? ` - ${notes}` : ''}`,
      contactedBy: updatedBy,
      outcome: stage,
    };
    
    await ctx.db.patch(propertyId, {
      stage,
      franchiseId,
      franchiserId,
      contactHistory: [...property.contactHistory, contactEntry],
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Verify a property
export const verifyProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    isVerified: v.boolean(),
    verificationNotes: v.optional(v.string()),
    verifiedBy: v.string(), // Admin user ID
  },
  handler: async (ctx, args) => {
    const { propertyId, isVerified, verificationNotes, verifiedBy } = args;
    
    const property = await ctx.db.get(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    // Add to contact history
    const contactEntry = {
      date: Date.now(),
      type: "inspection" as const,
      notes: `Property ${isVerified ? 'verified' : 'rejected'}: ${verificationNotes || 'No additional notes'}`,
      contactedBy: verifiedBy,
      outcome: isVerified ? "verified" : "rejected",
    };
    
    await ctx.db.patch(propertyId, {
      isVerified,
      verificationNotes,
      verifiedBy,
      verifiedAt: Date.now(),
      contactHistory: [...property.contactHistory, contactEntry],
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Add contact history entry
export const addContactHistory = mutation({
  args: {
    propertyId: v.id("properties"),
    type: v.union(
      v.literal("call"),
      v.literal("email"),
      v.literal("meeting"),
      v.literal("inspection")
    ),
    notes: v.string(),
    contactedBy: v.string(), // Admin user ID
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { propertyId, type, notes, contactedBy, outcome } = args;
    
    const property = await ctx.db.get(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    const contactEntry = {
      date: Date.now(),
      type,
      notes,
      contactedBy,
      outcome,
    };
    
    await ctx.db.patch(propertyId, {
      contactHistory: [...property.contactHistory, contactEntry],
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Update lease terms
export const updateLeaseTerms = mutation({
  args: {
    propertyId: v.id("properties"),
    leaseTerms: v.object({
      startDate: v.number(),
      endDate: v.number(),
      monthlyRent: v.number(),
      securityDeposit: v.number(),
      maintenanceResponsibility: v.string(),
      renewalTerms: v.optional(v.string()),
    }),
    updatedBy: v.string(), // Admin user ID
  },
  handler: async (ctx, args) => {
    const { propertyId, leaseTerms, updatedBy } = args;
    
    const property = await ctx.db.get(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    // Add to contact history
    const contactEntry = {
      date: Date.now(),
      type: "meeting" as const,
      notes: `Lease terms updated: $${leaseTerms.monthlyRent}/month, ${new Date(leaseTerms.startDate).toLocaleDateString()} - ${new Date(leaseTerms.endDate).toLocaleDateString()}`,
      contactedBy: updatedBy,
      outcome: "lease_updated",
    };
    
    await ctx.db.patch(propertyId, {
      leaseTerms,
      contactHistory: [...property.contactHistory, contactEntry],
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Assign property to admin user
export const assignProperty = mutation({
  args: {
    propertyId: v.id("properties"),
    assignedTo: v.string(), // Admin user ID
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assignedBy: v.string(), // Admin user ID who assigned
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { propertyId, assignedTo, priority, assignedBy, notes } = args;
    
    const property = await ctx.db.get(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    // Add to contact history
    const contactEntry = {
      date: Date.now(),
      type: "meeting" as const,
      notes: `Property assigned to admin user. Priority: ${priority}${notes ? ` - ${notes}` : ''}`,
      contactedBy: assignedBy,
      outcome: "assigned",
    };
    
    await ctx.db.patch(propertyId, {
      assignedTo,
      priority,
      contactHistory: [...property.contactHistory, contactEntry],
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Get property statistics
export const getPropertyStats = query({
  args: {},
  handler: async (ctx) => {
    const allProperties = await ctx.db.query("properties").collect();
    
    const stats = {
      total: allProperties.length,
      byStage: {
        listing: allProperties.filter(p => p.stage === "listing").length,
        requested: allProperties.filter(p => p.stage === "requested").length,
        blocked: allProperties.filter(p => p.stage === "blocked").length,
        rented: allProperties.filter(p => p.stage === "rented").length,
        sold: allProperties.filter(p => p.stage === "sold").length,
      },
      byVerification: {
        verified: allProperties.filter(p => p.isVerified).length,
        unverified: allProperties.filter(p => !p.isVerified).length,
      },
      byAvailability: {
        available: allProperties.filter(p => p.isAvailable).length,
        unavailable: allProperties.filter(p => !p.isAvailable).length,
      },
      byPriority: {
        low: allProperties.filter(p => p.priority === "low").length,
        medium: allProperties.filter(p => p.priority === "medium").length,
        high: allProperties.filter(p => p.priority === "high").length,
        urgent: allProperties.filter(p => p.priority === "urgent").length,
      },
    };
    
    return stats;
  },
});

// Search properties by location or building name
export const searchProperties = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query: searchQuery, limit = 20 } = args;
    
    const allProperties = await ctx.db.query("properties").collect();
    
    const filteredProperties = allProperties.filter(property => 
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.landlordContact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort by relevance and take limit
    const sortedProperties = filteredProperties
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
    
    return sortedProperties;
  },
});

// Get properties by franchise ID
export const getPropertiesByFranchise = query({
  args: { franchiseId: v.id("franchises") },
  handler: async (ctx, args) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();
    
    return properties;
  },
});

// Get properties that need verification
export const getPropertiesNeedingVerification = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { limit = 50 } = args;
    
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_verified", (q) => q.eq("isVerified", false))
      .order("desc")
      .take(limit);
    
    return properties;
  },
});

// Get properties by stage with priority sorting
export const getPropertiesByStageWithPriority = query({
  args: { 
    stage: v.union(
      v.literal("listing"),
      v.literal("requested"),
      v.literal("blocked"),
      v.literal("rented"),
      v.literal("sold")
    ),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { stage, limit = 50 } = args;
    
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_stage", (q) => q.eq("stage", stage))
      .collect();
    
    // Sort by priority (urgent > high > medium > low) then by creation date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    
    const sortedProperties = properties
      .sort((a, b) => {
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.createdAt - a.createdAt;
      })
      .slice(0, limit);
    
    return sortedProperties;
  },
});

// Update property availability
export const updatePropertyAvailability = mutation({
  args: {
    propertyId: v.id("properties"),
    isAvailable: v.boolean(),
    availableFrom: v.optional(v.number()),
    availableUntil: v.optional(v.number()),
    updatedBy: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { propertyId, isAvailable, availableFrom, availableUntil, updatedBy, notes } = args;
    
    const property = await ctx.db.get(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    // Add to contact history
    const contactEntry = {
      date: Date.now(),
      type: "meeting" as const,
      notes: `Availability updated: ${isAvailable ? 'Available' : 'Unavailable'}${notes ? ` - ${notes}` : ''}`,
      contactedBy: updatedBy,
      outcome: isAvailable ? "available" : "unavailable",
    };
    
    await ctx.db.patch(propertyId, {
      isAvailable,
      availableFrom,
      availableUntil,
      contactHistory: [...property.contactHistory, contactEntry],
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Bulk update property stages (for admin workflows)
export const bulkUpdatePropertyStages = mutation({
  args: {
    propertyIds: v.array(v.id("properties")),
    stage: v.union(
      v.literal("listing"),
      v.literal("requested"),
      v.literal("blocked"),
      v.literal("rented"),
      v.literal("sold")
    ),
    updatedBy: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { propertyIds, stage, updatedBy, notes } = args;
    
    const results = await Promise.allSettled(
      propertyIds.map(async (propertyId) => {
        const property = await ctx.db.get(propertyId);
        if (!property) {
          throw new Error(`Property ${propertyId} not found`);
        }
        
        // Add to contact history
        const contactEntry = {
          date: Date.now(),
          type: "meeting" as const,
          notes: `Bulk stage update to: ${stage}${notes ? ` - ${notes}` : ''}`,
          contactedBy: updatedBy,
          outcome: stage,
        };
        
        await ctx.db.patch(propertyId, {
          stage,
          contactHistory: [...property.contactHistory, contactEntry],
          updatedAt: Date.now(),
        });
        
        return propertyId;
      })
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return { 
      success: true, 
      successful, 
      failed,
      results: results.map((r, i) => ({
        propertyId: propertyIds[i],
        success: r.status === 'fulfilled',
        error: r.status === 'rejected' ? (r as PromiseRejectedResult).reason : null
      }))
    };
  },
});

// Impose penalty on property owner
export const imposePenalty = mutation({
  args: {
    propertyId: v.id("properties"),
    penaltyType: v.union(
      v.literal("late_update"),
      v.literal("false_availability"),
      v.literal("contract_breach"),
      v.literal("misinformation")
    ),
    amount: v.number(),
    reason: v.string(),
    imposedBy: v.string(), // Admin user ID
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { propertyId, penaltyType, amount, reason, imposedBy, notes } = args;
    
    const property = await ctx.db.get(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    const penalty = {
      date: Date.now(),
      type: penaltyType,
      amount,
      reason,
      imposedBy,
      status: "pending" as const,
      notes,
    };
    
    const newPenaltyHistory = [...(property.penaltyHistory || []), penalty];
    const newTotalPenalties = (property.totalPenalties || 0) + amount;
    const newUnpaidPenalties = (property.unpaidPenalties || 0) + amount;
    
    // Add to contact history
    const contactEntry = {
      date: Date.now(),
      type: "meeting" as const,
      notes: `Penalty imposed: ${penaltyType} - $${amount} - ${reason}`,
      contactedBy: imposedBy,
      outcome: "penalty_imposed",
    };
    
    await ctx.db.patch(propertyId, {
      penaltyHistory: newPenaltyHistory,
      totalPenalties: newTotalPenalties,
      unpaidPenalties: newUnpaidPenalties,
      contactHistory: [...property.contactHistory, contactEntry],
      updatedAt: Date.now(),
    });
    
    return { success: true, penaltyId: penalty.date };
  },
});

// Update penalty status
export const updatePenaltyStatus = mutation({
  args: {
    propertyId: v.id("properties"),
    penaltyDate: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("waived"),
      v.literal("disputed")
    ),
    updatedBy: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { propertyId, penaltyDate, status, updatedBy, notes } = args;
    
    const property = await ctx.db.get(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    const penaltyHistory = property.penaltyHistory || [];
    const penaltyIndex = penaltyHistory.findIndex(p => p.date === penaltyDate);
    
    if (penaltyIndex === -1) {
      throw new Error("Penalty not found");
    }
    
    const penalty = penaltyHistory[penaltyIndex];
    const oldStatus = penalty.status;
    
    // Update penalty
    penaltyHistory[penaltyIndex] = {
      ...penalty,
      status,
      notes: notes || penalty.notes,
    };
    
    // Recalculate unpaid penalties
    let newUnpaidPenalties = 0;
    penaltyHistory.forEach(p => {
      if (p.status === "pending" || p.status === "disputed") {
        newUnpaidPenalties += p.amount;
      }
    });
    
    // Add to contact history
    const contactEntry = {
      date: Date.now(),
      type: "meeting" as const,
      notes: `Penalty status updated from ${oldStatus} to ${status}${notes ? ` - ${notes}` : ''}`,
      contactedBy: updatedBy,
      outcome: "penalty_status_updated",
    };
    
    await ctx.db.patch(propertyId, {
      penaltyHistory,
      unpaidPenalties: newUnpaidPenalties,
      contactHistory: [...property.contactHistory, contactEntry],
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

// Check for property status violations and auto-impose penalties
export const checkPropertyStatusViolations = mutation({
  args: {
    propertyId: v.id("properties"),
    checkedBy: v.string(), // Admin user ID
  },
  handler: async (ctx, args) => {
    const { propertyId, checkedBy } = args;
    
    const property = await ctx.db.get(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    const violations = [];
    const now = Date.now();
    
    // Check for late updates (if property is marked as available but no recent updates)
    if (property.isAvailable && property.stage === "listing") {
      const lastUpdate = property.updatedAt;
      const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 7) { // More than 7 days without update
        violations.push({
          type: "late_update" as const,
          amount: 100, // $100 penalty for late updates
          reason: `Property not updated for ${Math.floor(daysSinceUpdate)} days`,
        });
      }
    }
    
    // Check for false availability (if property is marked available but actually rented/sold)
    if (property.isAvailable && (property.stage === "rented" || property.stage === "sold")) {
      violations.push({
        type: "false_availability" as const,
        amount: 500, // $500 penalty for false availability
        reason: "Property marked as available but stage indicates it's rented/sold",
      });
    }
    
    // Check for contract breach (if fundraising period exceeded without update)
    if (property.fundraisingStartDate && property.blockagePeriod) {
      const fundraisingEndDate = property.fundraisingStartDate + (property.blockagePeriod * 24 * 60 * 60 * 1000);
      if (now > fundraisingEndDate && property.stage === "blocked") {
        violations.push({
          type: "contract_breach" as const,
          amount: 1000, // $1000 penalty for contract breach
          reason: "Fundraising period exceeded without proper status update",
        });
      }
    }
    
    // Impose penalties for violations
    const imposedPenalties = [];
    for (const violation of violations) {
      const result = await imposePenalty({
        propertyId,
        penaltyType: violation.type,
        amount: violation.amount,
        reason: violation.reason,
        imposedBy: checkedBy,
        notes: "Automatically imposed due to status violation",
      });
      imposedPenalties.push(result);
    }
    
    return {
      success: true,
      violationsFound: violations.length,
      penaltiesImposed: imposedPenalties.length,
      violations,
    };
  },
});

// Get properties with penalties
export const getPropertiesWithPenalties = query({
  args: {
    limit: v.optional(v.number()),
    onlyUnpaid: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { limit = 50, onlyUnpaid = false } = args;
    
    let query = ctx.db.query("properties");
    
    if (onlyUnpaid) {
      // This would require a more complex query in a real implementation
      // For now, we'll get all properties and filter
      const allProperties = await query.collect();
      const propertiesWithUnpaidPenalties = allProperties.filter(p => (p.unpaidPenalties || 0) > 0);
      return propertiesWithUnpaidPenalties.slice(0, limit);
    }
    
    const properties = await query.order("desc").take(limit);
    return properties.filter(p => (p.totalPenalties || 0) > 0);
  },
});

// Get penalty statistics
export const getPenaltyStats = query({
  args: {},
  handler: async (ctx) => {
    const allProperties = await ctx.db.query("properties").collect();
    
    const stats = {
      totalProperties: allProperties.length,
      propertiesWithPenalties: allProperties.filter(p => (p.totalPenalties || 0) > 0).length,
      totalPenaltiesImposed: allProperties.reduce((sum, p) => sum + (p.totalPenalties || 0), 0),
      totalUnpaidPenalties: allProperties.reduce((sum, p) => sum + (p.unpaidPenalties || 0), 0),
      penaltiesByType: {
        late_update: 0,
        false_availability: 0,
        contract_breach: 0,
        misinformation: 0,
      },
      penaltiesByStatus: {
        pending: 0,
        paid: 0,
        waived: 0,
        disputed: 0,
      },
    };
    
    // Count penalties by type and status
    allProperties.forEach(property => {
      const penaltyHistory = property.penaltyHistory || [];
      penaltyHistory.forEach(penalty => {
        stats.penaltiesByType[penalty.type]++;
        stats.penaltiesByStatus[penalty.status]++;
      });
    });
    
    return stats;
  },
});

// Update property status with automatic penalty checking
export const updatePropertyStatusWithPenaltyCheck = mutation({
  args: {
    propertyId: v.id("properties"),
    stage: v.union(
      v.literal("listing"),
      v.literal("requested"),
      v.literal("blocked"),
      v.literal("rented"),
      v.literal("sold")
    ),
    isAvailable: v.optional(v.boolean()),
    updatedBy: v.string(),
    notes: v.optional(v.string()),
    checkForViolations: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { propertyId, stage, isAvailable, updatedBy, notes, checkForViolations = true } = args;
    
    const property = await ctx.db.get(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    
    // Update property stage and availability
    await updatePropertyStage({
      propertyId,
      stage,
      notes,
      updatedBy,
    });
    
    // Update availability if provided
    if (isAvailable !== undefined) {
      await updatePropertyAvailability({
        propertyId,
        isAvailable,
        updatedBy,
        notes,
      });
    }
    
    // Check for violations if requested
    let violationsCheck = null;
    if (checkForViolations) {
      violationsCheck = await checkPropertyStatusViolations({
        propertyId,
        checkedBy: updatedBy,
      });
    }
    
    return {
      success: true,
      violationsCheck,
    };
  },
});
