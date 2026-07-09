import { Client } from "basic-ftp";
import { promises as fs } from "fs";
import * as path from "path";
import { Readable } from "stream";

export interface StorageOptions {
    fileName: string;
    folder: string;
    buffer: Buffer;
}

export interface ChunkStorageOptions extends StorageOptions {
    chunkIndex: number;
}

// ── FTP connection helper ─────────────────────────────────────────────────────

async function createFtpClient(): Promise<Client> {
    const client = new Client();

    // Verbose mode: logs every FTP command + server reply.
    // IMPORTANT: Disable this (comment it out) once the FTP issue is diagnosed.
    client.ftp.verbose = true;

    // Generous timeout for large audio files on shared hosting
    client.ftp.socket.setTimeout(60_000); // 60 seconds

    const host = process.env.FTP_HOST ?? "";
    const user = process.env.FTP_USER ?? "";
    const password = process.env.FTP_PASSWORD ?? "";
    const port = parseInt(process.env.FTP_PORT ?? "21", 10);
    // Default to false to prevent Hostinger data socket TLS session resumption drops (ECONNRESET)
    const initialSecure = process.env.FTP_SECURE === "true";

    console.log(`[FTP] Connecting → host=${host} port=${port} secure=${initialSecure}`);

    try {
        await client.access({
            host,
            user,
            password,
            port,
            secure: initialSecure,
            secureOptions: { rejectUnauthorized: false },
        });
        console.log("[FTP] Connected successfully (secure).");
    } catch (err: any) {
        console.error(`[FTP] Initial connection failed (secure=${initialSecure}):`, err?.message || err?.code);

        // If secure failed, let's try insecure fallback. Often resolves Vercel/Hostinger TLS conflicts that disguise as 530 errors.
        if (initialSecure) {
            console.log("[FTP] Retrying connection with secure=false (Insecure Fallback)...");
            let fallbackClient: Client | null = null;
            try {
                // Must close and re-instantiate client after a failure
                client.close();
                fallbackClient = new Client();
                fallbackClient.ftp.verbose = true;
                fallbackClient.ftp.socket.setTimeout(60_000);

                await fallbackClient.access({
                    host,
                    user,
                    password,
                    port,
                    secure: false,
                });
                console.log("[FTP] Connected successfully via INSECURE fallback.");
                return fallbackClient;
            } catch (fallbackErr: any) {
                if (fallbackClient) fallbackClient.close();
                let hint = "";
                if (fallbackErr?.code === 530) {
                    hint = " → HINT: Auth failed even on fallback. Verify FTP_USER/FTP_PASSWORD in Vercel env vars, OR Hostinger's firewall is aggressively blocking Vercel's IP addresses.";
                }
                throw new Error(`FTP connection failed after fallback: ${fallbackErr?.message ?? "unknown"} (code: ${fallbackErr?.code ?? "?"})${hint}`);
            }
        }

        client.close();
        let hint = "";
        if (err?.code === 530) {
            hint = " → HINT: Auth failed. Verify FTP_USER/FTP_PASSWORD in Vercel env vars. Ensure the username format matches exactly what Hostinger expects.";
        }
        throw new Error(`FTP connection failed: ${err?.message ?? "unknown error"} (code: ${err?.code ?? "?"})${hint}`);
    }

    return client;
}

// ── Path resolution helper ────────────────────────────────────────────────────

/**
 * Resolves the absolute FTP root directory for uploads, guaranteeing that
 * "uploads" appears in the path exactly once — regardless of whether
 * FTP_ROOT_DIR already includes it (e.g. "/uploads") or not (e.g. "/public_html").
 *
 * Used by BOTH navigateToRemoteDir (upload path) and deleteFile (delete path)
 * so the two can never drift apart if FTP_ROOT_DIR changes in the future.
 */
function resolveFtpRoot(): string {
    let rootDir = (process.env.FTP_ROOT_DIR ?? "/uploads").replace(/\/+$/, "");
    if (!rootDir.endsWith("/uploads") && rootDir !== "/uploads") {
        rootDir = `${rootDir}/uploads`;
    }
    return rootDir;
}

/**
 * Navigate into a remote directory, creating each segment if it doesn't exist.
 * Uses `ensureDir` which is the correct basic-ftp method — it creates the dir
 * AND changes into it, so subsequent calls are relative to the deepest folder.
 */
async function navigateToRemoteDir(client: Client, remoteDir: string): Promise<void> {
    const rootDir = resolveFtpRoot();

    // Build the full absolute remote path
    const fullRemotePath = `${rootDir}/${remoteDir}`.replace(/\/+/g, "/");

    console.log(`[FTP] Ensuring remote directory exists: ${fullRemotePath}`);

    // ensureDir creates the full path recursively and changes into it
    await client.ensureDir(fullRemotePath);

    console.log(`[FTP] Now in: ${fullRemotePath}`);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Uploads a buffer to FTP.
 * Returns the publicly accessible URL/path.
 */
export async function uploadFile({ fileName, folder, buffer }: StorageOptions): Promise<string> {
    if (!process.env.FTP_HOST) {
        throw new Error("FTP_HOST is not configured. Media uploads are strictly set to FTP only.");
    }
    const rootDir = resolveFtpRoot();
    const relativePath = `${rootDir}/${folder}/${fileName}`.replace(/\/+/g, "/");

    const client = await createFtpClient();

    try {
        const remoteDir = folder;
        await navigateToRemoteDir(client, remoteDir);

        // Convert buffer to Readable stream for FTP upload
        const stream = Readable.from(buffer);
        console.log(`[FTP] Uploading ${fileName} (${(buffer.length / 1024).toFixed(1)} KB)...`);
        await client.uploadFrom(stream, fileName);
        console.log(`[FTP] Upload complete: ${fileName}`);
    } catch (err: any) {
        console.error("[FTP] Upload error:", {
            message: err?.message,
            code: err?.code,
            stack: err?.stack?.slice(0, 600),
        });
        throw new Error(`FTP upload failed: ${err?.message ?? "unknown error"}`);
    } finally {
        client.close();
    }

    // Return relative path to store in database
    return relativePath;
}

/**
 * Appends a chunk to a file on FTP.
 * If chunkIndex === 0, the file is created/overwritten.
 * Returns the publicly accessible URL/path.
 */
export async function appendFileChunk({ fileName, folder, buffer, chunkIndex }: ChunkStorageOptions): Promise<string> {
    if (!process.env.FTP_HOST) {
        throw new Error("FTP_HOST is not configured. Media uploads are strictly set to FTP only.");
    }
    const rootDir = resolveFtpRoot();
    const relativePath = `${rootDir}/${folder}/${fileName}`.replace(/\/+/g, "/");

    const client = await createFtpClient();

    try {
        const remoteDir = folder;
        await navigateToRemoteDir(client, remoteDir);

        const stream = Readable.from(buffer);
        if (chunkIndex === 0) {
            console.log(`[FTP] Creating ${fileName} (Chunk 0, ${(buffer.length / 1024).toFixed(1)} KB)...`);
            await client.uploadFrom(stream, fileName);
        } else {
            console.log(`[FTP] Appending to ${fileName} (Chunk ${chunkIndex}, ${(buffer.length / 1024).toFixed(1)} KB)...`);
            await client.appendFrom(stream, fileName);
        }
        console.log(`[FTP] Chunk ${chunkIndex} complete for: ${fileName}`);
    } catch (err: any) {
        console.error("[FTP] Chunk append error:", {
            message: err?.message,
            code: err?.code,
            stack: err?.stack?.slice(0, 600),
        });
        throw new Error(`FTP chunk append failed: ${err?.message ?? "unknown error"}`);
    } finally {
        client.close();
    }

    // Return relative path to store in database
    return relativePath;
}

/**
 * Removes a file from FTP.
 */
export async function deleteFile(relativePath: string): Promise<boolean> {
    if (!process.env.FTP_HOST) {
        throw new Error("FTP_HOST is not configured. Media operations are strictly set to FTP only.");
    }

    let client: Client | null = null;
    try {
        client = await createFtpClient();
        const rootDir = resolveFtpRoot();
        const remotePath = `${rootDir}${relativePath}`.replace(/\/+/g, "/");
        await client.remove(remotePath);
        return true;
    } catch (err: any) {
        console.error(`[FTP] Delete error for ${relativePath}:`, {
            message: err?.message,
            code: err?.code,
        });
        return false;
    } finally {
        if (client) client.close();
    }
}