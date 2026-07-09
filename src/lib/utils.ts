import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/media/") || url.startsWith("/images/") || url.startsWith("/api/media/")) return url;
  
  // Strip /public_html if it accidentally got saved to the database
  let cleanUrl = url;
  if (cleanUrl.startsWith("/public_html/")) {
      cleanUrl = cleanUrl.replace("/public_html", "");
  }

  // Safely join base URL and path to avoid double slashes or missing slashes
  const baseUrl = (process.env.NEXT_PUBLIC_MEDIA_URL || "https://tanzeemmedia.dks.com.pk").replace(/\/$/, "");
  const path = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
  return `${baseUrl}${path}`;
}
