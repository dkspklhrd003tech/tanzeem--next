import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { magazines, settings } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { Newspaper, Download, BookOpen, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Magazines | Tanzeem-e-Islami",
  description:
    "Read Tanzeem-e-Islami's monthly and quarterly magazines — Meesaq, Hikmat-e-Quran, Nida-e-Khilafat, and Perspective.",
  keywords: ["Tanzeem magazines", "Meesaq", "Hikmat-e-Quran", "Nida-e-Khilafat", "Perspective", "Islamic magazine"],
};

const SERIES_CONFIG: Record<string, { title: string; desc: string; slug: string; pageId: string }> = {
  meesaq: { title: "Meesaq", desc: "Monthly Magazine", slug: "meesaq", pageId: "31c629e7-cad9-41e8-8c3f-ca442337925c" },
  "hikmat-e-quran": { title: "Hikmat-e-Quran", desc: "Quranic Studies", slug: "hikmat-e-quran", pageId: "94a5dcc9-70c6-46aa-88f0-3334f1716b36" },
  "nida-e-khilafat": { title: "Nida-e-Khilafat", desc: "Policy & Khilafah", slug: "nida-e-khilafat", pageId: "74417c7d-4664-479c-890c-07073e9f8510" },
  perspective: { title: "Perspective", desc: "English Quarterly", slug: "perspective", pageId: "a1bc3371-0e89-4662-8440-3794ebccc9f3" },
};

export type UnifiedMagazineCard = {
  id: string;
  title: string;
  slug?: string;
  url?: string | null;
  coverImage?: string | null;
  fileUrl?: string | null;
  issueNumber?: string | null;
};

export default async function MagazinesPage() {
  // 1. Fetch setting links configured for all 4 magazine pages
  const settingKeys = Object.values(SERIES_CONFIG).map((c) => `magazine_links_${c.pageId}`);
  const settingRows = await db.select().from(settings).where(inArray(settings.key, settingKeys));

  const settingLinksBySeries: Record<string, UnifiedMagazineCard[]> = {
    meesaq: [],
    "hikmat-e-quran": [],
    "nida-e-khilafat": [],
    perspective: [],
  };

  for (const [seriesKey, config] of Object.entries(SERIES_CONFIG)) {
    const keyName = `magazine_links_${config.pageId}`;
    const row = settingRows.find((r) => r.key === keyName);
    if (row && row.value) {
      try {
        const parsed = JSON.parse(row.value);
        if (Array.isArray(parsed)) {
          settingLinksBySeries[seriesKey] = parsed
            .filter((item: any) => item.isActive !== false)
            .map((item: any) => ({
              id: item.id || item.slug || item.title,
              title: item.title,
              slug: item.slug,
              url: item.url,
              fileUrl: item.url,
            }));
        }
      } catch (err) {
        console.error(`Failed to parse setting ${keyName}:`, err);
      }
    }
  }

  // 2. Fetch database table magazine items
  const dbItems = await db
    .select()
    .from(magazines)
    .where(eq(magazines.isPublished, true))
    .orderBy(desc(magazines.publishDate), desc(magazines.createdAt));

  const dbGrouped: Record<string, UnifiedMagazineCard[]> = {
    meesaq: [],
    "hikmat-e-quran": [],
    "nida-e-khilafat": [],
    perspective: [],
  };

  for (const item of dbItems) {
    const str = `${item.title} ${item.slug} ${item.description || ""}`.toLowerCase();
    let key = "meesaq";
    if (str.includes("hikmat") || str.includes("حکمت")) key = "hikmat-e-quran";
    else if (str.includes("nida") || str.includes("khilafat") || str.includes("ندائے")) key = "nida-e-khilafat";
    else if (str.includes("perspective") || str.includes("پراسپیکٹیو")) key = "perspective";

    if (dbGrouped[key]) {
      dbGrouped[key].push({
        id: item.id,
        title: item.title,
        slug: item.slug,
        coverImage: item.coverImage,
        fileUrl: item.fileUrl,
        issueNumber: item.issueNumber,
      });
    }
  }

  // 3. Merge both setting links and db items for each series
  const seriesKeys = ["meesaq", "hikmat-e-quran", "nida-e-khilafat", "perspective"];
  const finalGrouped: Record<string, UnifiedMagazineCard[]> = {};

  for (const key of seriesKeys) {
    const settingCards = settingLinksBySeries[key] || [];
    const tableCards = dbGrouped[key] || [];

    // Combine, avoiding duplicates by title or slug
    const combinedMap = new Map<string, UnifiedMagazineCard>();
    for (const card of settingCards) {
      combinedMap.set(card.title.toLowerCase().trim(), card);
    }
    for (const card of tableCards) {
      const titleKey = card.title.toLowerCase().trim();
      if (!combinedMap.has(titleKey)) {
        combinedMap.set(titleKey, card);
      }
    }

    finalGrouped[key] = Array.from(combinedMap.values());
  }

  const hasAnyItems = seriesKeys.some((k) => finalGrouped[k].length > 0);

  return (
    <main className="bg-background min-h-screen">
      <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Magazines</h1>
          <p className="text-foreground-muted text-sm sm:text-base max-w-3xl">
            Books and literature of Tanzeem-e-Islami &amp; Anjuman Khuddam ul Quran
          </p>
        </div>

        {!hasAnyItems ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-foreground-muted text-lg">No magazines available yet.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {seriesKeys.map((seriesKey) => {
              const issues = finalGrouped[seriesKey] || [];
              if (issues.length === 0) return null;
              const config = SERIES_CONFIG[seriesKey];

              return (
                <section key={seriesKey} className="space-y-6">
                  {/* Category Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 pb-3 gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground tracking-tight">{config.title}</h2>
                      {config.desc && <p className="text-xs text-foreground-muted mt-0.5">{config.desc}</p>}
                    </div>

                    {/* Section Action Button */}
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="rounded-full gap-1 border-primary/40 text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold">
                        <Link href={`/${config.slug}`}>
                          View {config.title} Page <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Issues Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {issues.map((mag) => {
                      const detailHref = mag.slug ? `/magazines/${mag.slug}` : mag.url || mag.fileUrl || "#";

                      return (
                        <div
                          key={mag.id}
                          className="group relative flex flex-col justify-between p-5 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300"
                        >
                          <div>
                            {/* Title */}
                            <h3 className="text-base font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {mag.title}
                            </h3>

                            {mag.issueNumber && (
                              <p className="text-xs text-foreground-muted mb-3 font-medium">
                                Issue {mag.issueNumber}
                              </p>
                            )}
                          </div>

                          {/* Action Link / Download */}
                          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                            <Link
                              href={detailHref}
                              target={mag.url && !mag.slug ? "_blank" : undefined}
                              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                            >
                              Read / View <ChevronRight className="h-3 w-3" />
                            </Link>

                            {(mag.fileUrl || mag.url) && (
                              <a
                                href={mag.fileUrl || mag.url || ""}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary/80 hover:text-primary border border-primary/20 rounded-full px-2.5 py-0.5 hover:bg-primary/10 transition-colors"
                                aria-label={`Download ${mag.title}`}
                              >
                                <Download className="h-3 w-3" />
                                PDF
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Navigation cards for 4 magazine categories */}
        <nav className="mt-16 pt-8 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: "/meesaq", label: "Meesaq", desc: "Monthly magazine" },
            { href: "/hikmat-e-quran", label: "Hikmat-e-Quran", desc: "Quranic studies" },
            { href: "/nida-e-khilafat", label: "Nida-e-Khilafat", desc: "Policy & Khilafah" },
            { href: "/perspective", label: "Perspective", desc: "English quarterly" },
          ].map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors flex items-center justify-between">
                <span>{s.label}</span>
                <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-xs text-foreground-muted mt-0.5">{s.desc}</p>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
