import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  if (url.startsWith("/media/") || url.startsWith("/images/") || url.startsWith("/api/media/")) return url;

  let path = url.startsWith("/") ? url : `/${url}`;

  // If the URL is already an absolute FTP media path, strip the domain and public_html
  // so that it forces the relative rewrite path instead.
  if (url.startsWith("http")) {
    try {
      const parsed = new URL(url);
      const mediaDomain = new URL(process.env.NEXT_PUBLIC_MEDIA_URL || "https://tanzeemmedia.dks.com.pk").hostname;
      if (parsed.hostname === mediaDomain) {
        // Extract the path, removing /public_html if present
        let extractedPath = parsed.pathname;
        if (extractedPath.startsWith("/public_html/uploads")) {
          extractedPath = extractedPath.replace("/public_html/uploads", "/uploads");
        }
        return extractedPath;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
    return url;
  }
  
  // Return relative path. The next.config.ts rewrites will proxy /uploads/* 
  // to the external FTP domain transparently.
  return path;
}
