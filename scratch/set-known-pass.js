const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

async function run() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });

    const email = 'hassan@tanzeem.org';
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);

    try {
        const [result] = await conn.execute('UPDATE users SET password = ? WHERE email = ?', [hash, email]);
        console.log("Updated hassan's password to admin123. Rows affected:", result.affectedRows);
    } catch (err) {
        console.error("Error updating password:", err);
    } finally {
        await conn.end();
    }
}

run();
