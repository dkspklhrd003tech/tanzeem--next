import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function fixLive() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`sermon_categories\` (
                \`id\` varchar(191) NOT NULL,
                \`name\` varchar(191) NOT NULL,
                \`urdu_name\` varchar(191),
                \`slug\` varchar(191) NOT NULL,
                \`description\` text,
                \`order\` int NOT NULL DEFAULT 0,
                \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`sermon_categories_slug_unique\` (\`slug\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log("Created sermon_categories table");
        
        const alterQueries = [
            'ALTER TABLE `sermons` ADD COLUMN `category_id` varchar(191) AFTER `id`;',
            'ALTER TABLE `sermons` ADD COLUMN `title_urdu` varchar(255) AFTER `title`;',
            'ALTER TABLE `sermons` ADD COLUMN `excerpt` text AFTER `slug`;',
            'ALTER TABLE `sermons` ADD COLUMN `published_at` timestamp AFTER `is_published`;'
        ];
        
        for (const query of alterQueries) {
            try {
                await connection.query(query);
                console.log("Executed:", query);
            } catch(e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    console.log("Column already exists, skipping:", query);
                } else {
                    console.error("Failed executing:", query, e.message);
                }
            }
        }
       await connection.query(`
      CREATE TABLE IF NOT EXISTS khitab_audio_categories (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        urdu_name VARCHAR(191),
        slug VARCHAR(191) NOT NULL UNIQUE,
        description TEXT,
        \`order\` INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ khitab_audio_categories table created or already exists.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS khitab_audios (
        id VARCHAR(191) PRIMARY KEY,
        category_id VARCHAR(191),
        title VARCHAR(255) NOT NULL,
        title_urdu VARCHAR(255),
        slug VARCHAR(191) NOT NULL UNIQUE,
        excerpt TEXT,
        description TEXT,
        audio_url TEXT,
        is_published BOOLEAN NOT NULL DEFAULT 1,
        published_at TIMESTAMP,
        meta_title VARCHAR(255),
        meta_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ khitab_audios table created or already exists.");

    console.log("\n🎉 Database fix complete!");
  } catch (error) {
    console.error("❌ Error fixing database:", error);
  } finally {
    if (connection) await connection.end();
  }
}

fixLive();
