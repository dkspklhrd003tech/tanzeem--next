import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function runMigration() {
    console.log('Starting direct MySQL migration...');
    
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log(`Adding "cover_image" column to book_categories table...`);
        await connection.execute(`ALTER TABLE book_categories ADD COLUMN cover_image text`);
        console.log(`Success: Added "cover_image" to book_categories.`);
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`Skip: "cover_image" already exists in book_categories.`);
        } else {
            console.error(`Error adding "cover_image":`, error.message);
        }
    }

    try {
        console.log(`Adding "order" column to book_categories table...`);
        await connection.execute(`ALTER TABLE book_categories ADD COLUMN \`order\` int NOT NULL DEFAULT 0`);
        console.log(`Success: Added "order" to book_categories.`);
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`Skip: "order" already exists in book_categories.`);
        } else {
            console.error(`Error adding "order":`, error.message);
        }
    }

    await connection.end();
    console.log('Migration finished.');
    process.exit(0);
}

runMigration().catch((err) => {
    console.error('Fatal Migration Error:', err);
    process.exit(1);
});
