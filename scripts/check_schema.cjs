const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        results = results.concat(getFiles(fullPath));
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

async function main() {
  const files = getFiles(path.join(__dirname, '../src'));
  const sqlRegex = /sql`([\s\S]*?)`/g;
  const tableRegex = /(?:FROM|INTO|UPDATE|JOIN|TABLE)\s+([a-zA-Z0-9_]+)/gi;

  const tablesFound = new Set();
  const queriesByTable = {};

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    let match;
    while ((match = sqlRegex.exec(content)) !== null) {
      const queryStr = match[1];
      let tMatch;
      while ((tMatch = tableRegex.exec(queryStr)) !== null) {
        const tName = tMatch[1].toLowerCase();
        if (!['select', 'where', 'set', 'values', 'unnest', 'on', 'if', 'exists', 'case'].includes(tName)) {
          tablesFound.add(tName);
          if (!queriesByTable[tName]) queriesByTable[tName] = [];
          queriesByTable[tName].push({
            file: path.relative(path.join(__dirname, '..'), f),
            snippet: queryStr.trim().replace(/\s+/g, ' ').substring(0, 150)
          });
        }
      }
    }
  }

  console.log('--- ALL TABLES FOUND IN CODE ---');
  console.log(Array.from(tablesFound).sort());

  // Connect to Neon and check schema
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not found in .env.local');
    return;
  }
  const sql = neon(dbUrl);

  const existingTablesResult = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  const existingTables = existingTablesResult.map(r => r.table_name);
  console.log('\n--- EXISTING TABLES IN NEON DB ---');
  console.log(existingTables);

  // Check columns for existing tables
  const existingColumnsResult = await sql`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `;
  const columnsByTable = {};
  for (const row of existingColumnsResult) {
    if (!columnsByTable[row.table_name]) columnsByTable[row.table_name] = [];
    columnsByTable[row.table_name].push(row.column_name);
  }

  console.log('\n--- COLUMNS IN EXISTING TABLES ---');
  for (const t of Object.keys(columnsByTable).sort()) {
    console.log(`${t}:`, columnsByTable[t].join(', '));
  }
}

main().catch(console.error);
