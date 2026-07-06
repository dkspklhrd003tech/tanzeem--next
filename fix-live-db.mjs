import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function fixLive() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await connection.query('ALTER TABLE `book_categories` ADD `urdu_name` varchar(191);');
        console.log("Successfully added urdu_name to live DB!");
    } catch (e) {
        console.error("Failed:", e);
    } finally {
        await connection.end();
    }
}
fixLive();
