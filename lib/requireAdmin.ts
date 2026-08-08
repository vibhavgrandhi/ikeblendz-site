import { NextRequest } from "next/server";
import { verifySessionToken } from "./adminSession";

export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("admin_token")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  return verifySessionToken(token, secret);
}
