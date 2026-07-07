import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media, activityLogs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const [item] = await db.select({
      id: media.id,
      fileData: media.fileData,
      mimeType: media.mimeType,
      filename: media.filename,
      url: media.url
    }).from(media).where(eq(media.id, id)).limit(1);

    if (!item) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (!item.fileData) {
      // item.url can be a full domain URL (FTP) or a relative path (local)
      const redirectUrl = item.url.startsWith("http")
        ? item.url
        : new URL(item.url, request.url).toString();
      return NextResponse.redirect(redirectUrl, 301);
    }

    return new NextResponse(item.fileData, {
      status: 200,
      headers: {
        "Content-Type": item.mimeType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${item.filename}"`,
        "Content-Length": item.fileData.length.toString(),
        "Accept-Ranges": "bytes",
      }
    });
  } catch (error) {
    console.error("GET media error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

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

    // Attempt to delete file from disk or FTP
    try {
      if (item.url.startsWith("/uploads/")) {
        const { deleteFile } = await import("@/lib/storage");
        await deleteFile(item.url);
      } else if (item.url.startsWith("/")) {
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
