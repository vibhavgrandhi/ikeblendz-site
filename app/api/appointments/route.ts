export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { sendSms } from "@/lib/sms";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      service_name, date, start_time, end_time,
      customer_name, customer_phone, notes, customer_instagram,
    } = body;

    if (!service_name || !date || !start_time || !end_time || !customer_name?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // Check if this phone number has a prior cancellation
    let canceledBefore = false;
    if (customer_phone?.trim()) {
      const { data: priorCancels } = await supabase
        .from("appointments")
        .select("id")
        .eq("customer_phone", customer_phone.trim())
        .eq("status", "cancelled")
        .limit(1);
      canceledBefore = !!(priorCancels && priorCancels.length > 0);
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
        stripe_payment_intent_id: null,
        stripe_customer_id: null,
        stripe_payment_method_id: null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23P01") {
        return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
    }

    // Send SMS to Ike
    const lines = [
      `📅 New Booking — IkeBlendz`,
      ``,
      `${customer_name.trim()}`,
      `${service_name} — ${formatDate(date)} at ${formatTime(start_time)}`,
      customer_phone?.trim() ? `📞 ${customer_phone.trim()}` : null,
      customer_instagram?.trim() ? `📸 ${customer_instagram.trim()}` : null,
      notes?.trim() ? `📝 ${notes.trim()}` : null,
      canceledBefore ? `\n⚠️ CANCELED BEFORE — charge $5 in person` : null,
    ].filter((l) => l !== null).join("\n");

    await sendSms(lines).catch(() => {}); // non-blocking, don't fail booking if SMS fails

    return NextResponse.json({ appointment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
