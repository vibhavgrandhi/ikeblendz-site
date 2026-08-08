export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/adminSession";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get("admin_token")?.value;
    const secret = process.env.ADMIN_SESSION_SECRET;
    const valid = secret ? await verifySessionToken(token, secret) : false;
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
