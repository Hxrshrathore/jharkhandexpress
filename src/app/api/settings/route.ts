import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  noStore();
  try {
    const settings = await sql`SELECT * FROM site_settings ORDER BY id DESC LIMIT 1`;
    const settingsRow = settings[0] || {};
    
    let ads;
    if (settingsRow.force_ad_campaign_id) {
      ads = await sql`
        SELECT a.*, c.valid_from, c.valid_to
        FROM site_ads a
        JOIN ad_campaigns c ON a.campaign_id = c.id
        WHERE c.id = ${settingsRow.force_ad_campaign_id}
      `;
    } else {
      ads = await sql`
        SELECT a.*, c.valid_from, c.valid_to
        FROM site_ads a
        JOIN ad_campaigns c ON a.campaign_id = c.id
        WHERE a.active = true 
        AND CURRENT_TIMESTAMP BETWEEN c.valid_from AND c.valid_to
        ORDER BY c.valid_from DESC
      `;
    }
    
    return NextResponse.json({ ...settingsRow, site_ads: ads }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      visibility_cutoff_date, 
      simulated_date, 
      ad1_url, 
      ad2_url, 
      maintenance_mode,
      maintenance_auto_deactivate,
      maintenance_end_time,
      maintenance_reason,
      force_ad_campaign_id,
      whatsapp_url,
      google_news_url,
      breaking_news_expiry_hours
    } = body;

    const count = await sql`SELECT COUNT(*) FROM site_settings`;
    
    if (count[0].count === '0') {
      await sql`
        INSERT INTO site_settings (
          visibility_cutoff_date, simulated_date, ad1_url, ad2_url, 
          maintenance_mode, maintenance_auto_deactivate, maintenance_end_time, maintenance_reason, force_ad_campaign_id, whatsapp_url, google_news_url, breaking_news_expiry_hours, updated_at
        ) 
        VALUES (
          ${visibility_cutoff_date || null}, ${simulated_date || null}, ${ad1_url || null}, ${ad2_url || null}, 
          ${maintenance_mode || false}, ${maintenance_auto_deactivate || false}, ${maintenance_end_time || null}, ${maintenance_reason || 'maintenance'}, ${force_ad_campaign_id || null}, ${whatsapp_url || null}, ${google_news_url || null}, ${breaking_news_expiry_hours !== undefined ? breaking_news_expiry_hours : 36}, CURRENT_TIMESTAMP
        )
      `;
    } else {
      await sql`
        UPDATE site_settings SET 
          visibility_cutoff_date = ${visibility_cutoff_date !== undefined ? visibility_cutoff_date : null},
          simulated_date = ${simulated_date !== undefined ? simulated_date : null},
          ad1_url = ${ad1_url !== undefined ? ad1_url : null},
          ad2_url = ${ad2_url !== undefined ? ad2_url : null},
          maintenance_mode = ${maintenance_mode !== undefined ? maintenance_mode : false},
          maintenance_auto_deactivate = ${maintenance_auto_deactivate !== undefined ? maintenance_auto_deactivate : false},
          maintenance_end_time = ${maintenance_end_time !== undefined ? maintenance_end_time : null},
          maintenance_reason = ${maintenance_reason !== undefined ? maintenance_reason : 'maintenance'},
          force_ad_campaign_id = ${force_ad_campaign_id !== undefined ? force_ad_campaign_id : null},
          whatsapp_url = ${whatsapp_url !== undefined ? whatsapp_url : null},
          google_news_url = ${google_news_url !== undefined ? google_news_url : null},
          breaking_news_expiry_hours = ${breaking_news_expiry_hours !== undefined ? breaking_news_expiry_hours : 36},
          updated_at = CURRENT_TIMESTAMP
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
