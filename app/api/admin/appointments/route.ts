export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/requireAdmin";

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
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}
