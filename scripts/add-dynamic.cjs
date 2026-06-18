/**
 * Patches all Next.js page.tsx / layout.tsx files that query the DB at build
 * time (either via generateMetadata or a direct `from "@/db"` import) by
 * inserting `export const dynamic = "force-dynamic"` so they are server-
 * rendered on demand instead of being pre-rendered.
 */
const fs = require("fs");
const path = require("path");

const APP_DIR = path.join(__dirname, "..", "src", "app");
const MARKER = 'export const dynamic = "force-dynamic";';

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name === "page.tsx" || entry.name === "layout.tsx") {
      patch(full);
    }
  }
}

function patch(file) {
  const content = fs.readFileSync(file, "utf8");

  // Already marked – skip
  if (content.includes("force-dynamic")) return;

  // Needs patching if it imports DB OR generates metadata that might query DB
  const needsPatch =
    content.includes('from "@/db"') ||
    content.includes("from '@/db'") ||
    content.includes('from "@/lib/db"') ||
    content.includes("from '@/lib/db'") ||
    content.includes("generateMetadata") ||
    content.includes("generateStaticParams");

  if (!needsPatch) return;

  const lines = content.split("\n");

  // Find the last import statement line so we insert right after it
  let lastImport = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^import[\s{'"*]/.test(lines[i])) lastImport = i;
  }
  if (lastImport === -1) return;

  lines.splice(lastImport + 1, 0, "", MARKER);
  fs.writeFileSync(file, lines.join("\n"), "utf8");
  console.log("  Patched:", path.relative(APP_DIR, file).replace(/\\/g, "/"));
}

console.log("Scanning for pages that need force-dynamic …");
walk(APP_DIR);
console.log("Done.");
