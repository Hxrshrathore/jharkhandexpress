const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function run() {
  const tables = ['ad_campaigns', 'site_ads', 'site_settings', 'categories', 'articles', 'push_subscriptions', 'rss_sources', 'article_translations'];
  for (const t of tables) {
    try {
      const c = await sql.query(`SELECT count(*) FROM ${t}`);
      console.log(`${t}: ${c.rows ? c.rows[0].count : c[0].count} rows`);
    } catch (e) {
      console.log(`${t}: error ${e.message}`);
    }
  }
}
run();
