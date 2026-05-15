const https = require('https');
const http = require('http');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractLinks(html) {
  const links = [];
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const text = m[2].replace(/<[^>]*>/g, '').trim();
    if (text) links.push({ href: m[1], text });
  }
  return links;
}

function extractMenuStructure(html) {
  // Find the primary menu/navigation
  const menuMatch = html.match(/<ul[^>]*id=["']menu-main-menu[^>]*>([\s\S]*?)<\/ul>\s*<\/div>/i)
    || html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i);

  if (!menuMatch) return [];

  const menuHtml = menuMatch[1] || menuMatch[0];
  const allLinks = extractLinks(menuHtml);
  return allLinks;
}

function extractPageSections(html) {
  // Extract main content sections
  const sections = [];

  // Look for section/div with class patterns
  const sectionRe = /<(?:section|div)[^>]*class=["'][^"']*(?:elementor-section|wp-block|entry-content|page-content)[^"']*["'][^>]*>/gi;
  let m;
  while ((m = sectionRe.exec(html)) !== null) {
    sections.push(m[0].substring(0, 200));
  }

  // Extract page title
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : 'Unknown';

  // Extract meta description
  const metaMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  const desc = metaMatch ? metaMatch[1] : '';

  return { title, description: desc, sectionCount: sections.length };
}

async function main() {
  console.log('=== CRAWLING TANZEEM.ORG ===\n');

  // 1. Fetch homepage
  console.log('Fetching homepage...');
  const homeHtml = await fetchPage('https://www.tanzeem.org');

  // Extract all navigation links
  const allLinks = extractLinks(homeHtml);
  const internalLinks = allLinks
    .filter(l => l.href.startsWith('/') || l.href.includes('tanzeem.org'))
    .filter(l => !l.href.includes('#') && !l.href.includes('javascript'))
    .map(l => ({
      ...l,
      href: l.href.startsWith('/') ? l.href : new URL(l.href).pathname
    }));

  // Get unique internal page URLs
  const uniquePages = [...new Set(internalLinks.map(l => l.href))];

  console.log('\n=== ALL INTERNAL LINKS FROM HOMEPAGE ===');
  internalLinks.forEach(l => console.log(`${l.href} | ${l.text}`));

  console.log('\n=== UNIQUE PAGE URLS ===');
  uniquePages.forEach(u => console.log(u));

  // 2. Crawl key inner pages
  const pagesToCrawl = [
    'https://www.tanzeem.org/about/',
    'https://www.tanzeem.org/about/our-approach/',
    'https://www.tanzeem.org/about/organizational-structure/',
    'https://www.tanzeem.org/organization/',
    'https://www.tanzeem.org/organization/background/',
    'https://www.tanzeem.org/organization/mission-statement/',
    'https://www.tanzeem.org/organization/the-founder/',
    'https://www.tanzeem.org/organization/the-ameer/',
    'https://www.tanzeem.org/videos-by-category/',
    'https://www.tanzeem.org/videos-by-speakers/',
    'https://www.tanzeem.org/audios/audios-by-category/',
    'https://www.tanzeem.org/books/',
    'https://www.tanzeem.org/books-by-category/',
    'https://www.tanzeem.org/magazines/',
    'https://www.tanzeem.org/meesaq/',
    'https://www.tanzeem.org/press-releases/',
    'https://www.tanzeem.org/contact-us/',
    'https://www.tanzeem.org/quranic-circles/',
    'https://www.tanzeem.org/markaz-tanzeem/',
    'https://www.tanzeem.org/faq/',
    'https://www.tanzeem.org/social-media/',
    'https://www.tanzeem.org/distance-learning/',
  ];

  console.log('\n=== INNER PAGE ANALYSIS ===');
  for (const url of pagesToCrawl) {
    try {
      const html = await fetchPage(url);
      const info = extractPageSections(html);
      const path = new URL(url).pathname;

      // Check if it has special page templates
      const hasGrid = html.includes('grid') || html.includes('card');
      const hasVideo = html.includes('youtube') || html.includes('video') || html.includes('iframe');
      const hasForm = html.includes('<form') || html.includes('contact');
      const hasTable = html.includes('<table');
      const hasAccordion = html.includes('accordion') || html.includes('toggle') || html.includes('faq');
      const hasTabs = html.includes('tab-content') || html.includes('tabs');

      const features = [];
      if (hasGrid) features.push('GRID/CARDS');
      if (hasVideo) features.push('VIDEO');
      if (hasForm) features.push('FORM');
      if (hasTable) features.push('TABLE');
      if (hasAccordion) features.push('ACCORDION');
      if (hasTabs) features.push('TABS');

      console.log(`\n${path}`);
      console.log(`  Title: ${info.title}`);
      console.log(`  Features: ${features.join(', ') || 'CONTENT PAGE'}`);
      console.log(`  Status: OK (${html.length} bytes)`);
    } catch (err) {
      const path = new URL(url).pathname;
      console.log(`\n${path}`);
      console.log(`  ERROR: ${err.message}`);
    }
  }
}

main().catch(console.error);
