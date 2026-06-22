import { db } from "../src/db";
import { pages } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function run() {
  const founder = await db.query.pages.findFirst({
    where: eq(pages.slug, "organization/the-founder"),
  });
  console.log("FOUNDER PAGE:", JSON.stringify(founder, null, 2));

  const ameer = await db.query.pages.findFirst({
    where: eq(pages.slug, "organization/the-ameer"),
  });
  console.log("AMEER PAGE:", JSON.stringify(ameer, null, 2));

  process.exit(0);
}

run();
