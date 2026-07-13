import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function addColumnSafe(table: string, column: string, definition: string) {
  try {
    await db.execute(sql.raw(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`));
    console.log(`Successfully added ${column} to ${table}`);
  } catch (e: any) {
    if (e.message && e.message.includes("Duplicate column name")) {
      console.log(`Column ${column} already exists in ${table}`);
    } else {
      console.log(`Error adding ${column} to ${table}:`, e);
    }
  }
}

async function run() {
  console.log("Starting migrations...");

  const tables = [
    { name: "audio", columns: [{ name: "share_count", def: "int NOT NULL DEFAULT 0" }] },
    { name: "videos", columns: [
        { name: "share_count", def: "int NOT NULL DEFAULT 0" },
        { name: "play_count", def: "int NOT NULL DEFAULT 0" },
        { name: "download_count", def: "int NOT NULL DEFAULT 0" }
      ] 
    },
    { name: "books", columns: [
        { name: "share_count", def: "int NOT NULL DEFAULT 0" },
        { name: "play_count", def: "int NOT NULL DEFAULT 0" }
      ] 
    },
    { name: "magazines", columns: [
        { name: "share_count", def: "int NOT NULL DEFAULT 0" },
        { name: "play_count", def: "int NOT NULL DEFAULT 0" }
      ] 
    },
    { name: "sermons", columns: [
        { name: "share_count", def: "int NOT NULL DEFAULT 0" },
        { name: "play_count", def: "int NOT NULL DEFAULT 0" },
        { name: "download_count", def: "int NOT NULL DEFAULT 0" },
        { name: "file_size", def: "int" }
      ] 
    },
    { name: "khitab_audios", columns: [
        { name: "share_count", def: "int NOT NULL DEFAULT 0" },
        { name: "play_count", def: "int NOT NULL DEFAULT 0" },
        { name: "download_count", def: "int NOT NULL DEFAULT 0" },
        { name: "file_size", def: "int" }
      ] 
    },
    { name: "audio_books", columns: [
        { name: "share_count", def: "int NOT NULL DEFAULT 0" },
        { name: "play_count", def: "int NOT NULL DEFAULT 0" },
        { name: "download_count", def: "int NOT NULL DEFAULT 0" },
        { name: "file_size", def: "int" }
      ] 
    },
    { name: "downloads", columns: [
        { name: "share_count", def: "int NOT NULL DEFAULT 0" },
        { name: "play_count", def: "int NOT NULL DEFAULT 0" }
      ] 
    }
  ];

  for (const table of tables) {
    for (const col of table.columns) {
      await addColumnSafe(table.name, col.name, col.def);
    }
  }

  console.log("Migrations complete.");
  process.exit(0);
}

run();
