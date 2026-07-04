import { db } from './src/db/index';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log("Applying migrations...");
    await db.execute(sql`CREATE TABLE IF NOT EXISTS \`custom_field_definitions\` (
        \`id\` varchar(191) NOT NULL,
        \`entity_type\` varchar(100) NOT NULL,
        \`label\` varchar(255) NOT NULL,
        \`field_key\` varchar(191) NOT NULL,
        \`field_type\` varchar(50) NOT NULL,
        \`options\` json,
        \`is_required\` boolean NOT NULL DEFAULT false,
        \`placeholder\` text,
        \`help_text\` text,
        \`order_index\` int NOT NULL DEFAULT 0,
        \`is_active\` boolean NOT NULL DEFAULT true,
        \`created_at\` timestamp NOT NULL DEFAULT (now()),
        \`updated_at\` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`custom_field_definitions_id\` PRIMARY KEY(\`id\`)
    )`);
    console.log("Table custom_field_definitions created/verified.");

    const alterQueries = [
      `ALTER TABLE \`audio\` ADD \`custom_fields\` json`,
      `ALTER TABLE \`audio_categories\` ADD \`custom_fields\` json`,
      `ALTER TABLE \`speakers\` ADD \`custom_fields\` json`,
      `ALTER TABLE \`video_categories\` ADD \`custom_fields\` json`,
      `ALTER TABLE \`videos\` ADD \`custom_fields\` json`
    ];

    for (const q of alterQueries) {
      try {
        await db.execute(sql.raw(q));
        console.log(`Executed: ${q}`);
      } catch (e: any) {
        if (e.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists, skipping: ${q}`);
        } else {
          console.error(`Error on ${q}:`, e.message);
        }
      }
    }
    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration Failed:", error);
  }
  process.exit(0);
}

migrate();
