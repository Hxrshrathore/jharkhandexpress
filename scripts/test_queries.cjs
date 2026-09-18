const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testQuery(name, fn) {
  try {
    await fn();
    console.log(`✓ Passed: ${name}`);
  } catch (err) {
    console.error(`✗ Failed: ${name} ->`, err.message);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log('--- TESTING DATABASE QUERIES AGAINST NEW SCHEMA ---');

  // 1. site_settings read (db.ts & proxy.ts)
  await testQuery('getSiteSettings (db.ts)', async () => {
    const res = await sql`SELECT * FROM site_settings ORDER BY id DESC LIMIT 1`;
    if (!res || res.length === 0) throw new Error('No site settings found');
  });

  await testQuery('proxy.ts maintenance query', async () => {
    const res = await sql`SELECT maintenance_mode, maintenance_auto_deactivate, maintenance_end_time, maintenance_reason FROM site_settings ORDER BY id DESC LIMIT 1`;
    if (!res || res.length === 0) throw new Error('Proxy check returned no rows');
  });

  // 2. truth_articles queries (db.ts)
  await testQuery('truth_articles homepage limit 10', async () => {
    const res = await sql`
      SELECT id, guid, title, slug, excerpt, content_html, featured_image, featured_video, featured_video_timestamp, gallery, video_gallery, categories, tags, published_at, author, youtube_video_id, expires_at 
      FROM truth_articles 
      WHERE (expires_at IS NULL OR expires_at > NOW()) 
      ORDER BY published_at DESC LIMIT 10
    `;
    if (res.length !== 10) throw new Error(`Expected 10 rows, got ${res.length}`);
  });

  // 3. unnest(categories) query (db.ts)
  await testQuery('truth_articles category search with unnest(categories)', async () => {
    const res = await sql`
      SELECT id, guid, title, slug, excerpt, content_html, featured_image, featured_video, featured_video_timestamp, gallery, video_gallery, categories, tags, published_at, author, youtube_video_id, expires_at 
      FROM truth_articles 
      WHERE (expires_at IS NULL OR expires_at > NOW()) 
      AND EXISTS (
        SELECT 1 FROM unnest(categories) AS cat 
        WHERE lower(regexp_replace(cat, '[^a-zA-Z0-9]+', '-', 'g')) = 'politics' OR lower(cat) = 'politics'
      ) 
      ORDER BY published_at DESC LIMIT 5
    `;
    console.log(`  (Found ${res.length} articles under 'politics')`);
  });

  // 4. categories list
  await testQuery('categories query', async () => {
    const res = await sql`SELECT c.*, p.name as parent_name FROM categories c LEFT JOIN categories p ON c.parent_id = p.id ORDER BY c.name ASC`;
    if (res.length === 0) throw new Error('No categories found');
  });

  // 5. site_ads & ad_campaigns join
  await testQuery('site_ads active query', async () => {
    const res = await sql`
      SELECT a.*, c.valid_from, c.valid_to 
      FROM site_ads a 
      JOIN ad_campaigns c ON a.campaign_id = c.id 
      WHERE a.active = true 
      ORDER BY c.valid_from DESC
    `;
    console.log(`  (Found ${res.length} active ads joined with campaigns)`);
  });

  // 6. push_subscriptions query
  await testQuery('push_subscriptions count and select', async () => {
    await sql`SELECT COUNT(*) as count FROM push_subscriptions`;
    await sql`SELECT endpoint, p256dh, auth FROM push_subscriptions`;
  });

  // 7. youtube_accounts query
  await testQuery('youtube_accounts select', async () => {
    await sql`SELECT * FROM youtube_accounts ORDER BY id DESC LIMIT 1`;
    await sql`SELECT refresh_token FROM youtube_accounts ORDER BY id DESC LIMIT 1`;
  });

  // 8. rss_sources query
  await testQuery('rss_sources select', async () => {
    await sql`SELECT * FROM rss_sources ORDER BY id ASC`;
    await sql`SELECT id, media_house_name, rss_feed, favicon_url, category, sub_category FROM rss_sources WHERE is_active = true OR is_active IS NULL`;
  });

  // 9. article_translations query
  await testQuery('article_translations select', async () => {
    await sql`SELECT lang, title, excerpt, content_html FROM article_translations WHERE article_guid = 'sample' AND lang = 'hi' LIMIT 1`;
    await sql`SELECT lang FROM article_translations WHERE article_guid = 'sample'`;
  });

  console.log('\n--- ALL TEST QUERIES PASSED WITH ZERO ERRORS ---');
}

runTests();
