import { NextRequest, NextResponse } from "next/server";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";
import { checkRateLimit } from "@/lib/rate-limit";
import { ApiError, ApiSuccess } from "@/lib/api-response";

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

// ── Basic Magic Number (File Signature) Validation ─────────────────────────
function checkMagicNumber(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;
  
  // PDF: %PDF-
  if (mimeType === "application/pdf") {
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }
  // JPEG: FF D8 FF
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }
  // PNG: 89 50 4E 47
  if (mimeType === "image/png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  }
  // GIF: GIF8
  if (mimeType === "image/gif") {
    return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
  }
  // MP4: ftyp at bytes 4-7
  if (mimeType === "video/mp4") {
    return buffer.length >= 8 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70;
  }
  
  // For other types like audio where signatures are variable (e.g. MP3 ID3 or ADTS), 
  // or webp, we fall back to trusting the extension/mime, but this catches the most common vectors.
  return true;
}

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

// ── Route segment config ──────────────────────────────────────────────────────
// Disable Next.js body size limit so large audio/video files don't get truncated
// (default is 4MB). The manual MAX_FILE_SIZE check below enforces our own limit.
export const maxDuration = 300; // 5 minutes — needed for FTP transfer of large files
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(req, "MODERATE", "upload");
    if (!rateLimit.success) {
      return ApiError("Too many upload requests. Please try again later.", 429);
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return ApiError("Could not parse form data — ensure Content-Type is multipart/form-data", 400);
    }

    const file = formData.get("file") as File | null;
    const typeHint = (formData.get("type") as string) || "general";

    if (!file) {
      return ApiError("No file provided", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return ApiError("File exceeds 200 MB limit", 413);
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_TYPES[mimeType]) {
      return ApiError("File type not allowed", 415);
    }

    const mimeFolder = ALLOWED_TYPES[mimeType];
    const folder = mimeFolder ?? (typeHint === "slider" ? "sliders" : typeHint === "cover" ? "covers" : "Media");

    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);
    let finalSize = file.size;

    if (!checkMagicNumber(buffer, mimeType)) {
      return ApiError("File content does not match its extension", 400);
    }

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
      return ApiError("Failed to save file", 500, dbError);
    }

    return ApiSuccess({
      url: staticUrl,
      mediaId,
      filename: uniqueFilename,
      originalName: file.name,
      mimeType,
      size: finalSize,
    });
  } catch (error: any) {
    return ApiError("Failed to upload file", 500, error);
  }
}
