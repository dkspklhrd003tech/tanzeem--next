import { NextRequest, NextResponse } from "next/server";
import { log404Detection } from "@/app/actions/trafficActions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const path = body.path || request.nextUrl.pathname;

    const referer = request.headers.get("referer") || body.referer || undefined;
    const userAgent = request.headers.get("user-agent") || body.userAgent || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined;

    if (!path || path === "/favicon.ico" || path.startsWith("/_next")) {
      return NextResponse.json({ skipped: true });
    }

    const result = await log404Detection({
      path,
      referer,
      userAgent,
      ipAddress,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in log-404 API:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
