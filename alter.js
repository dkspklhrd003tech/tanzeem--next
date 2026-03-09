import mysql from 'mysql2/promise';

async function run() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: 'tanzeemnxt_db'
        });
        console.log("Adding is_featured to magazines table...");
        await connection.execute('ALTER TABLE `magazines` ADD COLUMN `is_featured` boolean NOT NULL DEFAULT false');
        console.log("Success.");
    } catch (e) {
        if (e.message.includes('Duplicate column name')) {
            console.log('Column already exists.');
        } else {
            console.error(e);
        }
    }
    process.exit(0);
}

run();
