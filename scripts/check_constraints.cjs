const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function run() {
  const constraints = await sql.query(`
    SELECT conname, contype, relname 
    FROM pg_constraint c 
    JOIN pg_class t ON c.conrelid = t.oid 
    JOIN pg_namespace n ON t.relnamespace = n.oid 
    WHERE n.nspname = 'public';
  `);
  console.log('--- CONSTRAINTS ---');
  for (const row of (constraints.rows || constraints)) {
    console.log(`${row.relname} | ${row.conname} | type: ${row.contype}`);
  }
}
run();
