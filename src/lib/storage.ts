import { Client } from "basic-ftp";
import { promises as fs } from "fs";
import * as path from "path";
import { Readable } from "stream";

export interface StorageOptions {
    fileName: string;
    folder: string;
    buffer: Buffer;
}

// ── FTP connection helper ─────────────────────────────────────────────────────

async function createFtpClient(): Promise<Client> {
    const client = new Client();

    // Uncomment this line temporarily to see verbose FTP handshake logs:
    // client.ftp.verbose = true;

    // Generous timeout for large audio files on shared hosting
    client.ftp.socket.setTimeout(60_000); // 60 seconds

    const host     = process.env.FTP_HOST     ?? "";
    const user     = process.env.FTP_USER     ?? "";
    const password = process.env.FTP_PASSWORD ?? "";
    const port     = parseInt(process.env.FTP_PORT ?? "21", 10);
    const secure   = process.env.FTP_SECURE === "true";

    console.log(`[FTP] Connecting → host=${host} port=${port} secure=${secure}`);

    try {
        await client.access({
            host,
            user,
            password,
            port,
            secure,
            // Shared-hosting certs are often self-signed — skip verification.
            // This is acceptable for Hostinger shared hosting.
            secureOptions: { rejectUnauthorized: false },
        });
        console.log("[FTP] Connected successfully.");
    } catch (err: any) {
        client.close();
        // Surface the REAL error so it shows in upload toast and server logs
        console.error("[FTP] Connection failed:", {
            message: err?.message,
            code:    err?.code,
        });
        throw new Error(`FTP connection failed: ${err?.message ?? "unknown error"} (code: ${err?.code ?? "?"})`);
    }

    return client;
}

/**
 * Navigate into a remote directory, creating each segment if it doesn't exist.
 * Uses `ensureDir` which is the correct basic-ftp method — it creates the dir
 * AND changes into it, so subsequent calls are relative to the deepest folder.
 */
async function navigateToRemoteDir(client: Client, remoteDir: string): Promise<void> {
    const rootDir = (process.env.FTP_ROOT_DIR ?? "/public_html").replace(/\/$/, "");

    // Build the full absolute remote path
    const fullRemotePath = `${rootDir}/${remoteDir}`.replace(/\/+/g, "/");

    console.log(`[FTP] Ensuring remote directory exists: ${fullRemotePath}`);

    // ensureDir creates the full path recursively and changes into it
    await client.ensureDir(fullRemotePath);

    console.log(`[FTP] Now in: ${fullRemotePath}`);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Uploads a buffer to either FTP (production) or local filesystem (dev).
 * Returns the publicly accessible URL/path.
 */
export async function uploadFile({ fileName, folder, buffer }: StorageOptions): Promise<string> {
    const useFtp = !!process.env.FTP_HOST;
    const relativePath = `/uploads/${folder}/${fileName}`;

    if (useFtp) {
        const client = await createFtpClient(); // throws with real error if conn fails

        try {
            const remoteDir = `uploads/${folder}`;
            await navigateToRemoteDir(client, remoteDir);

            // Convert buffer to Readable stream for FTP upload
            const stream = Readable.from(buffer);
            console.log(`[FTP] Uploading ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)...`);
            await client.uploadFrom(stream, fileName);
            console.log(`[FTP] Upload complete: ${fileName}`);
        } catch (err: any) {
            console.error("[FTP] Upload error:", {
                message: err?.message,
                code:    err?.code,
                stack:   err?.stack?.slice(0, 600),
            });
            throw new Error(`FTP upload failed: ${err?.message ?? "unknown error"}`);
        } finally {
            client.close();
        }

        const mediaBase = (process.env.NEXT_PUBLIC_MEDIA_URL ?? "").replace(/\/$/, "");
        return `${mediaBase}${relativePath}`;
    }

    // ── Local filesystem fallback (localhost dev with no FTP_HOST set) ────────
    console.log(`[Storage] Local upload → ${relativePath}`);
    const fullPath = path.join(process.cwd(), "public", "uploads", folder, fileName);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);
    console.log(`[Storage] Saved locally: ${fullPath}`);

    return relativePath;
}

/**
 * Removes a file from FTP or local filesystem.
 */
export async function deleteFile(relativePath: string): Promise<boolean> {
    const useFtp = !!process.env.FTP_HOST;

    if (useFtp) {
        let client: Client | null = null;
        try {
            client = await createFtpClient();
            const rootDir = (process.env.FTP_ROOT_DIR ?? "/public_html").replace(/\/$/, "");
            const remotePath = `${rootDir}${relativePath}`.replace(/\/+/g, "/");
            await client.remove(remotePath);
            return true;
        } catch (err: any) {
            console.error(`[FTP] Delete error for ${relativePath}:`, {
                message: err?.message,
                code:    err?.code,
            });
            return false;
        } finally {
            client?.close();
        }
    }

    try {
        await fs.unlink(path.join(process.cwd(), "public", relativePath));
        return true;
    } catch (err: any) {
        console.warn(`[Storage] Local delete error for ${relativePath}:`, err?.message);
        return false;
    }
}
