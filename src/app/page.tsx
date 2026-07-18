import { Suspense } from "react";
import { Hero } from "@/components/home/Hero";
import { AboutAndLeaders } from "@/components/home/AboutAndLeaders";
import { SpotlightCampaigns } from "@/components/home/SpotlightCampaigns";
import { MissionAndCampaigns } from "@/components/home/MissionAndCampaigns";
import { PublicationsGrid } from "@/components/home/PublicationsGrid";
import { CTA } from "@/components/home/CTA";
import { db } from "@/db";
import { homeSliders, books, magazines, teamMembers, homeCampaigns, services, videos, settings, pressReleases, campaigns } from "@/db/schema";
import { LatestPressReleases } from "@/components/home/LatestPressReleases";
import { DisclaimerPopup } from "@/components/home/DisclaimerPopup";
import { eq, desc, asc, inArray, or, and } from "drizzle-orm";
import { webPageJsonLd, buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Home",
  description:
    "Tanzeem-e-Islami is working to re-establish Khilafah following the methodology of Prophet Muhammad (SAWS). Access Islamic lectures, books, videos, and educational resources.",
  keywords: ["Tanzeem-e-Islami", "Dr. Israr Ahmed", "Islamic Lectures", "Khilafah", "Quran", "Hadith", "Islamic Education"],
  path: "/",
});

async function HomeContent() {
  let activeSliders: any[] = [];
  let featuredBooks: any[] = [];
  let featuredMagazines: any[] = [];
  let activeCampaigns: any[] = [];
  let team: any[] = [];
  let featuredCampaigns: any[] = [];
  let latestPress: any[] = [];
  let siteSettings: any[] = [];
  let platforms: any[] = [];

  try {
    activeSliders = await db
      .select()
      .from(homeSliders)
      .where(eq(homeSliders.isActive, true))
      .orderBy(asc(homeSliders.order), desc(homeSliders.createdAt));
  } catch (error) { console.error("Failed to fetch sliders:", error); }

  try {
    featuredBooks = await db
      .select()
      .from(books)
      .where(eq(books.isFeatured, true))
      .orderBy(asc(books.order), desc(books.createdAt))
      .limit(4);
  } catch (error) { console.error("Failed to fetch books:", error); }

  try {
    featuredMagazines = await db
      .select()
      .from(magazines)
      .where(eq(magazines.isFeatured, true))
      .orderBy(asc(magazines.order), desc(magazines.createdAt))
      .limit(4);
  } catch (error) { console.error("Failed to fetch magazines:", error); }

  try {
    activeCampaigns = [];

    const publishedServices = await db
      .select()
      .from(services)
      .where(eq(services.isPublished, true))
      .orderBy(asc(services.order), desc(services.createdAt));

    const publishedCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.isPublished, true))
      .orderBy(asc(campaigns.orderIndex), desc(campaigns.createdAt));

    const spotlightServices = publishedServices.filter(s => s.isSpotlight === true).map(s => {
      let fields = s.customFields as any;
      if (typeof fields === 'string') {
        try { fields = JSON.parse(fields); } catch (e) { fields = {}; }
      }
      return {
        id: s.id,
        title: s.title,
        imageUrl: s.imageUrl || "",
        linkUrl: s.slug.startsWith("http") ? s.slug : `/services/${s.slug}`,
        openInNewTab: fields?.openInNewTab || false,
        order: s.order,
        createdAt: s.createdAt,
      };
    });

    const spotlightCampaigns = publishedCampaigns.filter(c => {
      return c.categoryId === "SpotLight Campaigns";
    }).map(c => ({
      id: c.id,
      title: c.title,
      imageUrl: c.thumbnailUrl || "",
      linkUrl: c.slug.startsWith("http") ? c.slug : `/campaigns/${c.slug}`,
      openInNewTab: false,
      order: c.orderIndex || 0,
      createdAt: c.createdAt,
    }));

    activeCampaigns = [...activeCampaigns, ...spotlightServices, ...spotlightCampaigns].sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) { console.error("Failed to fetch campaigns or services:", error); }

  try {
    team = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))
      .orderBy(asc(teamMembers.order), desc(teamMembers.createdAt));
  } catch (error) { console.error("Failed to fetch team members:", error); }

  try {
    const featuredList = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.isPublished, true), eq(campaigns.isFeatured, true)))
      .orderBy(asc(campaigns.orderIndex), desc(campaigns.createdAt))
      .limit(8);

    featuredCampaigns = featuredList.map(c => ({
      id: c.id,
      title: c.title,
      linkUrl: c.slug.startsWith("http") ? c.slug : `/campaigns/${c.slug}`,
      imageUrl: c.thumbnailUrl || ""
    }));
  } catch (error) { console.error("Failed to fetch featured campaigns:", error); }

  try {
    latestPress = await db
      .select()
      .from(pressReleases)
      .where(eq(pressReleases.isPublished, true))
      .orderBy(desc(pressReleases.publishedAt), desc(pressReleases.createdAt))
      .limit(6);
  } catch (error) { console.error("Failed to fetch press releases:", error); }

  try {
    siteSettings = await db
      .select()
      .from(settings)
      .where(
        or(
          eq(settings.group, "homepage"),
          inArray(settings.key, ["disclaimer_enabled", "disclaimer_image"])
        )
      );
  } catch (error) { console.error("Failed to fetch settings:", error); }

  // Map settings array to an object map for easy prop passing
  const settingsMap = siteSettings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const bannerStyle = settingsMap.hero_banner_style || "slider";
  const finalSliders = bannerStyle === "fixed" && settingsMap.hero_fixed_image
    ? [{
      id: "fixed-banner",
      title: settingsMap.hero_fixed_title || "Homepage Banner",
      imageUrl: settingsMap.hero_fixed_image,
      linkUrl: settingsMap.hero_fixed_link || null,
      order: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    }]
    : activeSliders;

  if (settingsMap.homepage_social_links) {
    try {
      platforms = JSON.parse(settingsMap.homepage_social_links);
    } catch (e) {
      console.error("Failed to parse homepage_social_links", e);
    }
  } else {
    // legacy fallback
    platforms = [];
    if (settingsMap.youtube_url) platforms.push({ id: "youtube", name: "YouTube", slug: "youtube", url: settingsMap.youtube_url, themeColor: "#dc2626" });
    if (settingsMap.facebook_url) platforms.push({ id: "facebook", name: "Facebook", slug: "facebook", url: settingsMap.facebook_url, themeColor: "#2563eb" });
    if (settingsMap.twitter_url) platforms.push({ id: "twitter", name: "X (Twitter)", slug: "twitter", url: settingsMap.twitter_url, themeColor: "#000000" });
    if (settingsMap.whatsapp_url) platforms.push({ id: "whatsapp", name: "WhatsApp", slug: "whatsapp", url: settingsMap.whatsapp_url, themeColor: "#22c55e" });
  }

  return (
    <>
      {/* 0. Disclaimer Popup */}
      <DisclaimerPopup
        enabled={settingsMap.disclaimer_enabled === "true"}
        imageUrl={settingsMap.disclaimer_image || ""}
      />

      {/* 1. Hero Slider (Pass Dynamic payload) */}
      <Hero slidesData={finalSliders} />

      {/* 2. About Us & Leader Profiles */}
      <AboutAndLeaders team={team} settings={settingsMap} />

      {/* 3. Spotlight Campaigns */}
      <SpotlightCampaigns campaigns={activeCampaigns} />

      {/* 4. Mission Banner + Featured Campaigns */}
      <MissionAndCampaigns campaigns={featuredCampaigns} settings={settingsMap} />

      {/* 5. Latest Press Releases */}
      <LatestPressReleases
        items={latestPress.map((p) => ({
          id: p.id,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          slug: p.slug,
          publishedAt: p.publishedAt,
        }))}
      />

      {/* 6. Magazines & Books Grid */}
      <PublicationsGrid booksData={featuredBooks} magazinesData={featuredMagazines} />

      {/* 7. Social Connect Banner */}
      <CTA platforms={platforms} />
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
      <script
        id="jsonld-homepage"
        type="application/ld+json"
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
