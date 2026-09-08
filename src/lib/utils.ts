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

  if (path.startsWith("/public_html/uploads")) {
    path = path.replace("/public_html/uploads", "/uploads");
  }

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

/**
 * Resolve an audio/media URL to a full absolute URL pointing directly at the
 * FTP media server. Use this for <audio> src and download hrefs instead of
 * resolveMediaUrl, because Next.js standalone-output rewrites do NOT proxy
 * client-side audio requests — the browser hits /uploads/* directly and gets
 * a 404 on the live server.
 */
export function resolveAudioUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("data:")) return url;

  const mediaBase = (process.env.NEXT_PUBLIC_MEDIA_URL || "https://tanzeemmedia.dks.com.pk").replace(/\/$/, "");

  // Already a full URL — normalise it to the canonical media base
  if (url.startsWith("http")) {
    try {
      const parsed = new URL(url);
      const mediaDomain = new URL(mediaBase).hostname;
      if (parsed.hostname === mediaDomain) {
        // Ensure /public_html/ prefix is present
        let p = parsed.pathname;
        if (p.startsWith("/uploads/")) {
          p = "/public_html" + p;
        }
        return `${mediaBase}${p}`;
      }
    } catch (e) {
      // fall through — return as-is
    }
    return url;
  }

  // Relative path — prepend the media base
  let path = url.startsWith("/") ? url : `/${url}`;
  // Normalise: /uploads/ → /public_html/uploads/
  if (path.startsWith("/uploads/")) {
    path = "/public_html" + path;
  }
  return `${mediaBase}${path}`;
}

export function resolveCategoryHref(
  slug?: string | null,
  defaultPrefix: string = "/videos-by-category"
): { href: string; isExternal: boolean; openInNewTab: boolean } {
  if (!slug || slug.trim() === "" || slug.trim() === "#") {
    return { href: "#", isExternal: false, openInNewTab: false };
  }
  const s = slug.trim();
  if (
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("//") ||
    s.startsWith("mailto:") ||
    s.startsWith("tel:")
  ) {
    return { href: s, isExternal: true, openInNewTab: true };
  }
  if (s.startsWith("/")) {
    return { href: s, isExternal: false, openInNewTab: false };
  }
  return { href: `${defaultPrefix}/${s}`, isExternal: false, openInNewTab: false };
}

