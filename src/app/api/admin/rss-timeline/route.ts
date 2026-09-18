import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({ timeline: [], report: null });
    }

    const timeline = await redis.get('rss_timeline');
    const report = await redis.get('rss_sync_report');

    return NextResponse.json({ 
      timeline: timeline ? (typeof timeline === 'string' ? JSON.parse(timeline) : timeline) : [],
      report: report ? (typeof report === 'string' ? JSON.parse(report) : report) : null
    });
  } catch (error) {
    console.error('Redis Timeline Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline from Redis' }, { status: 500 });
  }
}
