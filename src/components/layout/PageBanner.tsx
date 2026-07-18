"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigation } from "@/hooks/use-navigation";
import { cn, resolveMediaUrl } from "@/lib/utils";

interface PageBannerProps {
  /** All flattened site settings (from useSettings). */
  settings?: Record<string, string>;
  titleOverride?: string;
  breadcrumbsOverride?: { label: string; href: string }[];
  bgImageOverride?: string;
  subtitle?: string;
}

export function PageBanner({ settings, titleOverride, breadcrumbsOverride, bgImageOverride, subtitle }: PageBannerProps) {
  const pathname = usePathname();
  const { items: navigation } = useNavigation("main", true);

  const flattenedMenu = useMemo(() => {
    const flat: Array<{ label: string; url: string }> = [];
    const traverse = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.url) flat.push({ label: node.label, url: node.url });
        if (node.children) traverse(node.children);
      }
    };
    traverse(navigation);
    return flat;
  }, [navigation]);

  // Resolve the page title and image from the DB (not just the slug).
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [titleLoading, setTitleLoading] = useState(false);

  const slug = pathname?.split("/").filter(Boolean).join("/") ?? "";

  useEffect(() => {
    if (!slug || titleOverride) return;

    // Skip fetching page data for dynamic resource detail routes to avoid unnecessary 404s
    const skipPrefixes = [
      "audio/", "videos/", "books/", "audio-books/",
      "magazines/", "campaigns/", "services/", "press-releases/",
      "events/", "books-by-category/", "videos-by-category/",
      "videos-by-speakers/", "audios-by-speaker/", "resources/khitab-e-jumah/"
    ];
    if (skipPrefixes.some(prefix => slug.startsWith(prefix))) return;

    let cancelled = false;
    setTitleLoading(true);

    fetch(`/api/pages/by-slug/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) {
          const title = data?.page?.title ?? data?.title ?? null;
          const image = data?.page?.featuredImage ?? data?.featuredImage ?? null;
          setPageTitle(title);
          setPageImage(image);
        }
      })
      .catch(() => { })
      .finally(() => {
        if (!cancelled) setTitleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, titleOverride]);

  // Banner settings come from the DB
  const textColor = settings?.banner_text_color || "#ffffff";
  const separator = settings?.banner_breadcrumb_separator || ">";
  const showBreadcrumbs = settings?.banner_show_breadcrumbs !== "false";

  // Build breadcrumb segments from the pathname if no override provided.
  const pathSegments = pathname?.split("/").filter(Boolean) ?? [];
  const defaultBreadcrumbs = pathSegments.map((segment, index) => {
    let href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const match = flattenedMenu.find((m) => m.label.toLowerCase() === label.toLowerCase());
    if (match && match.url) {
      href = match.url;
    } else {
      if (segment === "books") href = "/books-by-category";
      if (segment === "videos") href = "/videos-by-category";
      if (segment === "audio") href = "/audios-by-speaker";
    }

    return { label, href };
  });

  const finalBreadcrumbs = breadcrumbsOverride || defaultBreadcrumbs;

  // Title resolution
  const displayTitle =
    titleOverride ??
    pageTitle ??
    finalBreadcrumbs[finalBreadcrumbs.length - 1]?.label ??
    "Page";

  const rawBgImage = bgImageOverride || settings?.banner_bg_image;
  const bgImage = rawBgImage ? resolveMediaUrl(rawBgImage) : null;

  // Additional settings from GlobalBannerManager
  const overlayColor = settings?.banner_overlay_color || "#005031"; // Fallback to primary if missing
  const bannerHeight = settings?.banner_height || "auto";

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center text-center w-full py-8 md:py-24"
      style={{
        minHeight: bannerHeight !== "auto" ? bannerHeight : undefined,
        backgroundColor: overlayColor, // Base background color fallback
      }}
    >
      {/* Background Image - global setting or override */}
      {bgImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}

      <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none" style={{ backgroundColor: overlayColor }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8a84e]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-primary rounded-full blur-[80px]" />

      {/* Arabesque geometric watermark */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
      />

      {/* Content */}
      <div className="container relative z-20 px-4">
        <h1
          className={cn(
            "text-3xl md:text-5xl lg:text-6xl font-bold py-3 drop-shadow-lg line-clamp-1",
            titleLoading && "animate-pulse"
          )}
          style={{ color: textColor }}
        >
          {displayTitle.length > 40 ? displayTitle.substring(0, 40) + "..." : displayTitle}
        </h1>

        {subtitle && (
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-4 drop-shadow-md">
            {subtitle}
          </p>
        )}

        {showBreadcrumbs && finalBreadcrumbs.length > 0 && !subtitle && (
          <nav className="flex items-center justify-center gap-2 text-sm md:text-base font-medium drop-shadow-md flex-wrap">
            <Link
              href="/"
              className="hover:text-primary transition-colors"
              style={{ color: textColor }}
            >
              Home
            </Link>
            {finalBreadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                <span style={{ color: textColor }}>{separator}</span>
                {index === finalBreadcrumbs.length - 1 ? (
                  <span
                    className="opacity-80"
                    style={{ color: textColor }}
                    title={crumb.label}
                  >
                    {crumb.label.length > 40 ? crumb.label.substring(0, 40) + "..." : crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-primary transition-colors"
                    style={{ color: textColor }}
                    title={crumb.label}
                  >
                    {crumb.label.length > 40 ? crumb.label.substring(0, 40) + "..." : crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
