import { db } from './src/db';
import { pages } from './src/db/schema';

async function checkPages() {
  try {
    const allPages = await db.select().from(pages);
    console.log(`Found ${allPages.length} pages in database:`);
    allPages.forEach(p => {
      console.log(`- ${p.title} (${p.slug})`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkPages();
