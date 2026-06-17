import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "admin_session";

// Routes that don't require authentication
const PUBLIC_SITEMANAGER_PATHS = ["/sitemanager/login"];

function isSessionValid(sessionCookie: string | undefined): boolean {
  if (!sessionCookie) return false;
  try {
    const session = JSON.parse(Buffer.from(sessionCookie, "base64").toString());
    // Expired after 24 hours
    if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) return false;
    if (!session.userId) return false;
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = isSessionValid(sessionCookie);

  // ── Protect /sitemanager/* routes ──────────────────────────────────────────
  if (pathname.startsWith("/sitemanager")) {
    const isPublicPath = PUBLIC_SITEMANAGER_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );

    if (!isAuthenticated && !isPublicPath) {
      // Redirect to login with callbackUrl
      const loginUrl = new URL("/sitemanager/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If already authenticated, redirect away from login page
    if (isAuthenticated && isPublicPath) {
      return NextResponse.redirect(new URL("/sitemanager/dashboard", request.url));
    }
  }

  // ── Protect /api/sitemanager/* routes ──────────────────────────────────────
  if (pathname.startsWith("/api/sitemanager")) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all /sitemanager/* and /api/sitemanager/* paths.
     * Exclude Next.js internals and static assets.
     */
    "/sitemanager/:path*",
    "/api/sitemanager/:path*",
  ],
};
