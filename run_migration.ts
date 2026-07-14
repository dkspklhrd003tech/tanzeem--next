import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

async function main() {
    console.log("Connecting to production DB...", process.env.DB_HOST);
    const connection = await createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT || 3306),
        multipleStatements: true
    });

    const sqlFile = fs.readFileSync(path.resolve(process.cwd(), "drizzle/0005_premium_ben_urich.sql"), "utf-8");
    console.log("Read SQL file. Executing...");
    
    // Split by statement-breakpoint because Drizzle uses it, or just multipleStatements
    // Actually, drizzle files might have `--> statement-breakpoint` or just semicolons.
    // If we enabled multipleStatements, we can just run it, but let's replace the breakpoint just in case.
    const sqlCommands = sqlFile.split("--> statement-breakpoint").map(s => s.trim()).filter(Boolean);

    for (const cmd of sqlCommands) {
        if (!cmd) continue;
        console.log("Executing:", cmd.substring(0, 50) + "...");
        try {
            await connection.query(cmd);
            console.log("Success.");
        } catch (error: any) {
            console.error("Failed to execute query:", error.message);
            // Some might fail if they already exist, we can ignore Duplicate column errors
        }
    }

    console.log("Done.");
    await connection.end();
}

main().catch(console.error);
