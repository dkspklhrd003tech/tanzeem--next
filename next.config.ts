import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  typescript: {
    // Type errors are caught via separate tsc --noEmit in CI
    ignoreBuildErrors: true,
  },

  // Disable strict mode to prevent double-invocation issues in development
  reactStrictMode: false,

  // ── Image optimisation ────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    // Devices widths for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      // Tanzeem.org WordPress media (cover images, thumbnails)
      { protocol: "https", hostname: "www.tanzeem.org" },
      { protocol: "https", hostname: "tanzeem.org" },
      // YouTube thumbnails
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      // Google Fonts / gstatic
      { protocol: "https", hostname: "fonts.gstatic.com" },
      // Cloudflare R2 or S3-compatible storage (if used)
      { protocol: "https", hostname: "*.r2.dev" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      // Placeholder images for dev/seed data
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },

  // ── HTTP headers — security + caching ────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Media files — 7-day cache
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
      {
        // API routes — no caching by default
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },

  // ── Redirects — legacy/duplicate routes → canonical ──────────────────────
  async redirects() {
    return [
      // Redirect legacy top-level organization URLs to canonical sub-paths
      { source: "/our-ideology", destination: "/organization/our-ideology", permanent: true },
      { source: "/our-ideology/:slug*", destination: "/organization/our-ideology/:slug*", permanent: true },
      { source: "/background", destination: "/organization/background", permanent: true },
      { source: "/mission-statement", destination: "/organization/mission-statement", permanent: true },
      // Redirect old resource sub-routes to new direct routes
      { source: "/resources/audios/:slug", destination: "/audio/:slug", permanent: true },
      { source: "/resources/videos/:slug", destination: "/videos/:slug", permanent: true },
      { source: "/resources/books/:slug", destination: "/books/:slug", permanent: true },
      // Contact alias
      { source: "/contact-us", destination: "/contact", permanent: true },
      // Redirect relative media requests to the external FTP storage
      { 
        source: "/uploads/:path*", 
        destination: `${process.env.NEXT_PUBLIC_MEDIA_URL || "https://tanzeemmedia.dks.com.pk"}/uploads/:path*`, 
        permanent: false 
      },
    ];
  },
};

export default nextConfig;
