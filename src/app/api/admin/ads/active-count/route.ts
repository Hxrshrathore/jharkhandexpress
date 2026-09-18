import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const res = await sql`
      SELECT COUNT(*) as count 
      FROM site_ads sa
      JOIN ad_campaigns ac ON sa.campaign_id = ac.id
      WHERE sa.active = true 
        AND sa.show_in_articles = true 
        AND ac.valid_to >= NOW()
        AND ac.valid_from <= NOW();
    `;
    return NextResponse.json({ count: Math.min(parseInt(res[0].count) || 0, 6) });
  } catch (err) {
    console.error('Failed to get active ad count', err);
    return NextResponse.json({ count: 0 });
  }
}
