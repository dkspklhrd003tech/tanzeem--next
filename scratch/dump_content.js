const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
}

async function run() {
  loadEnv();
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tanzeemnxt_db',
  });

  const slugs = [
    'background', 'organization/background',
    'mission-statement', 'organization/mission-statement',
    'our-ideology', 'organization/our-ideology',
    'our-ideology/basic-belief', 'basic-belief',
    'our-ideology/our-obligations', 'our-obligations',
    'our-ideology/methodology', 'methodology',
    'our-ideology/foundation', 'foundation'
  ];

  for (const slug of slugs) {
    const [rows] = await connection.execute('SELECT id, title, slug, content FROM pages WHERE slug = ?', [slug]);
    if (rows.length > 0) {
      console.log(`=== SLUG: ${slug} ===`);
      console.log(`ID: ${rows[0].id}`);
      console.log(`Title: ${rows[0].title}`);
      console.log(`Content length: ${rows[0].content ? rows[0].content.length : 0}`);
      console.log(`Snippet: ${rows[0].content ? rows[0].content.slice(0, 300) : ''}`);
      console.log('\n');
    }
  }

  await connection.end();
}

run().catch(console.error);
