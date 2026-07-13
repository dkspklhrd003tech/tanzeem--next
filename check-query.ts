import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';

async function run() {
    try {
        const query = sql`select id, category_id, title, title_urdu, slug, excerpt, description, audio_url, file_size, is_published, play_count, download_count, share_count, published_at, meta_title, meta_description, \`order\`, created_at, updated_at from khitab_audios where khitab_audios.is_published = true order by khitab_audios.order asc, khitab_audios.published_at desc`;
        const res = await db.execute(query);
        console.log("Success! Rows:", res[0].length);
    } catch(e: any) {
        console.error("SQL ERROR:", e.message);
    }
    process.exit(0);
}
run();
