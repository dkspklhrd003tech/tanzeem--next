const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "src", "app");
const MARKER = 'export const dynamic = "force-dynamic";';

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name === "page.tsx" || e.name === "layout.tsx") patch(full);
  }
}

function patch(file) {
  const content = fs.readFileSync(file, "utf8");
  // Already marked
  if (content.includes("force-dynamic")) return;
  // Only patch if the file has a DB import OR generateMetadata
  const needsPatch = content.includes('from "@/db"') ||
    content.includes("from '@/db'") ||
    content.includes("generateMetadata");
  if (!needsPatch) return;

  const lines = content.split("\n");
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import[\s{'"*]/.test(lines[i])) lastImport = i;
  }
  if (lastImport === -1) return;

  lines.splice(lastImport + 1, 0, "", MARKER);
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("Patched:", path.relative(ROOT, file).replace(/\\/g, "/"));
}

walk(ROOT);
console.log("Done.");
