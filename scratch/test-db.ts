import { db } from "../src/db";
import { bookCategories, books } from "../src/db/schema";

async function test() {
  try {
    const res = await db.select().from(bookCategories).limit(1);
    console.log("bookCategories OK:", res);
    
    const res2 = await db.select().from(books).limit(1);
    console.log("books OK:", res2);
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}

test();
