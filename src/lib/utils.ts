import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  if (url.startsWith("/media/") || url.startsWith("/images/")) return url;
  // If it's a relative uploads path or anything else, prefix with MEDIA_URL
  const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL || "https://tanzeemmedia.dks.com.pk";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}
