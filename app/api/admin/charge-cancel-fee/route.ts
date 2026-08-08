export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServiceClient } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/requireAdmin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appointmentId } = await req.json();
  if (!appointmentId) {
    return NextResponse.json({ error: "Missing appointmentId" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data: appt } = await supabase
    .from("appointments")
    .select("stripe_customer_id, stripe_payment_method_id, customer_name")
    .eq("id", appointmentId)
    .single();

  if (!appt?.stripe_customer_id || !appt?.stripe_payment_method_id) {
    return NextResponse.json({ error: "No saved payment method for this appointment" }, { status: 400 });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: 500, // $5.00
    currency: "usd",
    customer: appt.stripe_customer_id,
    payment_method: appt.stripe_payment_method_id,
    off_session: true,
    confirm: true,
    description: `Same-day cancellation fee — ${appt.customer_name}`,
  });

  return NextResponse.json({ success: true, paymentIntentId: paymentIntent.id });
}
