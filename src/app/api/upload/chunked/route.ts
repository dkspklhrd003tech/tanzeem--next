import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { appendFileChunk } from "@/lib/storage";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg":      "images",
  "image/jpg":       "images",
  "image/png":       "images",
  "image/webp":      "images",
  "image/gif":       "images",
  "image/svg+xml":   "images",
  "application/pdf": "documents",
  "audio/mpeg":      "audio",
  "audio/mp3":       "audio",
  "audio/ogg":       "audio",
  "audio/wav":       "audio",
  "audio/x-wav":     "audio",
  "audio/aac":       "audio",
  "video/mp4":       "videos",
  "video/mpeg":      "videos",
  "video/ogg":       "videos",
  "video/webm":      "videos",
  "video/quicktime": "videos",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const chunk       = formData.get("chunk") as File | null;
    const uploadId    = formData.get("uploadId") as string | null;
    const chunkIndex  = parseInt((formData.get("chunkIndex") as string) ?? "0", 10);
    const totalChunks = parseInt((formData.get("totalChunks") as string) ?? "1", 10);
    const fileName    = (formData.get("fileName") as string | null) ?? "upload";
    const mimeType    = (formData.get("mimeType") as string | null) ?? "application/octet-stream";
    const totalSize   = parseInt((formData.get("totalSize") as string) ?? "0", 10); // Added for final size

    if (!chunk || !uploadId) {
      return NextResponse.json({ success: false, error: "Missing chunk or uploadId" }, { status: 400 });
    }

    // Ensure we have a unique filename shared across chunks
    // To do this, we can derive the filename from the uploadId and the original extension.
    const ext = extname(fileName) || "";
    const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-").replace(/-{2,}/g, "-").toLowerCase();
    const uniqueFilename = `${uploadId}-${safeName}`;

    const mimeFolder = ALLOWED_TYPES[mimeType] ?? "uploads";
    const bytes = await chunk.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Stream directly to FTP or Local FS
    const relativeOrPublicUrl = await appendFileChunk({
      fileName: uniqueFilename,
      folder: mimeFolder,
      buffer,
      chunkIndex,
    });

    // If this isn't the last chunk, just acknowledge success
    if (chunkIndex < totalChunks - 1) {
      return NextResponse.json({ success: true, done: false, chunkIndex });
    }

    // ── Last chunk received — finalize database entry ─────────────────────────
    let uploadedBy: string | undefined;
    try {
      const user = await getCurrentUser(req);
      if (user) uploadedBy = user.id;
    } catch {
      // not authenticated — skip
    }

    const mediaId = uploadId; // Use the same UUID for media ID

    try {
        await db.insert(media).values({
          id: mediaId,
          filename: uniqueFilename,
          originalName: fileName,
          mimeType,
          size: totalSize || buffer.length, // Fallback if totalSize not provided
          url: relativeOrPublicUrl,
          thumbnailUrl: null,
          altText: null,
          caption: null,
          fileData: null,
          uploadedBy: uploadedBy ?? null,
        });
    } catch (dbError: any) {
      console.error("[chunked-upload] DB insert failed:", dbError?.message ?? dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save record to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: relativeOrPublicUrl,
      mediaId,
      filename: uniqueFilename,
      originalName: fileName,
      mimeType,
      size: totalSize || buffer.length,
    });

  } catch (err: any) {
    console.error("[chunked-upload] Error:", err?.message);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Chunked upload failed" },
      { status: 500 }
    );
  }
}
