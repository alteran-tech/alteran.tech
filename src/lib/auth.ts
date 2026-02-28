import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

async function getHmacKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET ?? "";
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(str: string): ArrayBuffer {
  const bytes = Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
  return bytes.buffer as ArrayBuffer;
}

export async function createSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payloadB64 = btoa(JSON.stringify({ exp }));
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64),
  );
  return `${payloadB64}.${bufToBase64(sig)}`;
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return false;
    const payloadB64 = token.slice(0, dot);
    const sigB64 = token.slice(dot + 1);

    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64ToBuf(sigB64),
      new TextEncoder().encode(payloadB64),
    );
    if (!valid) return false;

    const { exp } = JSON.parse(atob(payloadB64));
    return typeof exp === "number" && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

/** For use in middleware and API route handlers (reads from request object). */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/** For use in Server Components and Server Actions (reads from next/headers). */
export async function isAuthenticatedServer(): Promise<boolean> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}
