import { db } from "../src/db";
import { pages, pageSections } from "../src/db/schema";
import { eq, like } from "drizzle-orm";

async function run() {
  console.log("=== INSPECTING PAGES ===");
  const allPages = await db.query.pages.findMany();
  for (const page of allPages) {
    if (page.slug.includes("ameer") || page.slug.includes("founder")) {
      console.log(`\nPage ID: ${page.id}`);
      console.log(`Title: ${page.title}`);
      console.log(`Slug: ${page.slug}`);
      console.log(`Template: ${page.template}`);
      console.log(`isPublished: ${page.isPublished} (${typeof page.isPublished})`);
      console.log(`Featured Image: ${page.featuredImage}`);
      console.log(`Excerpt: ${page.excerpt}`);
      console.log(`Content length: ${page.content?.length || 0}`);
      console.log(`Content snippet: ${page.content?.substring(0, 200)}...`);
      
      const sections = await db.query.pageSections.findMany({
        where: eq(pageSections.pageId, page.id),
      });
      console.log(`Number of sections: ${sections.length}`);
      for (const section of sections) {
        console.log(`- Section ID: ${section.id}, Type: ${section.type}, Order: ${section.order}, Active: ${section.isActive}`);
        console.log(`  Config: ${JSON.stringify(section.config)}`);
      }
    }
  }
  process.exit(0);
}

run();
