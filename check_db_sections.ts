import { db } from "./src/db";
import { pages, pageSections } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  try {
    const ameer = await db.query.pages.findFirst({ where: eq(pages.slug, "organization/the-ameer") });
    const founder = await db.query.pages.findFirst({ where: eq(pages.slug, "organization/the-founder") });

    if (ameer) {
      const sections = await db.query.pageSections.findMany({ where: eq(pageSections.pageId, ameer.id) });
      console.log(`--- AMEER SECTIONS (${sections.length}) ---`);
      sections.forEach(s => console.log(`Type: ${s.type} | Order: ${s.order} | Active: ${s.isActive} | Config:`, JSON.stringify(s.config)));
    }
    if (founder) {
      const sections = await db.query.pageSections.findMany({ where: eq(pageSections.pageId, founder.id) });
      console.log(`--- FOUNDER SECTIONS (${sections.length}) ---`);
      sections.forEach(s => console.log(`Type: ${s.type} | Order: ${s.order} | Active: ${s.isActive} | Config:`, JSON.stringify(s.config)));
    }
  } catch (error) {
    console.error("Error reading database sections:", error);
  }
  process.exit(0);
}

run();
