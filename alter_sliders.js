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
        console.log("Creating home_sliders table if not exists...");
        await connection.execute(`
    CREATE TABLE IF NOT EXISTS \`home_sliders\` (
      \`id\` varchar(191) NOT NULL,
      \`title\` varchar(255) NOT NULL,
      \`image_url\` text NOT NULL,
      \`link_url\` text,
      \`order\` int NOT NULL DEFAULT 0,
      \`is_active\` boolean NOT NULL DEFAULT true,
      \`created_at\` timestamp NOT NULL DEFAULT (now()),
      \`updated_at\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT \`home_sliders_id\` PRIMARY KEY(\`id\`)
    );
    `);
        console.log("Success.");
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

run();
