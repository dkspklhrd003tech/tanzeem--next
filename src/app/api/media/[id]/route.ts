import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;

    // Get media info first to delete the file
    const item = await db.query.media.findFirst({
      where: eq(media.id, id),
    });

    if (!item) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Attempt to delete file from disk
    try {
      if (item.url.startsWith("/")) {
        const filePath = join(process.cwd(), "public", item.url);
        await unlink(filePath).catch(() => console.warn(`Could not delete file at ${filePath}`));
      }
    } catch (e) {
       console.error("File deletion error:", e);
    }

    // Delete record from DB
    await db.delete(media).where(eq(media.id, id));

    // Log activity
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.id,
      action: "delete",
      entityType: "media",
      entityId: id,
      details: JSON.stringify({ filename: item.filename }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete media error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
