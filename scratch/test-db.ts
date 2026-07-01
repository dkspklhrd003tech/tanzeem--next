import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(connection);
  
  const [cats] = await connection.execute("SELECT id, name, slug, parent_id FROM video_categories");
  console.log("Categories:", cats);
  
  const [videos] = await connection.execute("SELECT id, title, category_id FROM videos");
  console.log("Videos:", videos);
  
  connection.end();
}

main();
