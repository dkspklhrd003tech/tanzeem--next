import { Suspense } from "react";
import Script from "next/script";
import { Hero } from "@/components/home/Hero";
import { AboutAndLeaders } from "@/components/home/AboutAndLeaders";
import { SpotlightCampaigns } from "@/components/home/SpotlightCampaigns";
import { MissionAndVideos } from "@/components/home/MissionAndVideos";
import { PublicationsGrid } from "@/components/home/PublicationsGrid";
import { CTA } from "@/components/home/CTA";
import { BackToTop } from "@/components/ui/back-to-top";
import { db } from "@/db";
import { homeSliders, books, magazines, teamMembers, homeCampaigns, videos, settings, pressReleases } from "@/db/schema";
import { LatestPressReleases } from "@/components/home/LatestPressReleases";
import { eq, desc, asc } from "drizzle-orm";
import { webPageJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Tanzeem-e-Islami",
  description:
    "Tanzeem-e-Islami is working to re-establish Khilafah following the methodology of Prophet Muhammad (SAWS). Access Islamic lectures, books, videos, and educational resources.",
  keywords: ["Tanzeem-e-Islami", "Dr. Israr Ahmed", "Islamic Lectures", "Khilafah", "Quran", "Hadith", "Islamic Education"],
  path: "/",
});

async function HomeContent() {
  // Query Active Hero Sliders
  const activeSliders = await db
    .select()
    .from(homeSliders)
    .where(eq(homeSliders.isActive, true))
    .orderBy(desc(homeSliders.order), desc(homeSliders.createdAt));

  // Query Featured Books & Magazines (Mocked here if missing fields, otherwise pull from schema)
  // Our current schema has 'isFeatured' for books/magazines, so let's use that.
  const featuredBooks = await db
    .select()
    .from(books)
    .where(eq(books.isFeatured, true))
    .orderBy(asc(books.order), desc(books.createdAt))
    .limit(4);

  const featuredMagazines = await db
    .select()
    .from(magazines)
    .where(eq(magazines.isFeatured, true))
    .orderBy(asc(magazines.order), desc(magazines.createdAt))
    .limit(4);

  const activeCampaigns = await db
    .select()
    .from(homeCampaigns)
    .where(eq(homeCampaigns.isActive, true))
    .orderBy(desc(homeCampaigns.order), desc(homeCampaigns.createdAt));

  const team = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true))
    .orderBy(desc(teamMembers.order), desc(teamMembers.createdAt));

  const featuredVideos = await db
    .select()
    .from(videos)
    .where(eq(videos.isFeatured, true))
    .orderBy(asc(videos.order), desc(videos.createdAt))
    .limit(8);

  const latestPress = await db
    .select()
    .from(pressReleases)
    .where(eq(pressReleases.isPublished, true))
    .orderBy(desc(pressReleases.publishedAt), desc(pressReleases.createdAt))
    .limit(3);

  const siteSettings = await db
    .select()
    .from(settings)
    .where(eq(settings.group, "homepage"));

  // Map settings array to an object map for easy prop passing
  const settingsMap = siteSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <>
      <BackToTop />

      {/* 1. Hero Slider (Pass Dynamic payload) */}
      <Hero slidesData={activeSliders} />

      {/* 2. About Us & Leader Profiles */}
      <AboutAndLeaders team={team} settings={settingsMap} />

      {/* 3. Spotlight Campaigns */}
      <SpotlightCampaigns campaigns={activeCampaigns} />

      {/* 4. Mission Banner + Featured Videos */}
      <MissionAndVideos videos={featuredVideos} settings={settingsMap} />

      {/* 5. Latest Press Releases */}
      <LatestPressReleases
        items={latestPress.map((p) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          publishedAt: p.publishedAt,
        }))}
      />

      {/* 6. Magazines & Books Grid */}
      <PublicationsGrid booksData={featuredBooks} magazinesData={featuredMagazines} />

      {/* 7. Social Connect Banner */}
      <CTA settings={settingsMap} />
    </>
  );
}

export default function Home() {
  const jsonLd = webPageJsonLd({
    title: "Tanzeem-e-Islami — Home",
    description: "Islamic lectures, books, Quran education and organisational resources.",
    path: "/",
  });

  return (
    <>
      <Script
        id="jsonld-homepage"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      }>
        <HomeContent />
      </Suspense>
    </>
  );
}
