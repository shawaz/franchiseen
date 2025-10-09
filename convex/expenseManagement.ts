import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create an expense
export const createExpense = mutation({
  args: {
    franchiseId: v.id("franchises"),
    category: v.string(),
    amount: v.number(),
    description: v.string(),
    receiptUrl: v.optional(v.id("_storage")),
    expenseDate: v.number(),
    paymentMethod: v.optional(v.union(
      v.literal("cash"),
      v.literal("card"),
      v.literal("wallet"),
      v.literal("transfer")
    )),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Create expense record
    const expenseId = await ctx.db.insert("franchiseExpenses", {
      franchiseId: args.franchiseId,
      category: args.category,
      amount: args.amount,
      description: args.description,
      receiptUrl: args.receiptUrl,
      expenseDate: args.expenseDate,
      paymentMethod: args.paymentMethod || "cash",
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
    });

    // Also create a wallet transaction for this expense
    const franchise = await ctx.db.get(args.franchiseId);
    if (franchise) {
      // Get the franchise wallet
      const wallet = await ctx.db
        .query("franchiseWallets")
        .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();
        
      if (wallet) {
        await ctx.db.insert("franchiseTransactions", {
          franchiseId: args.franchiseId,
          walletId: wallet._id,
          type: "expense",
          amount: args.amount,
          description: `Expense: ${args.description}`,
          status: "completed",
          createdAt: now,
        });

        // Update wallet balance
        await ctx.db.patch(wallet._id, {
          usdBalance: wallet.usdBalance - args.amount,
          totalExpenses: (wallet.totalExpenses || 0) + args.amount,
          updatedAt: now,
        });
      }
    }

    return expenseId;
  },
});

// Get expenses for a franchise
export const getFranchiseExpenses = query({
  args: {
    franchiseId: v.id("franchises"),
    limit: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let expenses = await ctx.db
      .query("franchiseExpenses")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      expenses = expenses.filter(expense => {
        if (args.startDate && expense.expenseDate < args.startDate) return false;
        if (args.endDate && expense.expenseDate > args.endDate) return false;
        return true;
      });
    }

    // Sort by expense date, most recent first
    expenses.sort((a, b) => b.expenseDate - a.expenseDate);

    // Limit results if specified
    if (args.limit) {
      expenses = expenses.slice(0, args.limit);
    }

    return expenses;
  },
});

// Get expense summary for a franchise
export const getExpenseSummary = query({
  args: {
    franchiseId: v.id("franchises"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let expenses = await ctx.db
      .query("franchiseExpenses")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .collect();

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      expenses = expenses.filter(expense => {
        if (args.startDate && expense.expenseDate < args.startDate) return false;
        if (args.endDate && expense.expenseDate > args.endDate) return false;
        return true;
      });
    }

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Group by category
    const byCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Group by payment method
    const byPaymentMethod = expenses.reduce((acc, expense) => {
      const method = expense.paymentMethod || 'cash';
      acc[method] = (acc[method] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExpenses,
      expenseCount: expenses.length,
      byCategory,
      byPaymentMethod,
      averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
    };
  },
});

// Update expense
export const updateExpense = mutation({
  args: {
    expenseId: v.id("franchiseExpenses"),
    category: v.optional(v.string()),
    amount: v.optional(v.number()),
    description: v.optional(v.string()),
    receiptUrl: v.optional(v.id("_storage")),
    expenseDate: v.optional(v.number()),
    paymentMethod: v.optional(v.union(
      v.literal("cash"),
      v.literal("card"),
      v.literal("wallet"),
      v.literal("transfer")
    )),
  },
  handler: async (ctx, args) => {
    const { expenseId, ...updates } = args;
    
    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(expenseId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return expenseId;
  },
});

// Delete expense
export const deleteExpense = mutation({
  args: { expenseId: v.id("franchiseExpenses") },
  handler: async (ctx, args) => {
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }

    // Delete the expense
    await ctx.db.delete(args.expenseId);
    
    return args.expenseId;
  },
});

// Get income from POS sales
export const getFranchiseIncome = query({
  args: {
    franchiseId: v.id("franchises"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get franchise wallet
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();

    if (!wallet) {
      return { totalIncome: 0, incomeCount: 0 };
    }

    // Get all income/revenue transactions
    let transactions = await ctx.db
      .query("franchiseTransactions")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .filter((q) => q.eq(q.field("type"), "revenue"))
      .collect();

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      transactions = transactions.filter(transaction => {
        if (args.startDate && transaction.createdAt < args.startDate) return false;
        if (args.endDate && transaction.createdAt > args.endDate) return false;
        return true;
      });
    }

    const totalIncome = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      totalIncome,
      incomeCount: transactions.length,
    };
  },
});
