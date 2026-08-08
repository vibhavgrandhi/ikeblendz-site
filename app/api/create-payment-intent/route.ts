export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { amount, serviceName, customerName, customerPhone } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const customer = await stripe.customers.create({
    name: customerName || undefined,
    phone: customerPhone || undefined,
    metadata: { serviceName },
  });

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "usd",
    customer: customer.id,
    setup_future_usage: "off_session",
    metadata: { serviceName, customerName: customerName || "" },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    customerId: customer.id,
    paymentIntentId: paymentIntent.id,
  });
}
