
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

async function updatePassword() {
    const poolConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const email = 'tanzeem@dmin';
    const hash = '$2b$10$VvHOvZM81MYUePOuyi03TOzqM2F/Sm//91WliTsz4QxYab6L3leTO';

    try {
        const [result] = await poolConnection.execute('UPDATE users SET password = ? WHERE email = ?', [hash, email]);
        console.log("Update result:", result);
    } catch (error) {
        console.error("Update error:", error);
    } finally {
        await poolConnection.end();
    }
}

updatePassword();
