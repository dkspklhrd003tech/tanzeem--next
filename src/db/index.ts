import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const poolConnection = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "tanzeemnxt_db",
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 3,   // kept low so 3 build workers don't exceed server max_connections
    queueLimit: 50,
    connectTimeout: 30000,
});

export const db = drizzle({ client: poolConnection, schema, mode: "default" });
