import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { magazines } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Newspaper, Download, BookOpen, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Magazines | Tanzeem-e-Islami",
  description:
    "Read Tanzeem-e-Islami's monthly and quarterly magazines — Meesaq, Hikmat-e-Quran, Nida-e-Khilafat, and Perspective.",
  keywords: ["Tanzeem magazines", "Meesaq", "Hikmat-e-Quran", "Nida-e-Khilafat", "Perspective", "Islamic magazine"],
};

const SERIES_CONFIG: Record<string, { title: string; desc: string; slug: string }> = {
  meesaq: { title: "Meesaq", desc: "Monthly Magazine", slug: "meesaq" },
  "hikmat-e-quran": { title: "Hikmat-e-Quran", desc: "Quranic Studies", slug: "hikmat-e-quran" },
  "nida-e-khilafat": { title: "Nida-e-Khilafat", desc: "Policy & Khilafah", slug: "nida-e-khilafat" },
  perspective: { title: "Perspective", desc: "English Quarterly", slug: "perspective" },
  other: { title: "Other Magazines", desc: "Special Publications", slug: "" },
};

function getCategoryKey(item: { title: string; slug: string; description?: string | null }) {
  const str = `${item.title} ${item.slug} ${item.description || ""}`.toLowerCase();
  if (str.includes("meesaq") || str.includes("messaq") || str.includes("میثاق")) return "meesaq";
  if (str.includes("hikmat") || str.includes("حکمت")) return "hikmat-e-quran";
  if (str.includes("nida") || str.includes("khilafat") || str.includes("ندائے")) return "nida-e-khilafat";
  if (str.includes("perspective") || str.includes("پراسپیکٹیو")) return "perspective";
  return "other";
}

export default async function MagazinesPage() {
  const items = await db
    .select()
    .from(magazines)
    .where(eq(magazines.isPublished, true))
    .orderBy(desc(magazines.publishDate), desc(magazines.createdAt));

  // Categorize published magazines into proper series categories
  const grouped: Record<string, typeof items> = {
    meesaq: [],
    "hikmat-e-quran": [],
    "nida-e-khilafat": [],
    perspective: [],
    other: [],
  };

  for (const item of items) {
    const key = getCategoryKey(item);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  const categoryKeys = ["meesaq", "hikmat-e-quran", "nida-e-khilafat", "perspective", "other"];

  return (
    <main className="bg-background min-h-screen">
      <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Magazines</h1>
          <p className="text-foreground-muted text-sm sm:text-base max-w-3xl">
            Books and literature of Tanzeem-e-Islami &amp; Anjuman Khuddam ul Quran
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-foreground-muted text-lg">No magazines available yet.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {categoryKeys.map((seriesKey) => {
              const issues = grouped[seriesKey] || [];
              if (issues.length === 0) return null;
              const config = SERIES_CONFIG[seriesKey] || { title: seriesKey, desc: "", slug: seriesKey };

              return (
                <section key={seriesKey} className="space-y-6">
                  {/* Category Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border/60 pb-3 gap-2">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground tracking-tight">{config.title}</h2>
                      {config.desc && <p className="text-xs text-foreground-muted mt-0.5">{config.desc}</p>}
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {issues.length} issue{issues.length !== 1 ? "s" : ""}
                      </span>
                      {config.slug && (
                        <Link
                          href={`/resources/magazines/${config.slug}`}
                          className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                        >
                          View Category <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Issues Grid (No limit) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {issues.map((mag) => (
                      <div key={mag.id} className="group flex flex-col items-center gap-2">
                        {/* Cover image container */}
                        <div
                          className="w-full rounded-xl overflow-hidden border border-border bg-muted shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1.5 relative"
                          style={{ aspectRatio: "3/4" }}
                        >
                          {mag.coverImage ? (
                            <img
                              src={mag.coverImage}
                              alt={`${mag.title}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                              <BookOpen className="h-8 w-8 text-primary/30" />
                            </div>
                          )}
                        </div>

                        {/* Issue Title */}
                        <p className="text-xs font-semibold text-foreground text-center truncate max-w-full group-hover:text-primary transition-colors mt-1">
                          {mag.title}
                        </p>

                        {/* Issue number */}
                        {mag.issueNumber && (
                          <p className="text-[10px] text-foreground-muted text-center font-medium italic">
                            {mag.issueNumber}
                          </p>
                        )}

                        {/* Download button */}
                        {mag.fileUrl && (
                          <a
                            href={mag.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary border border-primary/30 rounded-full px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors mt-0.5"
                            aria-label={`Download ${mag.title}`}
                          >
                            <Download className="h-2.5 w-2.5" />
                            Download PDF
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Links to specific magazine category pages */}
        <nav className="mt-16 pt-8 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: "/resources/magazines/meesaq", label: "Meesaq", desc: "Monthly magazine" },
            { href: "/resources/magazines/hikmat-e-quran", label: "Hikmat-e-Quran", desc: "Quranic studies" },
            { href: "/resources/magazines/nida-e-khilafat", label: "Nida-e-Khilafat", desc: "Policy & Khilafah" },
            { href: "/resources/magazines/perspective", label: "Perspective", desc: "English quarterly" },
          ].map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
            >
              <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{s.label}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{s.desc}</p>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
