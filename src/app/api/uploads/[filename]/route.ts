import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

/**
 * GET /api/uploads/[filename]
 * Public endpoint: serves uploaded images from public/uploads/.
 * Used instead of direct /uploads/ static serving to bypass Next.js route cache issues.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent path traversal
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return new NextResponse(null, { status: 404 });
  }

  const filePath = join(process.cwd(), "public", "uploads", filename);

  if (!existsSync(filePath)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const buffer = await readFile(filePath);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
