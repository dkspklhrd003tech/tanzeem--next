import { db } from "../src/lib/db";
import { pages } from "../src/db/schema";

async function main() {
    const allPages = await db.select().from(pages);
    console.log(`Found ${allPages.length} pages in database.`);
    for (const page of allPages) {
        console.log(`ID: ${page.id} | Slug: ${page.slug} | Title: ${page.title}`);
    }
}

main().catch(console.error).finally(() => process.exit(0));
