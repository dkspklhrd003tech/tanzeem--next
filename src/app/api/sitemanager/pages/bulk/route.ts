import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { pages, activityLogs } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/sitemanager/pages/bulk
 * Body: { ids: string[], action: "publish" | "archive" | "delete" }
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { ids, action } = body as { ids: string[]; action: "publish" | "archive" | "delete" };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No page IDs provided." }, { status: 400 });
    }
    if (!["publish", "archive", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid bulk action." }, { status: 400 });
    }

    if (action === "delete") {
      await db.delete(pages).where(inArray(pages.id, ids));
    } else {
      const isPublished = action === "publish";
      await db.update(pages)
        .set({
          isPublished,
          publishedAt: isPublished ? new Date() : undefined,
        })
        .where(inArray(pages.id, ids));
    }

    const logAction =
      action === "publish" ? "PAGE_PUBLISH" :
      action === "archive" ? "PAGE_ARCHIVE" : "PAGE_DELETE";

    await db.insert(activityLogs).values(
      ids.map((id) => ({
        id:         crypto.randomUUID(),
        userId:     user.id,
        action:     logAction,
        entityType: "page",
        entityId:   id,
        details:    `Bulk ${action}: ${ids.length} page(s)`,
      }))
    );

    return NextResponse.json({ success: true, affected: ids.length });
  } catch (err) {
    console.error("PATCH /api/sitemanager/pages/bulk:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
