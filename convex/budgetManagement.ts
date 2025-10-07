import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create or update franchise budget
export const createOrUpdateBudget = mutation({
  args: {
    franchiseId: v.id("franchises"),
    monthlyBudget: v.number(),
    teamSalaries: v.number(),
    rent: v.number(),
    utilities: v.number(),
    supplies: v.number(),
    marketing: v.number(),
    maintenance: v.number(),
    taxes: v.number(),
    insurance: v.number(),
    otherExpenses: v.number(),
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Check if budget already exists for this month/year
    const existingBudget = await ctx.db
      .query("franchiseBudgets")
      .withIndex("by_franchise_month_year", (q) => 
        q.eq("franchiseId", args.franchiseId)
         .eq("month", args.month)
         .eq("year", args.year)
      )
      .first();

    if (existingBudget) {
      // Update existing budget
      await ctx.db.patch(existingBudget._id, {
        ...args,
        updatedAt: now,
      });
      return existingBudget._id;
    } else {
      // Create new budget
      return await ctx.db.insert("franchiseBudgets", {
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get franchise budget for specific month/year
export const getFranchiseBudget = query({
  args: {
    franchiseId: v.id("franchises"),
    month: v.number(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const budget = await ctx.db
      .query("franchiseBudgets")
      .withIndex("by_franchise_month_year", (q) => 
        q.eq("franchiseId", args.franchiseId)
         .eq("month", args.month)
         .eq("year", args.year)
      )
      .first();

    return budget;
  },
});

// Get all budgets for a franchise
export const getFranchiseBudgets = query({
  args: {
    franchiseId: v.id("franchises"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const budgets = await ctx.db
      .query("franchiseBudgets")
      .withIndex("by_franchiseId", (q) => q.eq("franchiseId", args.franchiseId))
      .order("desc")
      .take(args.limit || 12);

    return budgets;
  },
});

// Get budget summary for current month
export const getCurrentBudgetSummary = query({
  args: {
    franchiseId: v.id("franchises"),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();

    const budget = await ctx.db
      .query("franchiseBudgets")
      .withIndex("by_franchise_month_year", (q) => 
        q.eq("franchiseId", args.franchiseId)
         .eq("month", currentMonth)
         .eq("year", currentYear)
      )
      .first();

    // Get current month's actual expenses from transactions
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).getTime();
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59).getTime();

    const transactions = await ctx.db
      .query("franchiseWalletTransactions")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), startOfMonth),
          q.lte(q.field("createdAt"), endOfMonth),
          q.eq(q.field("transactionType"), "expense")
        )
      )
      .collect();

    const totalActualExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      budget: budget || null,
      actualExpenses: totalActualExpenses,
      remainingBudget: budget ? budget.monthlyBudget - totalActualExpenses : 0,
      month: currentMonth,
      year: currentYear,
    };
  },
});

// Get budget breakdown by category
export const getBudgetBreakdown = query({
  args: {
    franchiseId: v.id("franchises"),
    month: v.optional(v.number()),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const month = args.month || (now.getMonth() + 1);
    const year = args.year || now.getFullYear();

    const budget = await ctx.db
      .query("franchiseBudgets")
      .withIndex("by_franchise_month_year", (q) => 
        q.eq("franchiseId", args.franchiseId)
         .eq("month", month)
         .eq("year", year)
      )
      .first();

    if (!budget) {
      return null;
    }

    const breakdown = [
      { category: "Team Salaries", budgeted: budget.teamSalaries, spent: 0 },
      { category: "Rent", budgeted: budget.rent, spent: 0 },
      { category: "Utilities", budgeted: budget.utilities, spent: 0 },
      { category: "Supplies", budgeted: budget.supplies, spent: 0 },
      { category: "Marketing", budgeted: budget.marketing, spent: 0 },
      { category: "Maintenance", budgeted: budget.maintenance, spent: 0 },
      { category: "Taxes", budgeted: budget.taxes, spent: 0 },
      { category: "Insurance", budgeted: budget.insurance, spent: 0 },
      { category: "Other Expenses", budgeted: budget.otherExpenses, spent: 0 },
    ];

    return {
      budget,
      breakdown,
      totalBudgeted: budget.monthlyBudget,
      totalSpent: 0, // TODO: Calculate from actual transactions
    };
  },
});
