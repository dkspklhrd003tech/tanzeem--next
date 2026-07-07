import { Client } from "basic-ftp";
import { promises as fs } from "fs";
import * as path from "path";
import { Readable } from "stream";

export interface StorageOptions {
    fileName: string;
    folder: string;
    buffer: Buffer;
}

/**
 * Ensures the nested directory structure exists via FTP.
 */
async function ensureFtpDirectory(client: Client, remoteDir: string) {
    const parts = remoteDir.split("/").filter(Boolean);
    let currentPath = "";
    
    // Switch to root or specific root dir first
    const rootDir = process.env.FTP_ROOT_DIR || "/public_html";
    await client.cd(rootDir);

    for (const part of parts) {
        currentPath += `/${part}`;
        try {
            await client.cd(part);
        } catch (err) {
            await client.ensureDir(part);
        }
    }
}

/**
 * Streams a buffer to the storage provider (FTP or Local File System).
 * Returns the relative public path (e.g. /uploads/images/file.jpg).
 */
export async function uploadFile({ fileName, folder, buffer }: StorageOptions): Promise<string> {
    // Use FTP whenever FTP_HOST is configured (works in both dev and production)
    const useFtp = !!process.env.FTP_HOST;
    
    const relativePath = `/uploads/${folder}/${fileName}`;

    if (useFtp) {
        console.log(`[Storage] Uploading ${fileName} to FTP server...`);
        const client = new Client();
        // client.ftp.verbose = true;
        
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                port: parseInt(process.env.FTP_PORT || "21"),
                secure: process.env.FTP_SECURE === "true",
            });

            const remoteFolder = `uploads/${folder}`;
            await ensureFtpDirectory(client, remoteFolder);

            // Convert buffer to stream
            const stream = Readable.from(buffer);
            await client.uploadFrom(stream, fileName);
            console.log(`[Storage] Successfully uploaded ${fileName} to FTP`);
        } catch (err) {
            console.error(`[Storage] FTP Upload Error:`, err);
            throw new Error("Failed to upload file to FTP storage");
        } finally {
            client.close();
        }

        // Return full public URL for production (domain-based)
        const mediaBase = process.env.NEXT_PUBLIC_MEDIA_URL
            ? process.env.NEXT_PUBLIC_MEDIA_URL.replace(/\/$/, "")
            : "";
        return `${mediaBase}${relativePath}`;
    } else {
        // Local File System (Local Development or Non-FTP Production)
        console.log(`[Storage] Uploading ${fileName} to Local Filesystem...`);
        const fullPath = path.join(process.cwd(), "public", "uploads", folder, fileName);
        
        // Ensure directory exists
        const dir = path.dirname(fullPath);
        await fs.mkdir(dir, { recursive: true });

        // Write file
        await fs.writeFile(fullPath, buffer);
        console.log(`[Storage] Successfully uploaded ${fileName} locally`);
    }

    return relativePath;
}

/**
 * Removes a file from storage.
 */
export async function deleteFile(relativePath: string): Promise<boolean> {
    // Use FTP whenever FTP_HOST is configured (works in both dev and production)
    const useFtp = !!process.env.FTP_HOST;

    if (useFtp) {
        const client = new Client();
        try {
            await client.access({
                host: process.env.FTP_HOST,
                user: process.env.FTP_USER,
                password: process.env.FTP_PASSWORD,
                port: parseInt(process.env.FTP_PORT || "21"),
                secure: process.env.FTP_SECURE === "true",
            });

            const rootDir = process.env.FTP_ROOT_DIR || "/public_html";
            const remotePath = path.posix.join(rootDir, relativePath);
            await client.remove(remotePath);
            return true;
        } catch (err) {
            console.error(`[Storage] FTP Delete Error for ${relativePath}:`, err);
            return false;
        } finally {
            client.close();
        }
    } else {
        try {
            const fullPath = path.join(process.cwd(), "public", relativePath);
            await fs.unlink(fullPath);
            return true;
        } catch (err) {
            console.warn(`[Storage] Local Delete Error for ${relativePath}:`, err);
            return false;
        }
    }
}
