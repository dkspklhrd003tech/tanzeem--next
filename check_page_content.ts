import { db } from "./src/db";
import { pages } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  try {
    const ameer = await db.query.pages.findFirst({ where: eq(pages.slug, "organization/the-ameer") });
    const founder = await db.query.pages.findFirst({ where: eq(pages.slug, "organization/the-founder") });

    if (ameer) {
      console.log("=== AMEER ===");
      console.log("Title:", ameer.title);
      console.log("Excerpt:", ameer.excerpt);
      console.log("FeaturedImage:", ameer.featuredImage);
      console.log("Content:", ameer.content);
    }
    if (founder) {
      console.log("\n=== FOUNDER ===");
      console.log("Title:", founder.title);
      console.log("Excerpt:", founder.excerpt);
      console.log("FeaturedImage:", founder.featuredImage);
      console.log("Content:", founder.content);
    }
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

run();
