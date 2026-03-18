import { db } from './src/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function runMigration() {
    console.log('Starting manual migration...');
    
    try {
        console.log('Adding "order" column to books table...');
        await db.execute(sql`ALTER TABLE books ADD COLUMN \`order\` int NOT NULL DEFAULT 0`);
        console.log('Success: Added "order" to books.');
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Skip: "order" already exists in books.');
        } else {
            console.error('Error adding "order" to books:', error.message);
        }
    }

    try {
        console.log('Adding "order" column to magazines table...');
        await db.execute(sql`ALTER TABLE magazines ADD COLUMN \`order\` int NOT NULL DEFAULT 0`);
        console.log('Success: Added "order" to magazines.');
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Skip: "order" already exists in magazines.');
        } else {
            console.error('Error adding "order" to magazines:', error.message);
        }
    }

    try {
        console.log('Adding "order" column to videos table...');
        await db.execute(sql`ALTER TABLE videos ADD COLUMN \`order\` int NOT NULL DEFAULT 0`);
        console.log('Success: Added "order" to videos.');
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Skip: "order" already exists in videos.');
        } else {
            console.error('Error adding "order" to videos:', error.message);
        }
    }

    console.log('Migration finished.');
    process.exit(0);
}

runMigration().catch((err) => {
    console.error('Fatal Migration Error:', err);
    process.exit(1);
});
