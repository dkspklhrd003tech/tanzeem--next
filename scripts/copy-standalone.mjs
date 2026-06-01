import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Skip (missing): ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

const standaloneNext = path.join(root, '.next', 'standalone', '.next');
copyDir(path.join(root, '.next', 'static'), path.join(standaloneNext, 'static'));
copyDir(path.join(root, 'public'), path.join(root, '.next', 'standalone', 'public'));
console.log('Standalone assets copied.');
