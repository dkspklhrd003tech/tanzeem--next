import { NextRequest, NextResponse } from "next/server";
import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const decodedPath = path.map(segment => decodeURIComponent(segment));
        let filePath = join(/*turbopackIgnore: true*/ process.cwd(), "public", "sliders", ...decodedPath);

        if (!existsSync(filePath)) {
            // Fuzzy search: if path is a single filename, search the sliders folder for a file ending with that filename
            if (decodedPath.length === 1) {
                const filename = decodedPath[0];
                const dir = join(/*turbopackIgnore: true*/ process.cwd(), "public", "sliders");
                if (existsSync(dir)) {
                    const files = await readdir(dir);
                    const match = files.find(f => f.toLowerCase().endsWith(`-${filename.toLowerCase()}`) || f.toLowerCase() === filename.toLowerCase());
                    if (match) {
                        filePath = join(dir, match);
                    }
                }
            }
        }

        if (!existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = await readFile(filePath);
        
        // Determine content type
        let contentType = "application/octet-stream";
        const filename = filePath.toLowerCase();
        if (filename.endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            contentType = "image/jpeg";
        } else if (filename.endsWith(".png")) {
            contentType = "image/png";
        } else if (filename.endsWith(".webp")) {
            contentType = "image/webp";
        } else if (filename.endsWith(".svg")) {
            contentType = "image/svg+xml";
        }

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Disposition": "inline",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Error serving uploaded slider file:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
