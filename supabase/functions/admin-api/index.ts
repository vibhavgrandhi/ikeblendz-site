import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
const ADMIN_PASSWORD = Deno.env.get("ADMIN_PASSWORD") ?? "ikeblendz123";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const contentType = req.headers.get("content-type") || "";

  try {
    // ── File upload (gallery photos) ──
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      if (form.get("password") !== ADMIN_PASSWORD) return json({ error: "Unauthorized" }, 401);

      const bucket = String(form.get("bucket"));
      const path = String(form.get("path"));
      const file = form.get("file") as File;

      const upRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
        method: "POST",
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          "Content-Type": file.type,
        },
        body: file,
      });
      if (!upRes.ok) return json({ error: await upRes.text() }, 400);
      return json({ ok: true, publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}` });
    }

    // ── Table CRUD ──
    const { password, op, table, params, body } = await req.json();
    if (password !== ADMIN_PASSWORD) return json({ error: "Unauthorized" }, 401);

    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const url = `${SUPABASE_URL}/rest/v1/${table}${qs}`;
    const method = op === "select" ? "GET" : op === "insert" ? "POST" : op === "update" ? "PATCH" : "DELETE";
    const headers: Record<string, string> = {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    };
    if (op === "insert") headers["Prefer"] = "return=representation";

    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    return json(data ?? [], res.ok ? 200 : res.status);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
