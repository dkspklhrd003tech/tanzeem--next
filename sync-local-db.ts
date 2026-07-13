import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "tanzeemnxt_db",
    });

    const db = drizzle({ client: pool });

    const queries = [
        `ALTER TABLE audio_books ADD COLUMN author_name varchar(255);`,
        `ALTER TABLE audio ADD COLUMN file_size int DEFAULT 0;`,
        `ALTER TABLE audio ADD COLUMN play_count int DEFAULT 0;`,
        `ALTER TABLE audio ADD COLUMN download_count int DEFAULT 0;`,
        `ALTER TABLE audio ADD COLUMN share_count int DEFAULT 0;`,
        `ALTER TABLE videos ADD COLUMN file_size int DEFAULT 0;`,
        `ALTER TABLE videos ADD COLUMN play_count int DEFAULT 0;`,
        `ALTER TABLE videos ADD COLUMN download_count int DEFAULT 0;`,
        `ALTER TABLE videos ADD COLUMN share_count int DEFAULT 0;`,
        `ALTER TABLE magazines ADD COLUMN file_size int DEFAULT 0;`,
        `ALTER TABLE magazines ADD COLUMN play_count int DEFAULT 0;`,
        `ALTER TABLE magazines ADD COLUMN download_count int DEFAULT 0;`,
        `ALTER TABLE magazines ADD COLUMN share_count int DEFAULT 0;`,
        `ALTER TABLE books ADD COLUMN file_size int DEFAULT 0;`,
        `ALTER TABLE books ADD COLUMN play_count int DEFAULT 0;`,
        `ALTER TABLE books ADD COLUMN download_count int DEFAULT 0;`,
        `ALTER TABLE books ADD COLUMN share_count int DEFAULT 0;`,
        `ALTER TABLE audio_books ADD COLUMN file_size int DEFAULT 0;`,
        `ALTER TABLE audio_books ADD COLUMN play_count int DEFAULT 0;`,
        `ALTER TABLE audio_books ADD COLUMN download_count int DEFAULT 0;`,
        `ALTER TABLE audio_books ADD COLUMN share_count int DEFAULT 0;`,
        `ALTER TABLE khitab_audios ADD COLUMN file_size int DEFAULT 0;`,
        `ALTER TABLE khitab_audios ADD COLUMN play_count int DEFAULT 0;`,
        `ALTER TABLE khitab_audios ADD COLUMN download_count int DEFAULT 0;`,
        `ALTER TABLE khitab_audios ADD COLUMN share_count int DEFAULT 0;`,
    ];

    for (const q of queries) {
        try {
            await db.execute(sql.raw(q));
            console.log("Success:", q);
        } catch(e: any) {
            console.error("Error or already exists:", e.message);
        }
    }
    
    console.log("Done syncing local DB!");
    process.exit(0);
}

run();
