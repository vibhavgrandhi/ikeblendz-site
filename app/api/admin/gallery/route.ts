import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/requireAdmin";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();
  const { data } = await supabase.from("gallery_items").select("*").order("sort_order", { ascending: false });
  return NextResponse.json({ items: data || [] });
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  const caption = formData.get("caption");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WEBP, or GIF images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("gallery")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from("gallery").getPublicUrl(path);

  const { data: item, error: insertError } = await supabase
    .from("gallery_items")
    .insert({
      image_url: publicUrlData.publicUrl,
      caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Failed to save gallery item" }, { status: 500 });
  }

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, is_active } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const supabase = getServiceClient();
  const { error } = await supabase.from("gallery_items").update({ is_active }).eq("id", id);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const supabase = getServiceClient();
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  return NextResponse.json({ success: true });
}
