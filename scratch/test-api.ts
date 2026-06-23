import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

async function testApi() {
  try {
    const res = await fetch("http://localhost:3000/api/admin/book-categories");
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);
  } catch (e) {
    console.error(e);
  }
}

testApi();
