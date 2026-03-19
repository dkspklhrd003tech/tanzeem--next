
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });

async function checkLogs() {
    const poolConnection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const [rows] = await poolConnection.execute('SELECT user_agent, created_at, details FROM activity_logs WHERE action = "update" AND entity_type = "settings" ORDER BY created_at DESC LIMIT 10');
        console.log(JSON.stringify(rows, null, 2));
    } catch (error) {
        console.error("Query error:", error);
    } finally {
        await poolConnection.end();
    }
}

checkLogs();
