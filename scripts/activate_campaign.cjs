const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function test() {
  console.log('--- UPDATING CAMPAIGN 4 VALIDITY TO ACTIVE ---');
  await sql`
    UPDATE ad_campaigns 
    SET valid_from = '2026-09-01 00:00:00+00', 
        valid_to = '2027-12-31 23:59:59+00' 
    WHERE id = 4
  `;

  const campaigns = await sql`SELECT * FROM ad_campaigns`;
  console.log('Updated campaign:', campaigns);

  // Now test the exact query from getSiteSettings:
  const ads = await sql`
    SELECT a.*, c.valid_from, c.valid_to
    FROM site_ads a
    JOIN ad_campaigns c ON a.campaign_id = c.id
    WHERE a.active = true 
    AND CURRENT_TIMESTAMP >= c.valid_from 
    AND CURRENT_TIMESTAMP <= (c.valid_to + INTERVAL '1 day')
    ORDER BY c.valid_from DESC
  `;
  console.log(`\nActive ads returned now: ${ads.length}`);
  const leaderboards = ads.filter(a => a.type === 'leaderboard');
  const rectangles = ads.filter(a => a.type === 'rectangle');
  console.log(`Leaderboards (728x90): ${leaderboards.length}`);
  console.log(`Rectangles (300x250): ${rectangles.length}`);
}

test().catch(console.error);
