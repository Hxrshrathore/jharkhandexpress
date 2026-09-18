const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function check() {
  const ads = await sql`SELECT id, campaign_id, slot_id, type, image_url, active, show_in_articles, show_on_homepage FROM site_ads`;
  console.log(`Total ads: ${ads.length}`);
  console.log(JSON.stringify(ads, null, 2));
}

check().catch(console.error);
