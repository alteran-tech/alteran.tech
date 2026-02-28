import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json(
        { error: "Authentication is not configured" },
        { status: 503 },
      );
    }

    // Compare SHA-256 hashes to avoid length leakage
    const inputHash = createHash("sha256")
      .update(password ?? "")
      .digest();
    const adminHash = createHash("sha256").update(adminPassword).digest();
    const valid = timingSafeEqual(inputHash, adminHash);

    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
