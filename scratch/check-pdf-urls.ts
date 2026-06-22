import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../src/db/schema';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "tanzeemnxt_db",
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

    const db = drizzle({ client: pool, schema, mode: "default" });
    const pressReleases = await db.query.pressReleases.findMany();
    console.log("Press Releases Count:", pressReleases.length);
    for (const pr of pressReleases) {
        console.log(`- Title: "${pr.title}", pdfUrl: "${pr.pdfUrl}", isPublished: ${pr.isPublished}`);
    }
    await pool.end();
}

main().catch(console.error);
