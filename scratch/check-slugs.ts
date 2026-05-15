import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkDuplicates() {
  try {
    const allPages = await db.query.pages.findMany();
    const slugMap = new Map();
    const duplicates: { slug: string; firstId: any; secondId: string }[] = [];

    for (const page of allPages) {
      if (slugMap.has(page.slug)) {
        duplicates.push({
          slug: page.slug,
          firstId: slugMap.get(page.slug),
          secondId: page.id,
        });
      } else {
        slugMap.set(page.slug, page.id);
      }
    }

    if (duplicates.length > 0) {
      console.log("Found duplicate slugs:");
      console.table(duplicates);
    } else {
      console.log("No duplicate slugs found.");
      console.log(`Checked ${allPages.length} pages.`);
    }
  } catch (err) {
    console.error("Error checking duplicates:", err);
  }
  process.exit(0);
}

checkDuplicates();
