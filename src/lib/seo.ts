/**
 * src/lib/seo.ts
 *
 * Centralised SEO utilities for Tanzeem-e-Islami Next.js app.
 *
 * - buildMetadata()   → typed Metadata object for every route
 * - JSON-LD helpers   → structured data generators per Schema.org type
 * - OG image helper   → consistent social-card URL builder
 */

import type { Metadata } from "next";

// ─── Constants ────────────────────────────────────────────────────────────────

export const SITE_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "https://tanzeem.org";
export const SITE_NAME = "Tanzeem-e-Islami";
export const SITE_LOGO = `${SITE_URL}/logo.svg`;

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

// ─── buildMetadata ────────────────────────────────────────────────────────────

interface MetadataInput {
  title: string;
  description?: string;
  keywords?: string[];
  /** Absolute or root-relative path, e.g. "/audio/some-slug" */
  path?: string;
  /** Full URL to OG image. Falls back to DEFAULT_OG_IMAGE */
  ogImage?: string | null;
  /** Whether search engines should index this page */
  noIndex?: boolean;
  /** Schema.org @type for this page. Default: "WebPage" */
  schemaType?: string;
}

export function buildMetadata({
  title,
  description = `${SITE_NAME} — Islamic lectures, books, Quran education, and organisational resources.`,
  keywords = [],
  path = "",
  ogImage,
  noIndex = false,
  schemaType: _schemaType = "WebPage",
}: MetadataInput): Metadata {
  const url       = `${SITE_URL}${path}`;
  const image     = ogImage ?? DEFAULT_OG_IMAGE;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title:       fullTitle,
    description,
    keywords:    keywords.join(", ") || undefined,
    alternates:  { canonical: url },
    robots:      noIndex ? "noindex,nofollow" : "index,follow",
    openGraph: {
      title:       fullTitle,
      description,
      url,
      siteName:    SITE_NAME,
      type:        "website",
      locale:      "en_PK",
      images:      [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       fullTitle,
      description,
      images:      [image],
      site:        "@tanzeemeislami",
    },
  };
}

// ─── JSON-LD generators ───────────────────────────────────────────────────────

/** Organisation structured data — used on every page via RootLayout */
export function organisationJsonLd() {
  return {
    "@context":   "https://schema.org",
    "@type":      "Organization",
    name:         SITE_NAME,
    url:          SITE_URL,
    logo:         SITE_LOGO,
    sameAs: [
      "https://www.youtube.com/@tanzeemeislami",
      "https://www.facebook.com/tanzeemeislami",
      "https://twitter.com/tanzeemeislami",
    ],
    contactPoint: {
      "@type":             "ContactPoint",
      telephone:           "+92-42-35473375",
      contactType:         "customer service",
      areaServed:          "PK",
      availableLanguage:   ["Urdu", "English"],
    },
    address: {
      "@type":           "PostalAddress",
      streetAddress:     "23 KM Multan Road, Near Chung",
      addressLocality:   "Lahore",
      addressRegion:     "Punjab",
      postalCode:        "53800",
      addressCountry:    "PK",
    },
  };
}

/** WebPage JSON-LD — homepage and generic pages */
export function webPageJsonLd({
  title,
  description,
  path,
  datePublished,
  dateModified,
}: {
  title: string;
  description?: string;
  path: string;
  datePublished?: Date | string | null;
  dateModified?: Date | string | null;
}) {
  return {
    "@context":     "https://schema.org",
    "@type":        "WebPage",
    name:           title,
    description,
    url:            `${SITE_URL}${path}`,
    inLanguage:     "ur",
    isPartOf:       { "@id": SITE_URL },
    publisher:      { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    datePublished:  datePublished ? new Date(datePublished).toISOString() : undefined,
    dateModified:   dateModified  ? new Date(dateModified).toISOString()  : undefined,
  };
}

/** AudioObject JSON-LD — individual audio lecture pages */
export function audioJsonLd({
  title,
  description,
  slug,
  audioUrl,
  thumbnailUrl,
  duration,
  speakerName,
  datePublished,
}: {
  title: string;
  description?: string | null;
  slug: string;
  audioUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  speakerName?: string | null;
  datePublished?: Date | string | null;
}) {
  return {
    "@context":    "https://schema.org",
    "@type":       "AudioObject",
    name:          title,
    description:   description ?? undefined,
    contentUrl:    audioUrl,
    url:           `${SITE_URL}/audio/${slug}`,
    thumbnailUrl:  thumbnailUrl ?? undefined,
    duration:      duration ? `PT${Math.floor(duration / 60)}M${duration % 60}S` : undefined,
    inLanguage:    "ur",
    author:        speakerName
      ? { "@type": "Person", name: speakerName }
      : { "@type": "Organization", name: SITE_NAME },
    publisher:     { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    uploadDate:    datePublished ? new Date(datePublished).toISOString() : undefined,
  };
}

/** VideoObject JSON-LD — individual video lecture pages */
export function videoJsonLd({
  title,
  description,
  slug,
  videoUrl,
  thumbnailUrl,
  duration,
  speakerName,
  datePublished,
}: {
  title: string;
  description?: string | null;
  slug: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  speakerName?: string | null;
  datePublished?: Date | string | null;
}) {
  return {
    "@context":    "https://schema.org",
    "@type":       "VideoObject",
    name:          title,
    description:   description ?? undefined,
    contentUrl:    videoUrl,
    url:           `${SITE_URL}/videos/${slug}`,
    thumbnailUrl:  thumbnailUrl ?? `${DEFAULT_OG_IMAGE}`,
    duration:      duration ? `PT${Math.floor(duration / 60)}M${duration % 60}S` : undefined,
    inLanguage:    "ur",
    author:        speakerName
      ? { "@type": "Person", name: speakerName }
      : { "@type": "Organization", name: SITE_NAME },
    publisher:     { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: SITE_LOGO } },
    uploadDate:    datePublished ? new Date(datePublished).toISOString() : undefined,
  };
}

/** Book JSON-LD — individual book pages */
export function bookJsonLd({
  title,
  description,
  slug,
  coverImage,
  authorName,
  language,
  datePublished,
}: {
  title: string;
  description?: string | null;
  slug: string;
  coverImage?: string | null;
  authorName?: string | null;
  language?: string;
  datePublished?: Date | string | null;
}) {
  return {
    "@context":    "https://schema.org",
    "@type":       "Book",
    name:          title,
    description:   description ?? undefined,
    url:           `${SITE_URL}/books/${slug}`,
    image:         coverImage ?? undefined,
    inLanguage:    language ?? "ur",
    author:        authorName
      ? { "@type": "Person", name: authorName }
      : { "@type": "Organization", name: SITE_NAME },
    publisher:     { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    datePublished: datePublished ? new Date(datePublished).toISOString() : undefined,
  };
}

/** BreadcrumbList JSON-LD — navigation path */
export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context":        "https://schema.org",
    "@type":           "BreadcrumbList",
    itemListElement:   crumbs.map((crumb, i) => ({
      "@type":   "ListItem",
      position:  i + 1,
      name:      crumb.name,
      item:      `${SITE_URL}${crumb.path}`,
    })),
  };
}

/** FAQPage JSON-LD */
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: items.map((item) => ({
      "@type":        "Question",
      name:           item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Helper — render JSON-LD as a <script> tag string (use in next/head or Script) */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data);
}
