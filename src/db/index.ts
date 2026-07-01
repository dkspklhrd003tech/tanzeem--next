import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

const poolConnection =
  globalForDb.pool ??
  mysql.createPool(
    process.env.DATABASE_URL
      ? {
          uri: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 100,
          connectTimeout: 30000,
        }
      : {
          host: process.env.DB_HOST || "localhost",
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
          user: process.env.DB_USER || "root",
          password: process.env.DB_PASSWORD || "",
          database: process.env.DB_NAME || "tanzeemnxt_db",
          ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 100,
          connectTimeout: 30000,
        }
  );

if (process.env.NODE_ENV !== "production") globalForDb.pool = poolConnection;

export const db = drizzle({ client: poolConnection, schema, mode: "default" });
