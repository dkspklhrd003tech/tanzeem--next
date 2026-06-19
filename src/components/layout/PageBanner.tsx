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

  // Resolve the page title from the DB (not just the slug).
  const [pageTitle, setPageTitle] = useState<string | null>(null);
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
          // The API returns { page: { title, … } } or similar shape.
          const title =
            data?.page?.title ??
            data?.title ??
            null;
          setPageTitle(title);
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
  const bgImage =
    settings?.banner_bg_image || "/images/default-banner.jpg";
  const overlayColor =
    settings?.banner_overlay_color || "#003d25";
  const opacity = parseFloat(
    settings?.banner_overlay_opacity || "0.7",
  );
  const textColor =
    settings?.banner_text_color || "#ffffff";
  const height = settings?.banner_height || "300px";
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

  return (
    <section
      className="relative w-full overflow-hidden flex items-center justify-center text-center"
      style={{ height }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{ backgroundColor: overlayColor, opacity }}
      />

      {/* Content */}
      <div className="container relative z-20 px-4">
        <h1
          className={cn(
            "text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg",
            titleLoading && "animate-pulse",
          )}
          style={{ color: textColor }}
        >
          {displayTitle}
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
                  >
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-primary transition-colors"
                    style={{ color: textColor }}
                  >
                    {crumb.label}
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
