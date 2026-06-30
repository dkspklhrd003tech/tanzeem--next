import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

// Allowed MIME types and their mapped categories
const ALLOWED_TYPES: Record<string, string> = {
  // Images
  "image/jpeg": "images",
  "image/jpg": "images",
  "image/png": "images",
  "image/webp": "images",
  "image/gif": "images",
  "image/svg+xml": "images",
  // Documents
  "application/pdf": "documents",
  // Audio
  "audio/mpeg": "audio",
  "audio/mp3": "audio",
  "audio/ogg": "audio",
  "audio/wav": "audio",
  "audio/x-wav": "audio",
  "audio/aac": "audio",
  // Video
  "video/mp4": "videos",
  "video/mpeg": "videos",
  "video/ogg": "videos",
  "video/webm": "videos",
  "video/quicktime": "videos",
};

// 200 MB max size
const MAX_FILE_SIZE = 200 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    // Optional: caller can hint type, but we derive from mimeType
    const typeHint = (formData.get("type") as string) || "general";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 200 MB limit" },
        { status: 413 }
      );
    }

    const mimeType = file.type || "application/octet-stream";

    // Determine storage subfolder from MIME type (or caller hint as fallback)
    const mimeFolder = ALLOWED_TYPES[mimeType];
    const folder = mimeFolder ?? (typeHint === "slider" ? "sliders" : typeHint === "cover" ? "covers" : "uploads");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Build a safe unique filename
    const ext = extname(file.name) || "";
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.\-_]/g, "-")
      .replace(/-{2,}/g, "-")
      .toLowerCase();
    const uniqueFilename = `${uuidv4()}-${safeName}`;

    // Save to /public/<folder>/ so Next.js static serving continues to work
    const publicDir = join(process.cwd(), "public", folder);
    await mkdir(publicDir, { recursive: true });
    await writeFile(join(publicDir, uniqueFilename), buffer);

    const publicUrl = `/${folder}/${uniqueFilename}`;

    // Persist a media record to the database (best-effort — we still return success
    // even if the DB insert fails, so the upload itself is never lost)
    let mediaId: string | null = null;
    try {
      mediaId = uuidv4();

      // Resolve uploader (optional — works without auth for legacy callers)
      let uploadedBy: string | undefined;
      try {
        const user = await getCurrentUser(req);
        if (user) uploadedBy = user.id;
      } catch {
        // not authenticated — skip
      }

      await db.insert(media).values({
        id: mediaId,
        filename: uniqueFilename,
        originalName: file.name,
        mimeType,
        size: file.size,
        url: publicUrl,
        thumbnailUrl: null,
        altText: null,
        caption: null,
        fileData: buffer,
        uploadedBy: uploadedBy ?? null,
      });
    } catch (dbError) {
      console.error("[upload] DB record insert failed (non-fatal):", dbError);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      mediaId,
      filename: uniqueFilename,
      originalName: file.name,
      mimeType,
      size: file.size,
    });
  } catch (error: any) {
    console.error("[upload] Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
