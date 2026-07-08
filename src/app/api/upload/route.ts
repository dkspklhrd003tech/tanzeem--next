import { NextRequest, NextResponse } from "next/server";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

// ── ffmpeg is loaded LAZILY so the route doesn't crash if binaries are missing
// on the live server (cPanel, shared host, etc.)
let ffmpegReady = false;
let ffmpegModule: any = null;

async function initFfmpeg(): Promise<boolean> {
  if (ffmpegReady) return true;
  try {
    const [ffmpeg, ffmpegStatic, ffprobeStatic, fsP, pathM, osM] =
      await Promise.all([
        import("fluent-ffmpeg"),
        import("ffmpeg-static"),
        import("ffprobe-static"),
        import("fs/promises"),
        import("path"),
        import("os"),
      ]);
    const bin = ffmpegStatic.default ?? ffmpegStatic;
    const probe = ffprobeStatic.default ?? ffprobeStatic;
    if (bin) ffmpeg.default.setFfmpegPath(bin as string);
    if (probe?.path) ffmpeg.default.setFfprobePath(probe.path as string);
    ffmpegModule = { ffmpeg: ffmpeg.default, fs: fsP, path: pathM, os: osM };
    ffmpegReady = true;
    return true;
  } catch {
    return false;
  }
}

async function compressAudio(inputBuffer: Buffer): Promise<Buffer> {
  const ok = await initFfmpeg();
  if (!ok || !ffmpegModule) throw new Error("ffmpeg not available");

  const { ffmpeg, fs, path, os } = ffmpegModule;
  const tempInput = path.join(os.tmpdir(), `${uuidv4()}_input.mp3`);
  const tempOutput = path.join(os.tmpdir(), `${uuidv4()}_output.mp3`);

  return new Promise(async (resolve, reject) => {
    try {
      await fs.writeFile(tempInput, inputBuffer);
      ffmpeg.ffprobe(tempInput, (err: any, metadata: any) => {
        if (err) {
          fs.unlink(tempInput).catch(() => {});
          return reject(err);
        }
        const duration = metadata?.format?.duration;
        if (!duration) {
          fs.unlink(tempInput).catch(() => {});
          return reject(new Error("Could not determine audio duration"));
        }
        const targetBits = 3.8 * 1024 * 1024 * 8;
        let targetBitrate = Math.floor(targetBits / duration / 1000);
        if (targetBitrate > 128) targetBitrate = 128;
        if (targetBitrate < 16) targetBitrate = 16;

        ffmpeg(tempInput)
          .audioCodec("libmp3lame")
          .audioBitrate(`${targetBitrate}k`)
          .on("end", async () => {
            try {
              const outBuffer = await fs.readFile(tempOutput);
              await fs.unlink(tempInput).catch(() => {});
              await fs.unlink(tempOutput).catch(() => {});
              resolve(outBuffer);
            } catch (e) { reject(e); }
          })
          .on("error", async (e: any) => {
            await fs.unlink(tempInput).catch(() => {});
            await fs.unlink(tempOutput).catch(() => {});
            reject(e);
          })
          .save(tempOutput);
      });
    } catch (error) {
      await fs.unlink(tempInput).catch(() => {});
      reject(error);
    }
  });
}

// ── Allowed MIME types ──────────────────────────────────────────────────────
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg":      "Image",
  "image/jpg":       "Image",
  "image/png":       "Image",
  "image/webp":      "Image",
  "image/gif":       "Image",
  "image/svg+xml":   "Image",
  "application/pdf": "Document",
  "audio/mpeg":      "Audio",
  "audio/mp3":       "Audio",
  "audio/ogg":       "Audio",
  "audio/wav":       "Audio",
  "audio/x-wav":     "Audio",
  "audio/aac":       "Audio",
  "video/mp4":       "Video",
  "video/mpeg":      "Video",
  "video/ogg":       "Video",
  "video/webm":      "Video",
  "video/quicktime": "Video",
};

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

// ── Route segment config ──────────────────────────────────────────────────────
// Disable Next.js body size limit so large audio/video files don't get truncated
// (default is 4MB). The manual MAX_FILE_SIZE check below enforces our own limit.
export const maxDuration = 300; // 5 minutes — needed for FTP transfer of large files
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: "Could not parse form data — ensure Content-Type is multipart/form-data" },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File | null;
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
    const mimeFolder = ALLOWED_TYPES[mimeType];
    const folder = mimeFolder ?? (typeHint === "slider" ? "sliders" : typeHint === "cover" ? "covers" : "Media");

    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);
    let finalSize = file.size;

    // ── Audio compression (best-effort, skipped if ffmpeg unavailable) ───────
    const isAudio = mimeType === "audio/mpeg" || mimeType === "audio/mp3";
    if (isAudio && file.size > 4 * 1024 * 1024) {
      try {
        console.log(`[upload] Compressing audio: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        const compressed = await compressAudio(buffer);
        buffer = compressed as Buffer;
        finalSize = buffer.length;
        console.log(`[upload] Compressed to ${(finalSize / 1024 / 1024).toFixed(2)}MB`);
      } catch (err) {
        console.warn("[upload] ffmpeg compression skipped:", String(err).slice(0, 120));
        // Continue with the original uncompressed buffer
      }
    }

    // ── Build unique filename ─────────────────────────────────────────────────
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
    let staticUrl = publicUrl;
    try {
        // Stream buffer to FTP or Local FS
        staticUrl = await uploadFile({
          fileName: uniqueFilename,
          folder,
          buffer,
        });

        await db.insert(media).values({
          id: mediaId,
          filename: uniqueFilename,
          originalName: file.name,
          mimeType,
          size: finalSize,
          url: staticUrl, // Static URL instead of API endpoint
          thumbnailUrl: null,
          altText: null,
          caption: null,
          fileData: null, // We no longer store binary data in the DB
          uploadedBy: uploadedBy ?? null,
        });
    } catch (dbError: any) {
      console.error("[upload] Upload or DB insert failed:", dbError?.message ?? dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save file: " + (dbError?.message ?? "unknown error") },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: staticUrl,
      mediaId,
      filename: uniqueFilename,
      originalName: file.name,
      mimeType,
      size: finalSize,
    });
  } catch (error: any) {
    console.error("[upload] Unhandled error:", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Failed to upload file" },
      { status: 500 }
    );
  }
}
