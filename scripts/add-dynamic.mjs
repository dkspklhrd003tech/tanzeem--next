import { readFileSync, writeFileSync } from "fs";
import { glob } from "fs/promises";
import path from "path";

const ROOT = new URL("../src/app", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");

const files = [];
for await (const f of glob(`${ROOT}/**/page.tsx`)) {
  files.push(f);
}

let patched = 0;
for (const file of files) {
  const content = readFileSync(file, "utf8");
  if (content.includes("generateMetadata") && !content.includes("force-dynamic")) {
    // Insert after the last import block
    const lines = content.split("\n");
    // Find last import line
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ") || lines[i].startsWith('import "') || lines[i].startsWith("import '")) {
        lastImport = i;
      }
    }
    const insertAt = lastImport + 1;
    lines.splice(insertAt, 0, "", "export const dynamic = \"force-dynamic\";");
    writeFileSync(file, lines.join("\n"), "utf8");
    console.log("Patched:", file.replace(ROOT, "").replace(/\\/g, "/"));
    patched++;
  }
}
console.log(`\nDone — patched ${patched} files.`);
