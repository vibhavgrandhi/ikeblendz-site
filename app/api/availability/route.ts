import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { generateTimeSlots } from "@/lib/availability";
import type { BusinessHours, BlockedDate, BlockedTimeRange, Appointment } from "@/types";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const duration = parseInt(req.nextUrl.searchParams.get("duration") || "30", 10);

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const supabase = getServiceClient();

  const [hoursRes, blockedRes, rangesRes, apptsRes] = await Promise.all([
    supabase.from("business_hours").select("*"),
    supabase.from("blocked_dates").select("*").eq("date", date),
    supabase.from("blocked_time_ranges").select("*").eq("date", date),
    supabase.from("appointments").select("*").eq("date", date).in("status", ["pending", "confirmed"]),
  ]);

  const slots = generateTimeSlots(
    date,
    duration,
    (hoursRes.data || []) as BusinessHours[],
    (blockedRes.data || []) as BlockedDate[],
    (rangesRes.data || []) as BlockedTimeRange[],
    (apptsRes.data || []) as Appointment[]
  );

  return NextResponse.json({ slots });
}
