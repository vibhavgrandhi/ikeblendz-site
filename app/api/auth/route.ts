import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/adminSession";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const validUser = process.env.ADMIN_USERNAME;
    const validPass = process.env.ADMIN_PASSWORD;
    const secret = process.env.ADMIN_SESSION_SECRET;

    if (!validUser || !validPass || !secret) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    if (username === validUser && password === validPass) {
      const token = await createSessionToken(username, secret);
      const response = NextResponse.json({ success: true });
      response.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_token");
  return response;
}
