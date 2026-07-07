/**
 * useChunkedUpload — uploads a File in chunks to avoid Vercel's 4.5MB
 * serverless function payload limit.
 *
 * Each chunk is sent as a separate POST to /api/upload/chunked.
 * When the last chunk arrives the server assembles and FTPs the file.
 *
 * Usage:
 *   const { uploadFile } = useChunkedUpload();
 *   const result = await uploadFile(file, { onProgress: (pct) => setProgress(pct) });
 *   console.log(result.url); // public URL of uploaded file
 */

const CHUNK_SIZE = 3 * 1024 * 1024; // 3 MB — safely under Vercel's 4.5MB limit

export interface ChunkedUploadOptions {
  /** Called with percentage (0–100) as each chunk completes. */
  onProgress?: (percent: number) => void;
}

export interface ChunkedUploadResult {
  success: boolean;
  url: string;
  mediaId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export function useChunkedUpload() {
  const uploadFile = async (
    file: File,
    options: ChunkedUploadOptions = {}
  ): Promise<ChunkedUploadResult> => {
    const { onProgress } = options;

    const uploadId    = crypto.randomUUID();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end   = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const form = new FormData();
      form.append("chunk",       chunk);
      form.append("uploadId",    uploadId);
      form.append("chunkIndex",  String(i));
      form.append("totalChunks", String(totalChunks));
      form.append("fileName",    file.name);
      form.append("mimeType",    file.type);
      form.append("totalSize",   String(file.size));

      const res = await fetch("/api/upload/chunked", {
        method: "POST",
        body:   form,
      });

      const contentType = res.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        const text = await res.text();
        console.error("[chunkedUpload] Non-JSON response:", res.status, text.slice(0, 400));
        throw new Error(
          `Upload failed (HTTP ${res.status}). Server returned non-JSON — check server logs.`
        );
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Upload failed (HTTP ${res.status})`);
      }

      // Report progress
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      // Last chunk returns the full result
      if (i === totalChunks - 1) {
        if (!data.success || !data.url) {
          throw new Error(data.error ?? "Upload completed but no URL was returned.");
        }
        return data as ChunkedUploadResult;
      }
    }

    // Should never reach here
    throw new Error("Chunked upload ended unexpectedly before final chunk.");
  };

  return { uploadFile };
}
