import type { Metadata } from "next";
import { Amiri, Plus_Jakarta_Sans, Kumbh_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/layout";
import Script from "next/script";
import { organisationJsonLd, SITE_URL, SITE_NAME } from "@/lib/seo";
import { ShareSidebar } from "@/components/shared/ShareSidebar";

// ── Heading font: Plus Jakarta Sans (matched from tanzeem.org extraction) ──
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// ── Body font: Kumbh Sans (matched from tanzeem.org extraction) ─────────────
const kumbhSans = Kumbh_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ── Arabic / Urdu font: Amiri ────────────────────────────────────────────────
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["latin", "arabic"],
  weight: ["400", "700"],
  display: "swap",
});

import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function generateMetadata(): Promise<Metadata> {
  const settingsRows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, ["site_favicon", "site_name", "site_description"]));

  const settingsMap = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

  const siteName = settingsMap["site_name"] || SITE_NAME;
  const siteDesc =
    settingsMap["site_description"] ||
    "Tanzeem-e-Islami is working to re-establish Khilafah by following the methodology of Prophet Muhammad (SAWS). Access Islamic lectures, books, videos, and educational resources.";
  const favicon = settingsMap["site_favicon"] || "/favicon.ico";

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDesc,
    keywords: [
      "Tanzeem-e-Islami",
      "Dr. Israr Ahmed",
      "Islamic Lectures",
      "Khilafah",
      "Quran",
      "Hadith",
      "Islamic Education",
      "Islamic Books",
    ],
    authors: [{ name: siteName }],
    icons: { icon: favicon },
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: siteName,
      description: siteDesc,
      url: SITE_URL,
      siteName: siteName,
      type: "website",
      locale: "en_PK",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDesc,
      site: "@tanzeemeislami",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Noto Nastaliq Urdu — Urdu running text */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-B6P9KW8X46"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B6P9KW8X46');
          `}
        </Script>
        {/* Organisation JSON-LD — present on every page */}
        <script
          id="jsonld-organisation"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd()) }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${kumbhSans.variable} ${amiri.variable} antialiased bg-background text-foreground font-body`}
      >
        <MainLayout>{children}</MainLayout>
        <ShareSidebar />
        <Toaster />
      </body>
    </html>
  );
}
