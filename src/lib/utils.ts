import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/media/") || url.startsWith("/images/") || url.startsWith("/api/media/")) return url;
  
  // Safely join base URL and path to avoid double slashes or missing slashes
  const baseUrl = (process.env.NEXT_PUBLIC_MEDIA_URL || "https://tanzeemmedia.dks.com.pk").replace(/\/$/, "");
  let path = url.startsWith("/") ? url : `/${url}`;
  
  // Auto-fix legacy database entries: If the stored URL is just "/uploads/..." 
  // but FTP_ROOT_DIR includes a prefix like "/public_html", dynamically add it.
  const rootDir = (process.env.FTP_ROOT_DIR || "/public_html/uploads").replace(/\/$/, "");
  if (path.startsWith("/uploads") && rootDir.endsWith("/uploads") && rootDir !== "/uploads") {
    const prefix = rootDir.slice(0, rootDir.lastIndexOf("/uploads")); // e.g., "/public_html"
    path = `${prefix}${path}`;
  }

  return `${baseUrl}${path}`;
}
