import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const targetUrl = new URL(url);
    
    // Only proxy requests to our allowed media domain
    if (!targetUrl.hostname.includes("tanzeemmedia.dks.com.pk")) {
        return new NextResponse("Forbidden proxy target", { status: 403 });
    }

    const response = await fetch(targetUrl.toString(), {
      headers: {
        // Spoof the referer so Hostinger's Hotlink Protection allows it
        "Referer": "https://tanzeemmedia.dks.com.pk/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
    });

    if (!response.ok) {
      return new NextResponse(`Proxy error: ${response.status} ${response.statusText}`, { status: response.status });
    }

    // Stream the image back to the client
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("[media-proxy] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
