import { db } from './src/db/index';
import { pages, pageSections } from './src/db/schema';
import { eq } from 'drizzle-orm';
async function main() {
  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, 'policy')
  });
  console.log("Page:", JSON.stringify(page, null, 2));

  if (page) {
    const sections = await db.query.pageSections.findMany({
      where: eq(pageSections.pageId, page.id)
    });
    console.log("Sections count:", sections.length);
  }

  process.exit(0);
}
main();
