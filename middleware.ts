import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookie
  const cookieNames = request.cookies.getAll().map((c) => c.name);
  const hasAuthCookie = cookieNames.some(
    (name) => name.startsWith("sb-") && name.endsWith("-auth-token")
  );

  if (!hasAuthCookie) {
    // No admin/login page exists — redirect to home
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
