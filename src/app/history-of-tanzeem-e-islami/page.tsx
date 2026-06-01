import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const metadata = { title: "History of Tanzeem-e-Islami" };
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, "history-of-tanzeem-e-islami"),
  });

  if (!page?.isPublished) {
    notFound();
  }

  return (
    <main className="container mx-auto py-12 md:py-16 px-4 max-w-4xl">
      <h1 className="font-amiri text-3xl md:text-4xl font-bold text-primary mb-6">{page.title}</h1>
      {page.featuredImage && (
        <img
          src={page.featuredImage}
          alt={page.title}
          className="w-full rounded-md mb-8 aspect-video object-cover"
        />
      )}
      <article
        className="prose-tanzeem dynamic-content leading-relaxed"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </main>
  );
}
