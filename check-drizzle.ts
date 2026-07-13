import { db } from './src/lib/db';
import { khitabAudios } from './src/db/schema';
import { eq, asc, desc } from 'drizzle-orm';

async function run() {
    try {
        const allSermons = await db
            .select()
            .from(khitabAudios)
            .where(eq(khitabAudios.isPublished, true))
            .orderBy(asc(khitabAudios.order), desc(khitabAudios.publishedAt));
        console.log("Success! Rows:", allSermons.length);
    } catch(e: any) {
        console.error("DRIZZLE ERROR:", e.message);
    }
    process.exit(0);
}
run();
