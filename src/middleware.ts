import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";

const adminPattern = /^\/admin(\/|$)/;

export async function middleware(request: NextRequest) {
  if (adminPattern.test(request.nextUrl.pathname)) {
    const authed = await isAuthenticated(request);
    if (!authed) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
