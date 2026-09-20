const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runStatement(stmt, desc) {
  try {
    await sql.query(stmt);
    console.log(`✓ ${desc}`);
  } catch (err) {
    console.error(`✗ Error in ${desc}:`, err.message);
    throw err;
  }
}

async function syncDatabase() {
  console.log('--- STARTING DATABASE SCHEMA SYNC ---');

  // 1. site_settings
  await runStatement(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false;`, 'site_settings.maintenance_mode');
  await runStatement(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_auto_deactivate BOOLEAN DEFAULT false;`, 'site_settings.maintenance_auto_deactivate');
  await runStatement(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_end_time TIMESTAMP WITH TIME ZONE;`, 'site_settings.maintenance_end_time');
  await runStatement(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS maintenance_reason TEXT DEFAULT 'maintenance';`, 'site_settings.maintenance_reason');
  await runStatement(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ad1_url TEXT;`, 'site_settings.ad1_url');
  await runStatement(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS ad2_url TEXT;`, 'site_settings.ad2_url');
  await runStatement(`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`, 'site_settings.updated_at');

  // 2. youtube_accounts
  await runStatement(`
    CREATE TABLE IF NOT EXISTS youtube_accounts (
      id SERIAL PRIMARY KEY,
      channel_id TEXT DEFAULT 'default',
      refresh_token TEXT NOT NULL,
      access_token TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `, 'create table youtube_accounts');

  // 3. push_subscriptions
  await runStatement(`DROP TABLE IF EXISTS push_subscriptions;`, 'drop old push_subscriptions');
  await runStatement(`
    CREATE TABLE push_subscriptions (
      id SERIAL PRIMARY KEY,
      endpoint TEXT UNIQUE NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `, 'create table push_subscriptions');

  // 4. rss_sources
  await runStatement(`DROP TABLE IF EXISTS rss_sources;`, 'drop old rss_sources');
  await runStatement(`
    CREATE TABLE rss_sources (
      id SERIAL PRIMARY KEY,
      media_house_name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      sub_category TEXT,
      rss_feed TEXT NOT NULL,
      website TEXT,
      favicon_url TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `, 'create table rss_sources');

  // 5. article_translations indexes
  await runStatement(`CREATE INDEX IF NOT EXISTS idx_article_translations_guid ON article_translations(article_guid);`, 'idx_article_translations_guid');
  await runStatement(`CREATE INDEX IF NOT EXISTS idx_article_translations_lang ON article_translations(lang);`, 'idx_article_translations_lang');

  // 6. unnest(jsonb) function
  await runStatement(`
    CREATE OR REPLACE FUNCTION unnest(jsonb)
    RETURNS SETOF text AS $$
      SELECT jsonb_array_elements_text($1);
    $$ LANGUAGE sql IMMUTABLE;
  `, 'create function unnest(jsonb)');

  // 7. Verify all tables and columns now
  console.log('\n--- FINAL VERIFICATION: ALL TABLES & COLUMNS IN DATABASE ---');
  const res = await sql.query(`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);

  const cols = {};
  for (const r of (res.rows || res)) {
    if (!cols[r.table_name]) cols[r.table_name] = [];
    cols[r.table_name].push(`${r.column_name} (${r.data_type})`);
  }

  for (const [table, colList] of Object.entries(cols).sort()) {
    console.log(`\nTABLE: ${table}`);
    colList.forEach(c => console.log(`  - ${c}`));
  }

  console.log('\n--- VERIFYING ARTICLE AND ROW COUNTS ---');
  const tables = ['articles', 'categories', 'site_settings', 'ad_campaigns', 'site_ads', 'youtube_accounts', 'push_subscriptions', 'rss_sources', 'article_translations'];
  for (const t of tables) {
    const countRes = await sql.query(`SELECT count(*) FROM ${t}`);
    console.log(`${t}: ${(countRes.rows || countRes)[0].count} rows`);
  }

  console.log('\n=== SCHEMA SYNC COMPLETED SUCCESSFULLY ===');
}

syncDatabase().catch(err => {
  console.error('Schema sync fatal:', err);
  process.exit(1);
});
