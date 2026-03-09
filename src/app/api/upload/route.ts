import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const data = await req.formData();
        const file: File | null = data.get("file") as unknown as File;
        const type = data.get("type") as string || "general";

        if (!file) {
            return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
        const uploadDir = type === "slider" ? "sliders" : type === "cover" ? "covers" : "uploads";

        // We save to the public directory so Next.js can serve it statically
        const publicPath = join(process.cwd(), "public", uploadDir);

        // Ensure the directory exists
        await mkdir(publicPath, { recursive: true });

        const filePath = join(publicPath, uniqueSuffix);

        // Save the file
        await writeFile(filePath, buffer);

        // Return the relative URL
        return NextResponse.json({
            success: true,
            url: `/${uploadDir}/${uniqueSuffix}`,
        });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
    }
}
