import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure', 'content:encoded'],
  }
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const feedUrl = url.startsWith('http') ? url : `https://${url}`;

    // Use AbortController for an 8s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Fetch raw XML with spoofed User-Agent to bypass Cloudflare/bot protection
    const response = await fetch(feedUrl, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/rdf+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    let xml = await response.text();

    // Basic sanitization for malformed XML (Fix unescaped ampersands)
    xml = xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g, '&amp;');

    const feed = await parser.parseString(xml);

    // Only return the top 10 items for the preview
    const previewItems = feed.items.slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet || item.content || '',
      guid: item.guid || (item as any).id || item.link
    }));

    return NextResponse.json({
      title: feed.title,
      description: feed.description,
      items: previewItems
    });
  } catch (error: any) {
    console.error('RSS Preview Error:', error.message);
    return NextResponse.json({ error: 'Failed to parse RSS feed. Ensure the URL is a valid XML feed.' }, { status: 500 });
  }
}
