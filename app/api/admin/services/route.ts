import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();
  const { data } = await supabase.from("services").select("*").order("sort_order");
  return NextResponse.json({ services: data || [] });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, price, duration_minutes, sort_order } = body;
  if (!name?.trim() || price == null || !duration_minutes) {
    return NextResponse.json({ error: "Name, price, and duration are required" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("services")
    .insert({
      name: name.trim(),
      description: (description || "").trim(),
      price,
      duration_minutes,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  return NextResponse.json({ service: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const allowed = ["name", "description", "price", "duration_minutes", "is_active", "sort_order", "image_url"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) patch[key] = updates[key];
  }

  const supabase = getServiceClient();
  const { error } = await supabase.from("services").update(patch).eq("id", id);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const supabase = getServiceClient();
  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  return NextResponse.json({ success: true });
}
