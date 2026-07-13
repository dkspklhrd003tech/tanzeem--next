import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';

async function run() {
    try {
        const res = await db.execute(sql`SHOW COLUMNS FROM khitab_audios`);
        console.log("Columns:", res[0]);
    } catch(e: any) {
        console.error("SQL ERROR:", e.message);
    }
    process.exit(0);
}
run();
