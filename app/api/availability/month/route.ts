import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isDateAvailable } from "@/lib/availability";
import type { BusinessHours, BlockedDate, BlockedTimeRange, Appointment } from "@/types";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export async function GET(req: NextRequest) {
  const year = parseInt(req.nextUrl.searchParams.get("year") || "", 10);
  const month = parseInt(req.nextUrl.searchParams.get("month") || "", 10); // 1-12
  const duration = parseInt(req.nextUrl.searchParams.get("duration") || "30", 10);

  if (!year || !month) {
    return NextResponse.json({ error: "year and month are required" }, { status: 400 });
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDate = `${year}-${pad(month)}-01`;
  const lastDate = `${year}-${pad(month)}-${pad(daysInMonth)}`;

  const supabase = getServiceClient();
  const [hoursRes, blockedRes, rangesRes, apptsRes] = await Promise.all([
    supabase.from("business_hours").select("*"),
    supabase.from("blocked_dates").select("*").gte("date", firstDate).lte("date", lastDate),
    supabase.from("blocked_time_ranges").select("*").gte("date", firstDate).lte("date", lastDate),
    supabase.from("appointments").select("*").gte("date", firstDate).lte("date", lastDate).in("status", ["pending", "confirmed"]),
  ]);

  const businessHours = (hoursRes.data || []) as BusinessHours[];
  const blockedDates = (blockedRes.data || []) as BlockedDate[];
  const blockedRanges = (rangesRes.data || []) as BlockedTimeRange[];
  const appointments = (apptsRes.data || []) as Appointment[];

  const days: Record<string, boolean> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${pad(month)}-${pad(d)}`;
    days[date] = isDateAvailable(date, duration, businessHours, blockedDates, blockedRanges, appointments);
  }

  return NextResponse.json({ days });
}
