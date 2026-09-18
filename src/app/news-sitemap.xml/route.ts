import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { BRAND } from '@/lib/brand';

export const dynamic = 'force-dynamic';
export const revalidate = 900; // Refresh every 15 minutes for breaking news freshness

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  try {
    // Google News strictly indexes articles published within the last 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const articles = await sql`
      SELECT slug, title, published_at, categories 
      FROM truth_articles 
      WHERE published_at >= ${fortyEightHoursAgo}
      AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY published_at DESC 
      LIMIT 1000
    `;

    const baseUrl = BRAND.url;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .map((art: any) => {
    const pubDate = new Date(art.published_at).toISOString();
    const cleanTitle = escapeXml(art.title);
    const articleUrl = `${baseUrl}/article/${art.slug}`;

    return `  <url>
    <loc>${articleUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(BRAND.name)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${cleanTitle}</news:title>
    </news:news>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error generating news sitemap:', error);
    return new NextResponse('Error generating news sitemap', { status: 500 });
  }
}
