import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { magazines } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { Newspaper, Download, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Magazines | Tanzeem-e-Islami",
  description:
    "Read Tanzeem-e-Islami's monthly and quarterly magazines — Meesaq, Hikmat-e-Quran, Nida-e-Khilafat, and Perspective.",
  keywords: ["Tanzeem magazines", "Meesaq", "Hikmat-e-Quran", "Nida-e-Khilafat", "Islamic magazine"],
};

export default async function MagazinesPage() {
  const items = await db
    .select()
    .from(magazines)
    .where(eq(magazines.isPublished, true))
    .orderBy(asc(magazines.order), desc(magazines.createdAt));

  // Group by title (each distinct magazine title is a publication series)
  const grouped = items.reduce<Record<string, typeof items>>((acc, m) => {
    const key = m.title;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-10">
          <p className="section-label mb-1">Our Magazines</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Publications &amp; Periodicals
          </h1>
          <p className="text-foreground-muted max-w-2xl">
            Books and literature of Tanzeem-e-Islami &amp; Anjuman Khuddam ul Quran
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-foreground-muted">No magazines available yet.</p>
          </div>
        ) : (
          <div className="space-y-14">
            {Object.entries(grouped).map(([series, issues]) => (
              <section key={series}>
                <div className="flex items-end justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">{series}</h2>
                  <span className="text-sm text-foreground-muted">{issues.length} issue{issues.length !== 1 ? "s" : ""}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                  {issues.map((mag) => (
                    <div key={mag.id} className="group flex flex-col items-center gap-2">
                      {/* Cover */}
                      <div
                        className="w-full rounded-xl overflow-hidden border border-border bg-muted shadow-sm group-hover:shadow-deep transition-all duration-300 group-hover:-translate-y-1.5"
                        style={{ aspectRatio: "3/4" }}
                      >
                        {mag.coverImage ? (
                          <img
                            src={mag.coverImage}
                            alt={`${mag.title} ${mag.issueNumber ?? ""}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <BookOpen className="h-8 w-8 text-primary/30" />
                          </div>
                        )}
                      </div>

                      {/* Issue label */}
                      {mag.issueNumber && (
                        <p className="text-[10px] text-foreground-muted text-center font-medium italic">
                          {mag.issueNumber}
                        </p>
                      )}

                      {/* Download */}
                      {mag.fileUrl && (
                        <a
                          href={mag.fileUrl}
                          download
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary border border-primary/30 rounded-full px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                          aria-label={`Download ${mag.title} ${mag.issueNumber ?? ""}`}
                        >
                          <Download className="h-2.5 w-2.5" />
                          Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Links to specific magazine series pages */}
        <nav className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { href: "/meesaq",          label: "Meesaq",          desc: "Monthly magazine" },
            { href: "/hikmat-e-quran",  label: "Hikmat-e-Quran",  desc: "Quranic studies" },
            { href: "/nida-e-khilafat", label: "Nida-e-Khilafat", desc: "Policy & Khilafah" },
            { href: "/perspective",     label: "Perspective",     desc: "English quarterly" },
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
