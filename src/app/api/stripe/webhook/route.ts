import { NextRequest, NextResponse } from "next/server";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const STRIPE_API_BASE = "https://api.stripe.com/v1";

/**
 * Stripe webhook endpoint to handle payment confirmations.
 *
 * Supported events:
 * - payment_intent.succeeded — record confirmed payment
 * - payment_intent.payment_failed — mark payment as failed
 * - checkout.session.completed — handle completed checkout sessions
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  // Verify webhook signature using Stripe's raw API
  // We call the Stripe API to validate since we can't use the Node.js SDK crypto directly
  let event: StripeEvent;
  try {
    event = await verifyStripeWebhook(body, sig);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as StripePaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        console.log("Franchise:", paymentIntent.metadata?.franchiseId);
        console.log("Investor:", paymentIntent.metadata?.investorId);
        console.log("Amount (paise):", paymentIntent.amount);

        // TODO: Call Convex mutation to record the payment
        // This requires a Convex HTTP action or calling the Convex API directly
        // Example: await recordPaymentInConvex(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as StripePaymentIntent;
        console.error("Payment failed:", paymentIntent.id);
        console.error(
          "Reason:",
          paymentIntent.last_payment_error?.message ?? "Unknown"
        );
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as StripeCheckoutSession;
        console.log("Checkout completed:", session.id);
        console.log("Payment intent:", session.payment_intent);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook event:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Verify Stripe webhook signature.
 * Uses Web Crypto API (available in Next.js Edge/Node runtimes).
 */
async function verifyStripeWebhook(
  payload: string,
  signature: string
): Promise<StripeEvent> {
  // Parse signature header: t=timestamp,v1=hash
  const parts: Record<string, string> = {};
  for (const part of signature.split(",")) {
    const [key, ...rest] = part.split("=");
    parts[key] = rest.join("=");
  }

  const timestamp = parts["t"];
  const v1 = parts["v1"];

  if (!timestamp || !v1) {
    throw new Error("Invalid stripe-signature format");
  }

  // Check timestamp tolerance (300 seconds)
  const tolerance = 300;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > tolerance) {
    throw new Error("Webhook timestamp too old");
  }

  const signedPayload = `${timestamp}.${payload}`;

  // Use Web Crypto API to compute HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signedPayload)
  );

  const computedHash = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computedHash !== v1) {
    throw new Error("Webhook signature mismatch");
  }

  return JSON.parse(payload) as StripeEvent;
}

// Minimal Stripe type definitions
interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: unknown;
  };
}

interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, string>;
  last_payment_error?: {
    message?: string;
  };
}

interface StripeCheckoutSession {
  id: string;
  payment_intent?: string;
  metadata?: Record<string, string>;
}

// Keep reference to STRIPE_API_BASE to avoid unused import warnings
void STRIPE_API_BASE;
