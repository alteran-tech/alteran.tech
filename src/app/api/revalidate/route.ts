import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * POST /api/revalidate
 * Protected endpoint: triggers ISR revalidation for a given path.
 * Body: { path: string }
 */
export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.path || typeof body.path !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'path' in request body" },
        { status: 400 }
      );
    }

    revalidatePath(body.path);

    return NextResponse.json({
      revalidated: true,
      path: body.path,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("POST /api/revalidate error:", error);
    return NextResponse.json(
      { error: "Failed to revalidate" },
      { status: 500 }
    );
  }
}
