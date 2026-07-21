import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Kumbh_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/layout";
import Script from "next/script";
import { organisationJsonLd, SITE_URL, SITE_NAME } from "@/lib/seo";
import { RecaptchaProvider } from "@/components/providers/RecaptchaProvider";


// ── Heading font: Plus Jakarta Sans (matched from tanzeem.org extraction) ──
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const kumbhSans = Kumbh_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

import { db } from "@/db";
import { settings } from "@/db/schema";
import { inArray } from "drizzle-orm";

export async function generateMetadata(): Promise<Metadata> {
  let settingsRows: any[] = [];
  try {
    settingsRows = await db
      .select()
      .from(settings)
      .where(inArray(settings.key, ["site_favicon", "site_name", "site_description"]));
  } catch (error) {
    console.warn("Could not fetch settings from DB during metadata generation (likely build time). Using defaults.");
  }

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let globalCss = "";
  try {
    const { eq } = await import("drizzle-orm");
    const res = await db.select().from(settings).where(eq(settings.key, "global_css"));
    if (res && res.length > 0 && res[0].value) {
      globalCss = res[0].value;
    }
  } catch (error) {
    console.warn("Could not fetch global_css during RootLayout rendering");
  }

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {globalCss && (
          <style dangerouslySetInnerHTML={{ __html: globalCss }} />
        )}

        {/* Organisation JSON-LD — present on every page */}
        <script
          id="jsonld-organisation"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd()) }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${kumbhSans.variable} antialiased bg-background text-foreground font-body`}
      >
        <RecaptchaProvider>
          <MainLayout>{children}</MainLayout>
        </RecaptchaProvider>

        <Toaster />
      </body>
    </html>
  );
}
