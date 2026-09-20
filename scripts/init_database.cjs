/**
 * Initialize all database tables and seed data for Jharkhand Express on Neon PostgreSQL
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_RFD5CbUZAt8Y@ep-holy-hill-b3cb477y-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const sql = neon(connectionString);

async function init() {
  console.log('--- Initializing Neon PostgreSQL Database for Jharkhand Express ---');

  // 1. Helper function for unnest(jsonb)
  console.log('1. Creating unnest(jsonb) helper function...');
  await sql.query(`
    CREATE OR REPLACE FUNCTION unnest(jsonb) 
    RETURNS SETOF text 
    LANGUAGE sql 
    IMMUTABLE 
    AS $$ 
      SELECT jsonb_array_elements_text(CASE WHEN jsonb_typeof($1) = 'array' THEN $1 ELSE '[]'::jsonb END); 
    $$;
  `);

  // 2. Categories table
  console.log('2. Creating categories table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      parent_id INT REFERENCES categories(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Seed default categories
  const defaultCategories = [
    { name: 'Breaking News', slug: 'breaking-news' },
    { name: 'Jharkhand', slug: 'jharkhand' },
    { name: 'National', slug: 'national' },
    { name: 'Politics', slug: 'politics' },
    { name: 'Business', slug: 'business' },
    { name: 'Technology', slug: 'technology' },
    { name: 'World', slug: 'world' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Opinion', slug: 'opinion' },
    { name: 'Crime & Justice', slug: 'crime-justice' },
    { name: 'Science', slug: 'science' },
    { name: 'Lifestyle', slug: 'lifestyle' }
  ];

  for (const cat of defaultCategories) {
    await sql.query(`
      INSERT INTO categories (name, slug)
      VALUES ($1, $2)
      ON CONFLICT (slug) DO NOTHING;
    `, [cat.name, cat.slug]);
  }

  // 3. Truth Articles table
  console.log('3. Creating articles table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      guid TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content_html TEXT NOT NULL,
      featured_image TEXT,
      featured_video TEXT,
      gallery JSONB DEFAULT '[]'::jsonb,
      video_gallery JSONB DEFAULT '[]'::jsonb,
      categories JSONB DEFAULT '[]'::jsonb,
      tags JSONB DEFAULT '[]'::jsonb,
      author JSONB DEFAULT '{}'::jsonb,
      canonical_url TEXT,
      seo_title TEXT,
      meta_description TEXT,
      schema JSONB,
      published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      youtube_video_id TEXT,
      youtube_url TEXT,
      youtube_status TEXT,
      expires_at TIMESTAMP WITH TIME ZONE,
      featured_video_timestamp TEXT
    );
  `);

  // Add indexes for fast lookup
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles (slug);`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at DESC);`);
  await sql.query(`CREATE INDEX IF NOT EXISTS idx_articles_guid ON articles (guid);`);

  // 4. Site Settings table
  console.log('4. Creating site_settings table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      simulated_date TEXT,
      has_explicit_time BOOLEAN DEFAULT false,
      visibility_cutoff_date TIMESTAMP WITH TIME ZONE,
      breaking_news_expiry_hours INT DEFAULT 36,
      force_ad_campaign_id INT,
      wayback_base TEXT,
      whatsapp_url TEXT DEFAULT 'https://whatsapp.com/channel/YOUR_CHANNEL_ID',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // Seed default settings row if empty
  const settingsRows = await sql.query(`SELECT id FROM site_settings LIMIT 1;`);
  if (settingsRows.length === 0) {
    await sql.query(`
      INSERT INTO site_settings (whatsapp_url, breaking_news_expiry_hours)
      VALUES ('https://whatsapp.com/channel/YOUR_CHANNEL_ID', 36);
    `);
  }

  // 5. Ad Campaigns table
  console.log('5. Creating ad_campaigns table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      client_name TEXT,
      valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      valid_to TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '365 days'),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 6. Site Ads table
  console.log('6. Creating site_ads table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS site_ads (
      id SERIAL PRIMARY KEY,
      campaign_id INT REFERENCES ad_campaigns(id) ON DELETE CASCADE,
      slot_id TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'rectangle',
      image_url TEXT NOT NULL,
      target_url TEXT NOT NULL,
      active BOOLEAN DEFAULT true,
      show_in_articles BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 7. Article Translations table
  console.log('7. Creating article_translations table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS article_translations (
      id SERIAL PRIMARY KEY,
      article_guid TEXT NOT NULL,
      lang TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      content_html TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE (article_guid, lang)
    );
  `);

  // 8. Push Subscriptions table
  console.log('8. Creating push_subscriptions table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      endpoint TEXT UNIQUE NOT NULL,
      keys JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 9. RSS Sources table
  console.log('9. Creating rss_sources table...');
  await sql.query(`
    CREATE TABLE IF NOT EXISTS rss_sources (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'National',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  // 10. Check if we should restore backup articles
  const countRes = await sql.query(`SELECT COUNT(*) as count FROM articles;`);
  const currentCount = parseInt(countRes[0].count, 10);
  console.log(`Current article count in database: ${currentCount}`);

  const backupPath = path.join(__dirname, '..', 'backup', 'articles.json');
  if (currentCount === 0 && fs.existsSync(backupPath)) {
    console.log('Importing articles from backup/articles.json...');
    const articles = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log(`Found ${articles.length} articles to import.`);

    let imported = 0;
    for (const a of articles) {
      try {
        await sql.query(`
          INSERT INTO articles (
            guid, title, slug, excerpt, content_html, featured_image, featured_video,
            gallery, video_gallery, categories, tags, author, canonical_url,
            seo_title, meta_description, schema, published_at, youtube_video_id,
            youtube_url, youtube_status, expires_at, featured_video_timestamp
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $17, $18,
            $19, $20, $21, $22
          ) ON CONFLICT (guid) DO NOTHING;
        `, [
          a.guid || require('crypto').randomUUID(),
          a.title,
          a.slug,
          a.excerpt,
          a.content_html,
          a.featured_image,
          a.featured_video,
          JSON.stringify(a.gallery || []),
          JSON.stringify(a.video_gallery || []),
          JSON.stringify(a.categories || ['News']),
          JSON.stringify(a.tags || []),
          JSON.stringify(a.author || { name: 'Jharkhand Express Desk' }),
          a.canonical_url,
          a.seo_title,
          a.meta_description,
          JSON.stringify(a.schema || {}),
          a.published_at ? new Date(a.published_at) : new Date(),
          a.youtube_video_id,
          a.youtube_url,
          a.youtube_status,
          a.expires_at ? new Date(a.expires_at) : null,
          a.featured_video_timestamp
        ]);
        imported++;
      } catch (err) {
        console.warn(`Failed to insert article ${a.id} (${a.title}):`, err.message);
      }
    }
    console.log(`Successfully imported ${imported} articles into articles.`);
  }

  // Check and import backup ad campaigns and ads
  const adCampaignBackup = path.join(__dirname, '..', 'backup', 'ad_campaigns.json');
  const siteAdsBackup = path.join(__dirname, '..', 'backup', 'site_ads.json');

  if (fs.existsSync(adCampaignBackup)) {
    try {
      const campaigns = JSON.parse(fs.readFileSync(adCampaignBackup, 'utf8'));
      for (const c of campaigns) {
        await sql.query(`
          INSERT INTO ad_campaigns (id, name, client_name, valid_from, valid_to)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING;
        `, [c.id, c.name, c.client_name, c.valid_from ? new Date(c.valid_from) : new Date(), c.valid_to ? new Date(c.valid_to) : new Date()]);
      }
      // reset sequence
      await sql.query(`SELECT setval(pg_get_serial_sequence('ad_campaigns', 'id'), COALESCE(max(id), 1)) FROM ad_campaigns;`);
    } catch(e) {
      console.warn('Campaign import skipped:', e.message);
    }
  }

  if (fs.existsSync(siteAdsBackup)) {
    try {
      const ads = JSON.parse(fs.readFileSync(siteAdsBackup, 'utf8'));
      for (const ad of ads) {
        await sql.query(`
          INSERT INTO site_ads (id, campaign_id, slot_id, type, image_url, target_url, active, show_in_articles)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO NOTHING;
        `, [ad.id, ad.campaign_id, ad.slot_id, ad.type || 'rectangle', ad.image_url, ad.target_url, ad.active ?? true, ad.show_in_articles ?? true]);
      }
      await sql.query(`SELECT setval(pg_get_serial_sequence('site_ads', 'id'), COALESCE(max(id), 1)) FROM site_ads;`);
    } catch(e) {
      console.warn('Site ads import skipped:', e.message);
    }
  }

  console.log('--- Database schema initialization and data restore completed! ---');
}

init().catch(err => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
