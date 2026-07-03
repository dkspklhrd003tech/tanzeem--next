import { NextRequest, NextResponse } from "next/server";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Initialize ffmpeg paths safely
if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath as string);
if (ffprobePath && ffprobePath.path) ffmpeg.setFfprobePath(ffprobePath.path as string);

async function compressAudio(inputBuffer: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const tempInput = path.join(os.tmpdir(), `${uuidv4()}_input.mp3`);
    const tempOutput = path.join(os.tmpdir(), `${uuidv4()}_output.mp3`);

    try {
      await fs.writeFile(tempInput, inputBuffer);

      ffmpeg.ffprobe(tempInput, (err, metadata) => {
        if (err) {
          fs.unlink(tempInput).catch(() => {});
          return reject(err);
        }

        const duration = metadata.format.duration;
        if (!duration) {
          fs.unlink(tempInput).catch(() => {});
          return reject(new Error("Could not determine audio duration"));
        }

        // Target size: 3.8 MB (to safely be under 4MB) = 3.8 * 1024 * 1024 * 8 bits
        const targetBits = 3.8 * 1024 * 1024 * 8;
        let targetBitrate = Math.floor(targetBits / duration / 1000); // in kbps

        if (targetBitrate > 128) targetBitrate = 128;
        if (targetBitrate < 16) targetBitrate = 16; 

        ffmpeg(tempInput)
          .audioCodec("libmp3lame")
          .audioBitrate(`${targetBitrate}k`)
          .on("end", async () => {
            const outBuffer = await fs.readFile(tempOutput);
            await fs.unlink(tempInput).catch(() => {});
            await fs.unlink(tempOutput).catch(() => {});
            resolve(outBuffer);
          })
          .on("error", async (err) => {
            await fs.unlink(tempInput).catch(() => {});
            await fs.unlink(tempOutput).catch(() => {});
            reject(err);
          })
          .save(tempOutput);
      });
    } catch (error) {
      await fs.unlink(tempInput).catch(() => {});
      reject(error);
    }
  });
}

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
    let buffer: any = Buffer.from(bytes);
    let finalSize = file.size;

    if ((mimeType === "audio/mpeg" || mimeType === "audio/mp3") && file.size > 4 * 1024 * 1024) {
      try {
        console.log(`[upload] Compressing audio file: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`);
        buffer = await compressAudio(buffer);
        finalSize = buffer.length;
        console.log(`[upload] Compression complete. New size: ${Math.round(finalSize / 1024 / 1024 * 100) / 100}MB`);
      } catch (err) {
        console.error("[upload] Failed to compress audio:", err);
        // Fallback to uncompressed if it fails
      }
    }

    // Build a safe unique filename
    const ext = extname(file.name) || "";
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.\-_]/g, "-")
      .replace(/-{2,}/g, "-")
      .toLowerCase();
    const uniqueFilename = `${uuidv4()}-${safeName}`;

    let uploadedBy: string | undefined;
    try {
      const user = await getCurrentUser(req);
      if (user) uploadedBy = user.id;
    } catch {
      // not authenticated — skip
    }

    const mediaId = uuidv4();
    const publicUrl = `/api/media/${mediaId}`;

    try {
      await db.insert(media).values({
        id: mediaId,
        filename: uniqueFilename,
        originalName: file.name,
        mimeType,
        size: finalSize,
        url: publicUrl,
        thumbnailUrl: null,
        altText: null,
        caption: null,
        fileData: buffer,
        uploadedBy: uploadedBy ?? null,
      });
    } catch (dbError) {
      console.error("[upload] DB record insert failed:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save file to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      mediaId,
      filename: uniqueFilename,
      originalName: file.name,
      mimeType,
      size: finalSize,
    });
  } catch (error: any) {
    console.error("[upload] Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
