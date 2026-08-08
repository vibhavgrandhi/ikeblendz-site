export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer_name, rating, body: reviewBody } = body;

    if (!customer_name?.trim() || !reviewBody?.trim()) {
      return NextResponse.json({ error: "Name and review text are required" }, { status: 400 });
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const supabase = getServiceClient();

    const { error } = await supabase.from("reviews").insert({
      customer_name: customer_name.trim().slice(0, 100),
      rating,
      body: reviewBody.trim().slice(0, 2000),
      status: "approved",
    });

    if (error) {
      return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
    }

    return NextResponse.json({ message: "Review posted" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
