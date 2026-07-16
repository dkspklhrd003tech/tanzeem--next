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
    dbCredentials: process.env.DATABASE_URL 
      ? { url: process.env.DATABASE_URL }
      : {
          host: process.env.DB_HOST || "localhost",
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
          user: process.env.DB_USER || "root",
          password: process.env.DB_PASSWORD || "",
          database: process.env.DB_NAME || "tanzeemnxt_db",
      },
    verbose: true,
    strict: true,
});
