import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";
import { desc, count } from "drizzle-orm";
import { ApiError, ApiSuccess } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [logs, totalResult] = await Promise.all([
      db.query.emailLogs.findMany({
        orderBy: [desc(emailLogs.createdAt)],
        limit,
        offset,
      }),
      db.select({ count: count() }).from(emailLogs),
    ]);

    return ApiSuccess({ items: logs, total: totalResult[0].count });
  } catch (error) {
    return ApiError("Internal server error", 500, error);
  }
}
