import Link from "next/link";
import { db } from "@/lib/db";
import { audio, audioCategories } from "@/db/schema";
import { eq, asc, like, count } from "drizzle-orm";
import { Headphones, Download, PlayCircle } from "lucide-react";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600; // 1 hour ISR

export const metadata = buildMetadata({
  title: "Audio Books",
  description: "Listen to and download Islamic audio books by Dr. Israr Ahmed — Bayan-ul-Quran, Seerah, Tasheel-ul-Quran, and more.",
  path: "/audio-books",
  keywords: ["Islamic audio books", "Bayan ul Quran audio", "Dr. Israr Ahmed audio", "Tanzeem audio"],
});

export default async function AudioBooksPage() {
  // Find the "Audio Books" category if it exists, otherwise show all audio
  const audioBooksCategory = await db.query.audioCategories.findFirst({
    where: like(audioCategories.name, "%audio%book%"),
  });

  const items = await db.query.audio.findMany({
    where: eq(audio.isPublished, true),
    with: { category: true, speaker: true },
    orderBy: (a, { desc }) => [desc(a.createdAt)],
    limit: 24,
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-12 md:py-16 px-4">

        {/* Header */}
        <div className="mb-10">
          <p className="section-label mb-2">Audio Library</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Audio Books</h1>
          <p className="text-lg text-foreground-muted max-w-2xl">
            Explore our collection of audio books covering Quranic studies, Seerah, and Islamic thought
            by Dr. Israr Ahmed and other scholars of Tanzeem-e-Islami.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <Headphones className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-foreground-muted mb-4">No audio books available yet.</p>
            <Link href="/audio" className="text-primary font-medium hover:underline">
              Browse all audio lectures →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/audio/${item.slug}`}
                className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-mid hover:border-primary/30 transition-all hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <Headphones className="h-10 w-10 text-primary/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-white" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-1">
                    {item.title}
                  </h3>
                  {item.speaker && (
                    <p className="text-xs text-foreground-muted">{item.speaker.name}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-foreground-muted">
                    {item.playCount > 0 && (
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" /> {item.playCount.toLocaleString()}
                      </span>
                    )}
                    {item.downloadCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" /> {item.downloadCount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Link to full audio library */}
        <div className="mt-10 text-center">
          <Link
            href="/audio"
            className="inline-flex items-center gap-2 border border-primary text-primary rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Browse Full Audio Library →
          </Link>
        </div>
      </div>
    </main>
  );
}
