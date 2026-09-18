import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getRedisClient } from '@/lib/redis';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure', 'content:encoded'],
  }
});

// Using GET to allow triggering from browser easily without complex fetch (or POST if preferred, but GET is fine for admin sync action for simplicity)
export async function POST() {
  try {
    // 1. Fetch active sources from Neon
    const sources = await sql`
      SELECT id, media_house_name, rss_feed, favicon_url, category, sub_category 
      FROM rss_sources 
      WHERE is_active = true OR is_active IS NULL
    `;

    const allArticles: any[] = [];
    let successfulCount = 0;
    const failedSources: { name: string, error: string }[] = [];

    // 2. Sequentially fetch to avoid overwhelming edge/server and network bottlenecks
    for (const source of sources) {
      try {
        // Increase timeout to 8 seconds for slower servers
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const feedUrl = source.rss_feed.startsWith('http') ? source.rss_feed : `https://${source.rss_feed}`;
        
        // Add User-Agent to bypass Cloudflare/Bot protection (fixes 403/404s)
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
        
        // Basic sanitization for malformed XML (e.g. NDTV, Business Standard)
        // Fix unescaped ampersands (but avoid breaking already escaped ones)
        xml = xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g, '&amp;');

        const feed = await parser.parseString(xml);
        
        // Map top 10 items from each feed to prevent massive bloat
        const parsedItems = feed.items.slice(0, 10).map(item => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: item.contentSnippet || item.content || '',
          guid: item.guid || (item as any).id || item.link,
          source_name: source.media_house_name,
          favicon_url: source.favicon_url,
          category: source.category
        }));

        allArticles.push(...parsedItems);
        successfulCount++;
      } catch (err: any) {
        failedSources.push({
          name: source.media_house_name,
          error: err.name === 'AbortError' ? 'Timeout after 5s' : (err.message || 'Parse Error')
        });
      }
    }

    // 3. Sort articles by date descending
    allArticles.sort((a, b) => {
      const dateA = new Date(a.pubDate || 0).getTime();
      const dateB = new Date(b.pubDate || 0).getTime();
      return dateB - dateA;
    });

    // Take top 300 articles to avoid Upstash size limits
    const timeline = allArticles.slice(0, 300);

    const syncReport = {
      timestamp: new Date().toISOString(),
      totalScanned: timeline.length,
      activeSources: sources.length,
      successfulCount,
      failedCount: failedSources.length,
      failedSources
    };

    // 4. Cache in Upstash Redis
    const redis = getRedisClient();
    if (redis) {
      const lockKey = 'rss_sync_lock';
      const isLocked = await redis.get(lockKey);
      if (isLocked) {
        return NextResponse.json({ success: false, error: 'Sync already in progress' }, { status: 409 });
      }
      await redis.set(lockKey, 'true', { ex: 300 }); // Lock for 5 minutes maximum
      await redis.set('rss_timeline', JSON.stringify(timeline));
      await redis.set('rss_sync_report', JSON.stringify(syncReport));
      await redis.del(lockKey);
    }

    return NextResponse.json({ success: true, report: syncReport });
  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync feeds' }, { status: 500 });
  }
}
