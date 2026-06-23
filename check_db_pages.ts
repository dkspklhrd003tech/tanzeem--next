import { db } from "./src/db";
import { pages } from "./src/db/schema";

async function run() {
  try {
    const allPages = await db.select().from(pages);
    console.log("--- PAGES IN DATABASE ---");
    allPages.forEach(p => {
      console.log(`ID: ${p.id} | Slug: ${p.slug} | Title: ${p.title} | Published: ${p.isPublished} | Template: ${p.template}`);
    });
    console.log("-------------------------");
  } catch (error) {
    console.error("Error reading database pages:", error);
  }
  process.exit(0);
}

run();
