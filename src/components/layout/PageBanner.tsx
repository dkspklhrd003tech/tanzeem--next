"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageBannerProps {
  title?: string;
  settings?: {
    banner_bg_image?: string;
    banner_overlay_color?: string;
    banner_overlay_opacity?: string;
    banner_text_color?: string;
    banner_height?: string;
    banner_breadcrumb_separator?: string;
    banner_show_breadcrumbs?: string;
  };
}

export function PageBanner({ title, settings }: PageBannerProps) {
  const pathname = usePathname();
  
  // Hide on home page
  if (pathname === "/") return null;

  // Default values if settings are missing
  const bgImage = settings?.banner_bg_image || "/images/default-banner.jpg";
  const overlayColor = settings?.banner_overlay_color || "#000000";
  const opacity = parseFloat(settings?.banner_overlay_opacity || "0.6");
  const textColor = settings?.banner_text_color || "#ffffff";
  const height = settings?.banner_height || "300px";
  const separator = settings?.banner_breadcrumb_separator || "/";
  const showBreadcrumbs = settings?.banner_show_breadcrumbs !== "false";

  // Generate breadcrumbs from path
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    // Convert slug to Title Case
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return { label, href };
  });

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
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg"
          style={{ color: textColor }}
        >
          {title || breadcrumbs[breadcrumbs.length - 1]?.label || "Page"}
        </h1>

        {showBreadcrumbs && (
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
                  <span className="opacity-80" style={{ color: textColor }}>{crumb.label}</span>
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
