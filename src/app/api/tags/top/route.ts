import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({ success: true, tags: [] }, {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Fetch the top tags from the ZSET (highest score first)
    // zrange returns an array of elements. With 'WITHSCORES' it alternates member, score, member, score...
    // In @upstash/redis, withScores option returns [{member, score}]
    const rawTags = await redis.zrange('top_tags', 0, limit - 1, {
      rev: true,
      withScores: true
    }) as (string | number)[];

    const formattedTags: { member: string; score: number }[] = [];
    for (let i = 0; i < rawTags.length; i += 2) {
      formattedTags.push({
        member: String(rawTags[i]),
        score: Number(rawTags[i + 1]),
      });
    }

    return NextResponse.json({ success: true, tags: formattedTags }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch top tags from Redis', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
