import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

async function migrateData() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Starting migration for live database...");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`event_categories\` (
              \`id\` varchar(191) NOT NULL,
              \`parent_id\` varchar(191) DEFAULT NULL,
              \`name\` varchar(191) NOT NULL,
              \`slug\` varchar(191) NOT NULL,
              \`description\` text DEFAULT NULL,
              \`image_url\` text DEFAULT NULL,
              \`order\` int(11) NOT NULL DEFAULT 0,
              \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
              \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
              \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (\`id\`),
              UNIQUE KEY \`event_categories_slug_unique\` (\`slug\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
        `);
        console.log("✅ event_categories table created or already exists.");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`service_categories\` (
              \`id\` varchar(191) NOT NULL,
              \`parent_id\` varchar(191) DEFAULT NULL,
              \`name\` varchar(191) NOT NULL,
              \`slug\` varchar(191) NOT NULL,
              \`description\` text DEFAULT NULL,
              \`image_url\` text DEFAULT NULL,
              \`order\` int(11) NOT NULL DEFAULT 0,
              \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
              \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
              \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (\`id\`),
              UNIQUE KEY \`service_categories_slug_unique\` (\`slug\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
        `);
        console.log("✅ service_categories table created or already exists.");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`campaign_categories\` (
              \`id\` varchar(191) NOT NULL,
              \`parent_id\` varchar(191) DEFAULT NULL,
              \`name\` varchar(191) NOT NULL,
              \`slug\` varchar(191) NOT NULL,
              \`description\` text DEFAULT NULL,
              \`image_url\` text DEFAULT NULL,
              \`order\` int(11) NOT NULL DEFAULT 0,
              \`is_active\` tinyint(1) NOT NULL DEFAULT 1,
              \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
              \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (\`id\`),
              UNIQUE KEY \`campaign_categories_slug_unique\` (\`slug\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
        `);
        console.log("✅ campaign_categories table created or already exists.");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`campaigns\` (
              \`id\` varchar(191) NOT NULL,
              \`title\` varchar(255) NOT NULL,
              \`slug\` varchar(191) NOT NULL,
              \`description\` text DEFAULT NULL,
              \`content\` text DEFAULT NULL,
              \`thumbnail_url\` text DEFAULT NULL,
              \`video_url\` text DEFAULT NULL,
              \`pdf_url\` text DEFAULT NULL,
              \`category_id\` varchar(191) DEFAULT NULL,
              \`custom_fields\` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(\`custom_fields\`)),
              \`starts_at\` timestamp NULL DEFAULT NULL,
              \`ends_at\` timestamp NULL DEFAULT NULL,
              \`is_published\` tinyint(1) NOT NULL DEFAULT 1,
              \`meta_title\` varchar(255) DEFAULT NULL,
              \`meta_description\` text DEFAULT NULL,
              \`author_id\` varchar(191) NOT NULL,
              \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
              \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (\`id\`),
              UNIQUE KEY \`campaigns_slug_unique\` (\`slug\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
        `);
        console.log("✅ campaigns table created or already exists.");

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await connection.end();
    }
}

migrateData();
