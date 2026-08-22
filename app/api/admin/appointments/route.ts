export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/requireAdmin";
import { sendCancellationNotice } from "@/lib/email";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const filter = req.nextUrl.searchParams.get("filter") || "today";
  const supabase = getServiceClient();
  const today = new Date().toISOString().split("T")[0];

  let query = supabase.from("appointments").select("*").order("date", { ascending: true }).order("start_time", { ascending: true });

  if (filter === "today") {
    query = query.eq("date", today);
  } else if (filter === "upcoming") {
    query = query.gt("date", today).in("status", ["pending", "confirmed"]);
  } else if (filter === "past") {
    query = query.lt("date", today).order("date", { ascending: false });
  }

  const { data } = await query.limit(100);
  return NextResponse.json({ appointments: data || [] });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = getServiceClient();

  // Fetch appointment before updating so we have email + details
  const { data: appt } = await supabase
    .from("appointments")
    .select("customer_email, customer_name, date, start_time, services(name)")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  // Send cancellation email if applicable
  if (status === "cancelled" && appt?.customer_email) {
    const serviceName = (appt.services as { name: string } | null)?.name ?? "Appointment";
    await sendCancellationNotice({
      to: appt.customer_email,
      name: appt.customer_name,
      service: serviceName,
      date: formatDate(appt.date),
      time: formatTime(appt.start_time),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
