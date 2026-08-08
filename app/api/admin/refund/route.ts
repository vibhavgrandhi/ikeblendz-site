export const runtime = "edge";

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
    .select("stripe_payment_intent_id, customer_name")
    .eq("id", appointmentId)
    .single();

  if (!appt?.stripe_payment_intent_id) {
    return NextResponse.json({ error: "No payment found for this appointment" }, { status: 400 });
  }

  const refund = await stripe.refunds.create({
    payment_intent: appt.stripe_payment_intent_id,
  });

  return NextResponse.json({ success: true, refundId: refund.id });
}
