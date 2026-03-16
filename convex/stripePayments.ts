import { action, mutation } from "./_generated/server";
import { v } from "convex/values";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_API_BASE = "https://api.stripe.com/v1";

/**
 * Helper to call Stripe REST API using fetch (Convex-compatible)
 */
async function stripePost(
  path: string,
  params: Record<string, string | number>
): Promise<Record<string, unknown>> {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    body.append(key, String(value));
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: { message?: string } };
    throw new Error(error?.error?.message ?? `Stripe API error: ${response.status}`);
  }

  return response.json() as Promise<Record<string, unknown>>;
}

/**
 * Create a Stripe Payment Intent for share purchases
 * Amount is in INR paise (smallest unit)
 */
export const createPaymentIntent = action({
  args: {
    amountInPaise: v.number(), // Amount in INR paise (e.g., 50000 = ₹500)
    franchiseId: v.string(),
    investorId: v.string(),
    description: v.string(),
  },
  handler: async (_ctx, args) => {
    const data = await stripePost("/payment_intents", {
      amount: args.amountInPaise,
      currency: "inr",
      description: args.description,
      "metadata[franchiseId]": args.franchiseId,
      "metadata[investorId]": args.investorId,
      automatic_payment_methods: "true",
    });

    return {
      clientSecret: data.client_secret as string,
      paymentIntentId: data.id as string,
    };
  },
});

/**
 * Record a successful Stripe payment in the database
 */
export const recordPaymentSuccess = mutation({
  args: {
    franchiseId: v.id("franchises"),
    investorId: v.string(),
    amountInPaise: v.number(),
    stripePaymentIntentId: v.string(),
    description: v.string(),
    transactionType: v.union(
      v.literal("income"),
      v.literal("funding"),
      v.literal("payout"),
      v.literal("royalty")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find or verify franchise wallet exists
    const wallet = await ctx.db
      .query("franchiseWallets")
      .withIndex("by_franchise", (q) => q.eq("franchiseId", args.franchiseId))
      .first();

    if (!wallet) {
      throw new Error("Franchise wallet not found");
    }

    // Record the transaction
    const transactionId = await ctx.db.insert("franchiseWalletTransactions", {
      franchiseWalletId: wallet._id,
      franchiseId: args.franchiseId,
      transactionType: args.transactionType,
      amount: args.amountInPaise,
      inrAmount: args.amountInPaise,
      description: args.description,
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: "confirmed",
      createdAt: now,
    });

    // Update wallet balance
    await ctx.db.patch(wallet._id, {
      balance: wallet.balance + args.amountInPaise,
      inrBalance: (wallet.inrBalance ?? wallet.balance) + args.amountInPaise,
      totalIncome: wallet.totalIncome + args.amountInPaise,
      transactionCount: wallet.transactionCount + 1,
      lastActivity: now,
      updatedAt: now,
    });

    return { transactionId, success: true };
  },
});

/**
 * Create a Stripe Checkout Session for share purchases
 */
export const createStripeCheckoutSession = action({
  args: {
    franchiseId: v.string(),
    investorId: v.string(),
    shareCount: v.number(),
    pricePerShareInPaise: v.number(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (_ctx, args) => {
    const totalAmount = args.shareCount * args.pricePerShareInPaise;

    const data = await stripePost("/checkout/sessions", {
      mode: "payment",
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      "line_items[0][price_data][currency]": "inr",
      "line_items[0][price_data][unit_amount]": args.pricePerShareInPaise,
      "line_items[0][price_data][product_data][name]": `Franchise Shares (${args.shareCount})`,
      "line_items[0][quantity]": args.shareCount,
      "metadata[franchiseId]": args.franchiseId,
      "metadata[investorId]": args.investorId,
      "metadata[shareCount]": args.shareCount,
    });

    return {
      sessionId: data.id as string,
      sessionUrl: data.url as string,
      totalAmount,
    };
  },
});

/**
 * Get payment intent status from Stripe
 */
export const getPaymentIntentStatus = action({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (_ctx, args) => {
    const response = await fetch(
      `${STRIPE_API_BASE}/payment_intents/${args.paymentIntentId}`,
      {
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch payment intent: ${response.status}`);
    }

    const data = (await response.json()) as {
      id: string;
      status: string;
      amount: number;
      currency: string;
    };

    return {
      id: data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
    };
  },
});
