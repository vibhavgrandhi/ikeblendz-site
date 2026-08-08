import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const GMAIL_USER = Deno.env.get("GMAIL_USER") ?? "";
const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD") ?? "";
const FROM_NAME = "IkeBlendz Bot";
const TO_EMAIL = "superawesomeike@gmail.com";
const TO_SMS_GATEWAY = "5106950297@vtext.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { name, phone, service_name, date, time, notes } = await req.json();

    const html = `
      <h2>New Booking at IkeBlendz</h2>
      <table style="border-collapse:collapse;font-family:sans-serif">
        <tr><td style="padding:6px 12px;font-weight:bold">Client</td><td style="padding:6px 12px">${name}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold">Phone</td><td style="padding:6px 12px">${phone}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold">Service</td><td style="padding:6px 12px">${service_name}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold">Date</td><td style="padding:6px 12px">${date}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold">Time</td><td style="padding:6px 12px">${time}</td></tr>
        ${notes ? `<tr><td style="padding:6px 12px;font-weight:bold">Notes</td><td style="padding:6px 12px">${notes}</td></tr>` : ""}
      </table>
    `;
    const smsText = `IkeBlendz booking: ${name}, ${service_name}, ${date} ${time}. ${phone}`;

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: { username: GMAIL_USER, password: GMAIL_APP_PASSWORD },
      },
    });

    await client.send({
      from: `${FROM_NAME} <${GMAIL_USER}>`,
      to: TO_EMAIL,
      subject: `New Booking: ${service_name} — ${name}`,
      html,
    });
    await client.send({
      from: `${FROM_NAME} <${GMAIL_USER}>`,
      to: TO_SMS_GATEWAY,
      subject: "",
      content: smsText,
    });
    await client.close();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
