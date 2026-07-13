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
        `ALTER TABLE khitab_audios ADD COLUMN \`order\` int NOT NULL DEFAULT 0;`,
        `ALTER TABLE khitab_audios ADD COLUMN file_size int;`,
        `ALTER TABLE khitab_audios ADD COLUMN play_count int NOT NULL DEFAULT 0;`,
        `ALTER TABLE khitab_audios ADD COLUMN download_count int NOT NULL DEFAULT 0;`,
        `ALTER TABLE khitab_audios ADD COLUMN share_count int NOT NULL DEFAULT 0;`
    ];

    for (const q of queries) {
        try {
            await db.execute(sql.raw(q));
            console.log("Success:", q);
        } catch(e: any) {
            console.error("Error or already exists:", e.message);
        }
    }
    
    console.log("Done syncing khitab_audios to local DB!");
    process.exit(0);
}

run();
