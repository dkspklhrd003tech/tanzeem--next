import "dotenv/config";
import { db } from "../lib/db";
import { settings } from "../db/schema";
import { eq, or } from "drizzle-orm";

async function migrateSettings() {
    console.log("Migrating Homepage Settings to correct group...");
    
    const keysToMigrate = [
        "homepage_about_title",
        "homepage_about_description",
        "homepage_about_button_text",
        "homepage_about_button_link",
        "homepage_about_image",
        "homepage_mission_text"
    ];

    try {
        for (const key of keysToMigrate) {
            await db.update(settings)
                .set({ group: "homepage" })
                .where(eq(settings.key, key));
            console.log(`Updated group for key: ${key}`);
        }
        console.log("Migration complete.");
    } catch (error) {
        console.error("Migration Error:", error);
    }
}

migrateSettings();
