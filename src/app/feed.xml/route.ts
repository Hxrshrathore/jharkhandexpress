import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { BRAND } from '@/lib/brand';

export const dynamic = 'force-dynamic';
export const revalidate = 900;

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
    const articles = await sql`
      SELECT id, guid, title, slug, excerpt, content_html, featured_image, published_at, categories, author 
      FROM articles 
      WHERE (expires_at IS NULL OR expires_at > NOW())
      ORDER BY published_at DESC 
      LIMIT 50
    `;

    const baseUrl = BRAND.url;
    const now = new Date().toUTCString();

    const itemsXml = articles.map((art: any) => {
      const link = `${baseUrl}/article/${art.slug}`;
      const pubDate = new Date(art.published_at || new Date()).toUTCString();
      const authorObj = typeof art.author === 'string' ? JSON.parse(art.author || '{}') : (art.author || {});
      const authorName = authorObj.name || BRAND.defaultAuthor;
      
      let categoryName = 'General';
      if (Array.isArray(art.categories) && art.categories.length > 0) {
        categoryName = typeof art.categories[0] === 'string' ? art.categories[0] : art.categories[0].name || 'General';
      }

      return `    <item>
      <title>${escapeXml(art.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(authorName)}</author>
      <category>${escapeXml(categoryName)}</category>
      <description>${escapeXml(art.excerpt || art.title)}</description>
      ${art.featured_image ? `<enclosure url="${escapeXml(art.featured_image)}" type="image/jpeg" length="0" />` : ''}
    </item>`;
    }).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(BRAND.name)} — Latest Jharkhand News</title>
    <link>${baseUrl}</link>
    <description>${escapeXml(BRAND.description)}</description>
    <language>en-in</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}
