const mysql = require('mysql2/promise');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
}

function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];
    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

const CSV_URL = "https://www.tanzeem.org/wp-content/uploads/2025/12/khitaba-e-jumma.csv";

async function run() {
  loadEnv();
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tanzeemnxt_db',
  });

  // Fetch CSV
  console.log('Fetching CSV...');
  const csvText = await new Promise((resolve, reject) => {
    https.get(CSV_URL, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });

  console.log('Parsing CSV...');
  const parsed = parseCSV(csvText);
  if (parsed.length <= 1) {
    console.error('No rows parsed.');
    process.exit(1);
  }

  const headers = parsed[0].map(h => h.trim().replace(/^\uFEFF/, '')); // strip BOM
  console.log('Headers:', headers);

  // Map column index
  const masjidIndex = headers.indexOf('Masjid Name');
  const addressIndex = headers.indexOf('Address');
  const cityIndex = headers.indexOf('City');
  const timeIndex = headers.indexOf('Time');
  const contactIndex = headers.indexOf('Contact');
  const mapIndex = headers.indexOf('Google Map Location');

  const rowsToInsert = [];
  for (let i = 1; i < parsed.length; i++) {
    const row = parsed[i];
    if (row.length < headers.length) continue;
    const masjid = row[masjidIndex]?.trim() || '';
    const address = row[addressIndex]?.trim() || '';
    const city = row[cityIndex]?.trim() || '';
    const time = row[timeIndex]?.trim() || '';
    const contact = row[contactIndex]?.trim() || '';
    const map = row[mapIndex]?.trim() || '';

    if (!masjid && !address) continue;

    rowsToInsert.push({
      id: uuidv4(),
      masjid,
      address,
      city,
      time,
      contact,
      map,
      is_published: 1
    });
  }

  console.log(`Clearing existing records...`);
  await connection.execute('DELETE FROM khitabat_e_jummah_addresses');

  console.log(`Inserting ${rowsToInsert.length} records...`);
  for (const row of rowsToInsert) {
    await connection.execute(
      `INSERT INTO khitabat_e_jummah_addresses (id, masjid, address, city, time, contact, map, is_published, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [row.id, row.masjid, row.address, row.city, row.time, row.contact, row.map, row.is_published]
    );
  }

  console.log('Seeding complete.');
  await connection.end();
}

run().catch(console.error);
