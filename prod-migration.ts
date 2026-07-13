import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function run() {
  try {
    await db.execute(sql`ALTER TABLE khitab_audios ADD COLUMN \`order\` int NOT NULL DEFAULT 0;`);
    console.log("Successfully added column `order`");
  } catch (e) {
    console.log("Error or column exists:", e.message);
  }
  process.exit(0);
}
run();
