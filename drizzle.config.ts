import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as path from "path";

// Usage:
//   npm run db:push          → pushes to PRODUCTION (default)
//   npm run db:push:local    → pushes to LOCAL database
// Controlled by DB_ENV environment variable set in package.json scripts
const envFile = process.env.DB_ENV === "local" ? ".env.local" : ".env.production";
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log(`[drizzle] Using env: ${envFile} → DB: ${process.env.DB_NAME}@${process.env.DB_HOST}`);

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "mysql",
    dbCredentials: {
        url: process.env.DATABASE_URL || `mysql://${process.env.DB_USER || "root"}:${process.env.DB_PASSWORD || ""}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || "tanzeemnxt_db"}`,
    },
    verbose: true,
    strict: true,
});
