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

    const tables = ['books', 'magazines', 'videos'];

    for (const table of tables) {
        try {
            console.log(`Adding "order" column to ${table} table...`);
            await connection.execute(`ALTER TABLE ${table} ADD COLUMN \`order\` int NOT NULL DEFAULT 0`);
            console.log(`Success: Added "order" to ${table}.`);
        } catch (error: any) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log(`Skip: "order" already exists in ${table}.`);
            } else {
                console.error(`Error adding "order" to ${table}:`, error.message);
            }
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
