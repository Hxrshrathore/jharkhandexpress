import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

function generateFaviconUrl(website: string): string {
  if (!website) return '';
  let domain = website.trim();
  try {
    if (domain.startsWith('http')) {
      domain = new URL(domain).hostname;
    }
  } catch (e) {}
  domain = domain.replace(/^www\./, '');
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : '';
}

export async function GET() {
  try {
    const sources = await sql`
      SELECT * FROM rss_sources ORDER BY id ASC
    `;
    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Error fetching RSS sources:', error);
    return NextResponse.json({ error: 'Failed to fetch RSS sources' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { media_house_name, description, category, sub_category, rss_feed, website } = body;

    if (!media_house_name || !rss_feed) {
      return NextResponse.json({ error: 'Media house name and RSS feed are required' }, { status: 400 });
    }

    const favicon_url = generateFaviconUrl(website);

    const newSource = await sql`
      INSERT INTO rss_sources (media_house_name, description, category, sub_category, rss_feed, website, favicon_url)
      VALUES (${media_house_name}, ${description}, ${category}, ${sub_category}, ${rss_feed}, ${website}, ${favicon_url})
      RETURNING *
    `;

    return NextResponse.json({ source: newSource[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating RSS source:', error);
    return NextResponse.json({ error: 'Failed to create RSS source' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM rss_sources WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting RSS source:', error);
    return NextResponse.json({ error: 'Failed to delete RSS source' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await request.json();
    if (typeof body.is_active !== 'boolean') {
      return NextResponse.json({ error: 'is_active boolean is required' }, { status: 400 });
    }

    const updatedSource = await sql`
      UPDATE rss_sources 
      SET is_active = ${body.is_active}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ source: updatedSource[0] });
  } catch (error) {
    console.error('Error updating RSS source:', error);
    return NextResponse.json({ error: 'Failed to update RSS source' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { media_house_name, description, category, sub_category, rss_feed, website } = body;

    if (!media_house_name || !rss_feed) {
      return NextResponse.json({ error: 'Media house name and RSS feed are required' }, { status: 400 });
    }

    const favicon_url = generateFaviconUrl(website);

    const updatedSource = await sql`
      UPDATE rss_sources 
      SET 
        media_house_name = ${media_house_name},
        description = ${description},
        category = ${category},
        sub_category = ${sub_category},
        rss_feed = ${rss_feed},
        website = ${website},
        favicon_url = ${favicon_url}
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ source: updatedSource[0] });
  } catch (error) {
    console.error('Error updating RSS source details:', error);
    return NextResponse.json({ error: 'Failed to update RSS source details' }, { status: 500 });
  }
}
