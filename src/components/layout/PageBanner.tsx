"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageBannerProps {
  /** All flattened site settings (from useSettings). */
  settings?: Record<string, string>;
}

export function PageBanner({ settings }: PageBannerProps) {
  const pathname = usePathname();

  // Resolve the page title and image from the DB (not just the slug).
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [titleLoading, setTitleLoading] = useState(false);

  const slug = pathname?.split("/").filter(Boolean).join("/") ?? "";

  useEffect(() => {
    if (!slug) return;

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
      .catch(() => {
        // Silently fall back to slug-derived title.
      })
      .finally(() => {
        if (!cancelled) setTitleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Banner settings come from the DB (seeded in seed-settings.ts).
  const textColor =
    settings?.banner_text_color || "#ffffff";
  const separator =
    settings?.banner_breadcrumb_separator || "/";
  const showBreadcrumbs =
    settings?.banner_show_breadcrumbs !== "false";

  // Build breadcrumb segments from the pathname.
  const pathSegments = pathname?.split("/").filter(Boolean) ?? [];
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return { label, href };
  });

  // Title resolution: DB title > slug-derived title > "Page"
  const displayTitle =
    pageTitle ??
    breadcrumbs[breadcrumbs.length - 1]?.label ??
    "Page";

  const bgImage = settings?.banner_bg_image;

  return (
    <section
      className="relative overflow-hidden bg-primary text-white pt-24 pb-20 md:pt-28 md:pb-28 flex items-center justify-center text-center w-full"
    >
      {/* Background Image - global setting */}
      {bgImage && (
        <>
          <div
            className="absolute inset-0 z-0 bg-contain bg-center transition-transform"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />
        </>
      )}

      {/* Ambient Overlay Patterns */}
      <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none bg-primary" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c8a84e]/10 rounded-full blur-[100px] -mr-64 -mt-64" />
      <div className="absolute -bottom-24 left-1/4 w-[400px] h-[400px] bg-primary rounded-full blur-[80px]" />

      {/* Arabesque geometric watermark */}
      <div
        className="absolute inset-0 opacity-[0.03]  pointer-events-none bg-repeat bg-center"
        style={{ backgroundImage: `url('/images/pattern-arabesque.png')`, backgroundSize: '180px' }}
      />

      {/* Content */}
      <div className="container relative z-20 px-4">
        <h1
          className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold pt-4 pb-4 drop-shadow-lg line-clamp-1",
            titleLoading && "animate-pulse",
          )}
          style={{ color: textColor }}
        >
          {displayTitle.length > 25 ? displayTitle.substring(0, 25) + "..." : displayTitle}
        </h1>

        {showBreadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center justify-center gap-2 text-sm md:text-base font-medium drop-shadow-md">
            <Link
              href="/"
              className="hover:text-primary transition-colors"
              style={{ color: textColor }}
            >
              Home
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                <span style={{ color: textColor }}>{separator}</span>
                {index === breadcrumbs.length - 1 ? (
                  <span
                    className="opacity-80"
                    style={{ color: textColor }}
                    title={crumb.label}
                  >
                    {crumb.label.length > 40 ? crumb.label.substring(0, 25) + "..." : crumb.label}
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
