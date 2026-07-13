import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function run() {
  try {
    await db.execute(sql`ALTER TABLE audio ADD COLUMN \`pdf_url\` text;`);
    console.log("Successfully added column `pdf_url` to audio");
  } catch (e) {
    console.log("Error or column exists:", e.message);
  }
  process.exit(0);
}
run();
