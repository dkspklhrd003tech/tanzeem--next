import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

async function run(envFile) {
    dotenv.config({ path: envFile });
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: envFile === '.env.production' ? { rejectUnauthorized: false } : undefined
    });
    try {
        await conn.query('ALTER TABLE `team_members` ADD `button_name` varchar(191), ADD `button_url` varchar(255);');
        console.log(envFile, 'DB updated');
    } catch (e) {
        if(e.code === 'ER_DUP_FIELDNAME') console.log(envFile, 'DB already has columns');
        else console.error(envFile, 'DB error:', e);
    }
    await conn.end();
}

async function main() {
    await run('.env.local');
    await run('.env.production');
}

main();
