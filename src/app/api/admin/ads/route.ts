import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function GET() {
  try {
    const campaigns = await sql`
      SELECT c.id, c.name, c.valid_from, c.valid_to,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', a.id,
                   'type', a.type,
                   'image_url', a.image_url,
                   'active', a.active,
                   'show_in_articles', a.show_in_articles,
                   'show_on_homepage', a.show_on_homepage
                 )
               ) FILTER (WHERE a.id IS NOT NULL), '[]'
             ) as ads
      FROM ad_campaigns c
      LEFT JOIN site_ads a ON c.id = a.campaign_id
      GROUP BY c.id
      ORDER BY c.valid_from DESC
    `;
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, valid_from, valid_to, ads } = body;

    if (!name || !valid_from || !valid_to) {
      return NextResponse.json({ error: 'Missing required campaign fields' }, { status: 400 });
    }

    const requestedArticleAdsCount = (ads || []).filter((a: any) => a.type === 'leaderboard' && a.show_in_articles).length;
    if (requestedArticleAdsCount > 0) {
      const activeArticleAdsCountResult = await sql`
        SELECT COUNT(*) as count 
        FROM site_ads a
        JOIN ad_campaigns c ON a.campaign_id = c.id
        WHERE a.type = 'leaderboard' 
        AND a.show_in_articles = true 
        AND c.valid_to >= NOW()
      `;
      const currentActive = parseInt(activeArticleAdsCountResult[0].count, 10);
      if (currentActive + requestedArticleAdsCount > 6) {
        return NextResponse.json({ error: `Cannot exceed 6 active article ads globally. Currently active: ${currentActive}` }, { status: 400 });
      }
    }

    const campaignResult = await sql`
      INSERT INTO ad_campaigns (name, valid_from, valid_to)
      VALUES (${name}, ${valid_from}, ${valid_to})
      RETURNING *
    `;
    const campaignId = campaignResult[0].id;

    if (ads && ads.length > 0) {
      for (const ad of ads) {
        await sql`
          INSERT INTO site_ads (campaign_id, type, image_url, active, show_in_articles, show_on_homepage)
          VALUES (${campaignId}, ${ad.type}, ${ad.image_url}, true, ${ad.show_in_articles || false}, ${ad.show_on_homepage ?? true})
        `;
      }
    }

    return NextResponse.json({ success: true, campaign_id: campaignId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save campaign' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, valid_from, valid_to, ads } = body;

    if (!id || !name || !valid_from || !valid_to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Capacity Check
    const newAdsWithArticleFlag = (ads || []).filter((a: any) => !a.id && a.type === 'leaderboard' && a.show_in_articles).length;
    if (newAdsWithArticleFlag > 0) {
      const activeResult = await sql`SELECT COUNT(*) as count FROM site_ads a JOIN ad_campaigns c ON a.campaign_id = c.id WHERE a.type = 'leaderboard' AND a.show_in_articles = true AND c.valid_to >= NOW() AND c.id != ${id}`;
      const currentActive = parseInt(activeResult[0].count, 10);
      if (currentActive + newAdsWithArticleFlag > 6) {
        return NextResponse.json({ error: `Cannot exceed 6 active article ads globally.` }, { status: 400 });
      }
    }

    await sql`UPDATE ad_campaigns SET name = ${name}, valid_from = ${valid_from}, valid_to = ${valid_to} WHERE id = ${id}`;

    const existingAds = await sql`SELECT id, image_url FROM site_ads WHERE campaign_id = ${id}`;
    const newAdIds = (ads || []).map((a: any) => a.id).filter(Boolean);
    
    // Delete ads not in payload
    for (const oldAd of existingAds) {
      if (!newAdIds.includes(oldAd.id)) {
        try {
          const match = oldAd.image_url.match(/ads\/[^\/?#]+/);
          if (match) {
            await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME || 'newsbridge-bucket', Key: match[0] }));
          }
        } catch (e) { console.error('R2 delete failed', e); }
        await sql`DELETE FROM site_ads WHERE id = ${oldAd.id}`;
      }
    }

    if (ads && ads.length > 0) {
      for (const ad of ads) {
        if (ad.id) {
          await sql`UPDATE site_ads SET show_in_articles = ${ad.show_in_articles || false}, show_on_homepage = ${ad.show_on_homepage ?? true}, type = ${ad.type} WHERE id = ${ad.id}`;
        } else {
          await sql`INSERT INTO site_ads (campaign_id, type, image_url, active, show_in_articles, show_on_homepage) VALUES (${id}, ${ad.type}, ${ad.image_url}, true, ${ad.show_in_articles || false}, ${ad.show_on_homepage ?? true})`;
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) return NextResponse.json({ error: 'Missing Campaign ID' }, { status: 400 });

    const existingAds = await sql`SELECT id, image_url FROM site_ads WHERE campaign_id = ${id}`;
    for (const ad of existingAds) {
      try {
        const match = ad.image_url.match(/ads\/[^\/?#]+/);
        if (match) {
          await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME || 'newsbridge-bucket', Key: match[0] }));
        }
      } catch (e) { console.error('R2 delete failed', e); }
    }

    await sql`DELETE FROM ad_campaigns WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
