import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function migrateData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Starting data migration...");

        // 1. Copy Categories
        await connection.query(`
            INSERT IGNORE INTO khitab_audio_categories (id, name, urdu_name, slug, description, \`order\`, created_at, updated_at)
            SELECT id, name, urdu_name, slug, description, \`order\`, created_at, updated_at
            FROM sermon_categories;
        `);
        console.log("✅ Copied categories to khitab_audio_categories.");

        // 2. Copy Audios (from sermons table)
        // sermons table has: id, category_id, title, title_urdu, slug, excerpt, description, video_url (maybe audioUrl instead?), is_published, published_at, created_at, updated_at
        // Check if `video_url` or `audio_url` exists in sermons
        
        let urlColumn = "''";
        try {
            const [cols] = await connection.query("SHOW COLUMNS FROM sermons LIKE 'video_url'");
            if (cols.length > 0) {
                urlColumn = 'video_url';
            } else {
                const [colsAudio] = await connection.query("SHOW COLUMNS FROM sermons LIKE 'audio_url'");
                if (colsAudio.length > 0) {
                    urlColumn = 'audio_url';
                }
            }
        } catch (e) {
            console.warn("Could not determine url column in sermons table.");
        }

        await connection.query(`
            INSERT IGNORE INTO khitab_audios (id, category_id, title, title_urdu, slug, excerpt, description, audio_url, is_published, published_at, created_at, updated_at)
            SELECT id, category_id, title, title_urdu, slug, excerpt, description, ${urlColumn} as audio_url, is_published, published_at, created_at, updated_at
            FROM sermons;
        `);
        console.log("✅ Copied sermons to khitab_audios.");

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await connection.end();
    }
}

migrateData();
