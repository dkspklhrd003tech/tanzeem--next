import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function testPost() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/book-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-bypass": "true" },
      body: JSON.stringify({
        name: "Tafseer & Quranic Studies",
        slug: "tafseer-quranic-studies",
        description: "Books on Quranic commentary and sciences",
        coverImage: "",
        order: 0
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch (e) {
    console.error(e);
  }
}

testPost();
