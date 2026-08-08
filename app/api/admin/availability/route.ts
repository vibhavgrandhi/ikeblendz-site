export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();
  const [datesRes, rangesRes, hoursRes] = await Promise.all([
    supabase.from("blocked_dates").select("*").order("date", { ascending: true }),
    supabase.from("blocked_time_ranges").select("*").order("date", { ascending: true }),
    supabase.from("business_hours").select("*").order("day_of_week"),
  ]);

  return NextResponse.json({
    blocked_dates: datesRes.data || [],
    blocked_time_ranges: rangesRes.data || [],
    business_hours: hoursRes.data || [],
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const supabase = getServiceClient();

  if (body.type === "range") {
    const { date, start_time, end_time, reason } = body;
    if (!date || !start_time || !end_time) {
      return NextResponse.json({ error: "Date, start time, and end time are required" }, { status: 400 });
    }
    const { error } = await supabase.from("blocked_time_ranges").insert({ date, start_time, end_time, reason: reason || null });
    if (error) return NextResponse.json({ error: "Failed to block time range" }, { status: 500 });
    return NextResponse.json({ success: true }, { status: 201 });
  }

  if (body.type === "hours") {
    const { day_of_week, open_time, close_time, is_closed } = body;
    if (day_of_week === undefined) return NextResponse.json({ error: "day_of_week required" }, { status: 400 });
    const { error } = await supabase
      .from("business_hours")
      .update({ open_time, close_time, is_closed })
      .eq("day_of_week", day_of_week);
    if (error) return NextResponse.json({ error: "Failed to update hours" }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const { date, reason, full_day } = body;
  if (!date) return NextResponse.json({ error: "Date required" }, { status: 400 });

  const { error } = await supabase.from("blocked_dates").insert({
    date,
    reason: reason || null,
    full_day: full_day !== false,
  });

  if (error) return NextResponse.json({ error: "Failed to block date" }, { status: 500 });
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  const type = req.nextUrl.searchParams.get("type") || "date";
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const supabase = getServiceClient();
  const table = type === "range" ? "blocked_time_ranges" : "blocked_dates";
  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
  return NextResponse.json({ success: true });
}
