const encoder = new TextEncoder();

async function getKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64url: string) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const str = atob(b64 + pad);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

export async function createSessionToken(username: string, secret: string, ttlSeconds = 60 * 60 * 24): Promise<string> {
  const expires = Date.now() + ttlSeconds * 1000;
  const payloadBytes = encoder.encode(JSON.stringify({ u: username, e: expires }));
  const key = await getKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, payloadBytes);
  return `${toBase64Url(payloadBytes)}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(token: string | undefined | null, secret: string): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;

  try {
    const payloadBytes = fromBase64Url(payloadB64);
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify("HMAC", key, fromBase64Url(sigB64), payloadBytes);
    if (!valid) return false;

    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as { u: string; e: number };
    if (!payload.e || Date.now() > payload.e) return false;

    return true;
  } catch {
    return false;
  }
}
