import { NextRequest, NextResponse } from "next/server";

async function stripePost(path: string, body: Record<string, string>, key: string) {
  const params = new URLSearchParams(body).toString();
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return NextResponse.json({ error: "Stripe key not configured" }, { status: 500 });

    const { amount, serviceName, customerName, customerPhone } = await req.json();
    if (!amount || amount <= 0) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    const customer = await stripePost("/customers", {
      ...(customerName ? { name: customerName } : {}),
      ...(customerPhone ? { phone: customerPhone } : {}),
      "metadata[serviceName]": serviceName,
    }, key);

    if (customer.error) return NextResponse.json({ error: customer.error.message }, { status: 400 });

    const paymentIntent = await stripePost("/payment_intents", {
      amount: String(Math.round(amount * 100)),
      currency: "usd",
      customer: customer.id,
      setup_future_usage: "off_session",
      "metadata[serviceName]": serviceName,
      "metadata[customerName]": customerName || "",
    }, key);

    if (paymentIntent.error) return NextResponse.json({ error: paymentIntent.error.message }, { status: 400 });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
