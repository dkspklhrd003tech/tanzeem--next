const fs = require('fs');

async function analyze() {
  const res = await fetch('https://www.tanzeem.org', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  const html = await res.text();
  
  // Extract links
  const links = [];
  const linkRegex = /<a[^>]+href=["'](https:\/\/www\.tanzeem\.org\/[^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (text) {
      links.push({ url, text });
    }
  }

  // Group links by paths to guess navigation
  const uniqueLinks = Array.from(new Set(links.map(l => JSON.stringify(l)))).map(l => JSON.parse(l));

  // Extract sections and headings to guess layout
  const headings = [];
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: match[1],
      text: match[2].replace(/<[^>]+>/g, '').trim()
    });
  }

  // Extract major div classes for structure
  const sections = [];
  const sectionRegex = /<section[^>]*class=["']([^"']+)["']/gi;
  while ((match = sectionRegex.exec(html)) !== null) {
    sections.push(match[1]);
  }

  console.log("=== UNIQUE LINKS ===");
  uniqueLinks.forEach(l => console.log(`${l.text} -> ${l.url}`));

  console.log("\n=== HEADINGS ===");
  headings.forEach(h => console.log(`H${h.level}: ${h.text}`));

  console.log("\n=== SECTION CLASSES ===");
  sections.forEach(s => console.log(s));
}

analyze().catch(console.error);
