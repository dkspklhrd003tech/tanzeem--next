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
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
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

  // 1. Delete rows containing empty/placeholder data
  const deleteIds = [
    '9dd29334-eede-438a-978a-42555c0ca3d1', // organization/background (empty)
    '2de1b6e1-c558-4e86-a70e-64cc5ebb12fb', // organization/mission-statement (empty)
    '9d33eca1-b622-4e62-b3a2-ed843599e00b', // organization/our-ideology (empty)
    '6ea6f5e0-8c6e-4ac6-b848-f0056a073ff5', // basic-belief (placeholder)
    '5931bf13-ba87-4128-8a5b-cda419c0f8a0', // our-obligations (placeholder)
    'a5d37ba6-4734-41ff-ae0e-3251899b9636', // methodology (placeholder)
    'f3a390fe-8811-4c2e-9bc7-df95b25b95e9'  // foundation (placeholder)
  ];

  console.log('Deleting duplicate/placeholder rows...');
  for (const id of deleteIds) {
    const [result] = await connection.execute('DELETE FROM pages WHERE id = ?', [id]);
    console.log(`Deleted ID ${id}: ${result.affectedRows} row(s) affected`);
  }

  // 2. Update slugs of rows containing real data to canonical prefix
  const updates = [
    { id: '662f9aaf-3815-4c7a-8d44-4cde9a9c94e2', newSlug: 'organization/background' },
    { id: '5575aaff-06e9-43cc-bba5-a5f02ebd4f64', newSlug: 'organization/mission-statement' },
    { id: '6405eee0-c9cd-4f81-82e1-c5429d4e9aef', newSlug: 'organization/our-ideology' },
    { id: 'd7db248e-7558-49de-a16f-fea5255f23d1', newSlug: 'organization/our-ideology/basic-belief' },
    { id: '9d4276a2-1676-4cb8-b419-60970d77c642', newSlug: 'organization/our-ideology/our-obligations' },
    { id: '3b6d5cb0-0211-4359-9c53-dfb6e1dbf44f', newSlug: 'organization/our-ideology/methodology' },
    { id: 'ed757154-07e1-4d60-a970-d1d58a950cd2', newSlug: 'organization/our-ideology/foundation' }
  ];

  console.log('\nUpdating real data rows to canonical slugs...');
  for (const item of updates) {
    const [result] = await connection.execute('UPDATE pages SET slug = ? WHERE id = ?', [item.newSlug, item.id]);
    console.log(`Updated ID ${item.id} slug to '${item.newSlug}': ${result.affectedRows} row(s) affected`);
  }

  console.log('\nMigration complete.');
  await connection.end();
}

run().catch(console.error);
