import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function testLive() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });
    try {
        const [rows] = await connection.query('SHOW COLUMNS FROM `book_categories`;');
        console.log("book_categories columns:");
        console.log(rows.map(r => r.Field));

        const [rows2] = await connection.query('SHOW COLUMNS FROM `books`;');
        console.log("books columns:");
        console.log(rows2.map(r => r.Field));
    } catch (e) {
        console.error("Live failed:", e);
    } finally {
        await connection.end();
    }
}
testLive();
