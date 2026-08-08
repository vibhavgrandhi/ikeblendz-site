export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServiceClient } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      service_name, date, start_time, end_time,
      customer_name, customer_phone, notes, customer_instagram,
      stripe_payment_intent_id, stripe_customer_id,
    } = body;

    if (!service_name || !date || !start_time || !end_time || !customer_name?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify payment succeeded and get payment method
    let stripe_payment_method_id: string | null = null;
    if (stripe_payment_intent_id) {
      const pi = await stripe.paymentIntents.retrieve(stripe_payment_intent_id);
      if (pi.status !== "succeeded") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
      }
      stripe_payment_method_id = typeof pi.payment_method === "string"
        ? pi.payment_method
        : pi.payment_method?.id ?? null;
    }

    const supabase = getServiceClient();

    const { data: services } = await supabase
      .from("services")
      .select("id")
      .eq("name", service_name)
      .eq("is_active", true)
      .limit(1);

    if (!services || services.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 400 });
    }

    const service_id = services[0].id;

    const { data: conflicts } = await supabase
      .from("appointments")
      .select("id")
      .eq("date", date)
      .in("status", ["pending", "confirmed"])
      .lt("start_time", end_time)
      .gt("end_time", start_time);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
    }

    const notesValue = [
      customer_instagram?.trim() ? `Instagram: ${customer_instagram.trim()}` : null,
      notes?.trim() || null,
    ].filter(Boolean).join("\n") || null;

    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        service_id,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone?.trim() || null,
        date,
        start_time,
        end_time,
        notes: notesValue,
        status: "pending",
        stripe_payment_intent_id: stripe_payment_intent_id || null,
        stripe_customer_id: stripe_customer_id || null,
        stripe_payment_method_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23P01") {
        return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
    }

    return NextResponse.json({ appointment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
