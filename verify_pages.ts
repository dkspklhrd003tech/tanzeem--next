import { db } from './src/db';
import { pages } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function verifyPage(slug: string) {
  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, slug),
  });
  if (page) {
    console.log(`SUCCESS: Page "${page.title}" found for slug "${slug}"`);
  } else {
    console.log(`FAILURE: Page NOT found for slug "${slug}"`);
  }
}

async function run() {
  await verifyPage('background');
  await verifyPage('organization');
  await verifyPage('audios');
  process.exit(0);
}

run();
