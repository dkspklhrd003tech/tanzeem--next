import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const decodedPath = path.map(segment => decodeURIComponent(segment));
        const joinedPath = decodedPath.join('/');
        
        const mediaHost = (process.env.NEXT_PUBLIC_MEDIA_URL || "https://tanzeemmedia.dks.com.pk").replace(/\/+$/, "");
        
        const targetUrl = mediaHost.endsWith("/public_html")
            ? `${mediaHost}/uploads/covers/${joinedPath}`
            : mediaHost.endsWith("/uploads")
            ? `${mediaHost}/covers/${joinedPath}`
            : `${mediaHost}/public_html/uploads/covers/${joinedPath}`;

        return NextResponse.redirect(targetUrl, 307);
    } catch (error) {
        console.error("Error serving uploaded file redirect:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
