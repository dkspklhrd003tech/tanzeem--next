import { db } from "@/lib/db";
import { pages, settings } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MagazineClientView } from "./MagazineClientView";

export async function MagazineFrontendView({ pageId, slug }: { pageId: string, slug: string }) {
  const [page] = await db.select().from(pages).where(or(eq(pages.id, pageId), eq(pages.slug, slug))).limit(1);

  if (!page || !page.isPublished) notFound();

  const [setting] = await db.select().from(settings).where(eq(settings.key, `magazine_links_${page.id}`)).limit(1);

  let links = [];
  if (setting && setting.value) {
    try {
      links = JSON.parse(setting.value).filter((l: any) => l.isActive);
    } catch { }
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto">
        <MagazineClientView links={links} />
      </div>
    </main>
  );
}
