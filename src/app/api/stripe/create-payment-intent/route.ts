import { NextRequest, NextResponse } from "next/server";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_API_BASE = "https://api.stripe.com/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amountInPaise,
      franchiseId,
      investorId,
      description,
    }: {
      amountInPaise: number;
      franchiseId: string;
      investorId: string;
      description: string;
    } = body;

    if (!amountInPaise || amountInPaise <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    if (!franchiseId || !investorId) {
      return NextResponse.json(
        { error: "franchiseId and investorId are required" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      amount: String(amountInPaise),
      currency: "inr",
      description: description || "Franchise share purchase",
      "metadata[franchiseId]": franchiseId,
      "metadata[investorId]": investorId,
      "automatic_payment_methods[enabled]": "true",
    });

    const response = await fetch(`${STRIPE_API_BASE}/payment_intents`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Stripe API error:", error);
      return NextResponse.json(
        { error: (error as { error?: { message?: string } })?.error?.message ?? "Stripe error" },
        { status: response.status }
      );
    }

    const paymentIntent = await response.json() as {
      id: string;
      client_secret: string;
    };

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
