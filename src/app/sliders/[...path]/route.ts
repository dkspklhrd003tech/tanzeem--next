import { NextRequest, NextResponse } from "next/server";
import { resolveMediaUrl } from "@/lib/utils";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const decodedPath = path.map(segment => decodeURIComponent(segment));
        const joinedPath = decodedPath.join('/');
        
        // Redirect to the Media CDN URL
        const mediaUrl = resolveMediaUrl(`/sliders/${joinedPath}`);
        
        return NextResponse.redirect(mediaUrl, 301);
    } catch (error) {
        console.error("Error serving uploaded file redirect:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
