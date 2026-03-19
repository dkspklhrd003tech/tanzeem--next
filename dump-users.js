
const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

async function dumpUsers() {
    const poolConnection = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

    try {
        const [rows] = await poolConnection.execute('SELECT id, email, name, role FROM users');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error("DB Error:", error);
    } finally {
        await poolConnection.end();
    }
}

dumpUsers();
