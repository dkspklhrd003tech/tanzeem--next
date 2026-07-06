import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "mysql",
    // Using URL string to bypass the Drizzle bug that rejects empty password strings
    dbCredentials: {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "tanzeemnxt_db",
        ssl: (process.env.DB_SSL === 'true' || process.env.DB_SSL === 'True') ? { rejectUnauthorized: false } : undefined,
    },
    verbose: true,
    strict: true,
});
