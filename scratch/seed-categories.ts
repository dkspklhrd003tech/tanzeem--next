import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });
import { db } from "../src/db";
import { bookCategories } from "../src/db/schema";
import { eq } from "drizzle-orm";

const FALLBACK = [
  { id: "f1", name: "Tafseer & Quranic Studies", slug: "tafseer", description: "Books on Quranic commentary and sciences", coverImage: null, order: 0 },
  { id: "f2", name: "Hadith & Sunnah", slug: "hadith", description: "Collections and explanations of Hadith", coverImage: null, order: 1 },
  { id: "f3", name: "Islamic Theology (Aqeedah)", slug: "aqeedah", description: "Books on Islamic beliefs and creed", coverImage: null, order: 2 },
  { id: "f4", name: "Seerah & Islamic History", slug: "seerah", description: "Biography of Prophet (SAW) and Islamic history", coverImage: null, order: 3 },
  { id: "f5", name: "Contemporary Issues", slug: "contemporary", description: "Islamic perspectives on modern challenges", coverImage: null, order: 4 },
  { id: "f6", name: "Spirituality & Tazkiyah", slug: "spirituality", description: "Books on spiritual purification", coverImage: null, order: 5 },
  { id: "f7", name: "Fiqh & Islamic Law", slug: "fiqh", description: "Islamic jurisprudence", coverImage: null, order: 6 },
  { id: "f8", name: "Children's Literature", slug: "children", description: "Islamic books for young readers", coverImage: null, order: 7 },
];

async function seed() {
  try {
    for (const cat of FALLBACK) {
      const existing = await db.select().from(bookCategories).where(eq(bookCategories.slug, cat.slug)).limit(1);
      if (existing.length === 0) {
        await db.insert(bookCategories).values({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          coverImage: cat.coverImage,
          order: cat.order,
        });
        console.log(`Inserted ${cat.name}`);
      }
    }
    console.log("Seeding complete.");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

seed();
