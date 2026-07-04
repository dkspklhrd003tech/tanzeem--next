import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.production" });

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "mysql",
    // Using URL string to bypass the Drizzle bug that rejects empty password strings
    dbCredentials: {
        url: `mysql://${process.env.DB_USER || "root"}:${process.env.DB_PASSWORD || ""}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}/${process.env.DB_NAME || "tanzeemnxt_db"}`,
    },
    verbose: true,
    strict: true,
});
