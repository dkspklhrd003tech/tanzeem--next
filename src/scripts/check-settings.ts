import "dotenv/config";
import { db } from "../lib/db";
import { settings } from "../db/schema";
import { eq } from "drizzle-orm";

async function checkSettings() {
    console.log("Checking Homepage Settings...");
    try {
        const results = await db.select().from(settings);
        console.table(results.map(s => ({
            key: s.key,
            value: s.value.substring(0, 50) + (s.value.length > 50 ? "..." : ""),
            group: s.group
        })));
    } catch (error) {
        console.error("Error:", error);
    }
}

checkSettings();
