import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { getRedisClient } from '@/lib/redis';

// Local in-memory cache
let localCache: {
  expiresAt: number;
  data: Record<string, { petrol: string; diesel: string }>;
} | null = null;

function getSecondsUntilNextIST60130AM(): number {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffsetMs);
  
  const targetIST = new Date(nowIST);
  targetIST.setUTCHours(6, 1, 30, 0); // 6:01:30 AM IST
  
  if (nowIST.getTime() > targetIST.getTime()) {
    targetIST.setUTCDate(targetIST.getUTCDate() + 1);
  }
  
  const targetUTC = new Date(targetIST.getTime() - istOffsetMs);
  return Math.max(60, Math.floor((targetUTC.getTime() - now.getTime()) / 1000));
}
const REDIS_KEY = 'fuel_prices_all_states';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');

  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  let clientIp = '127.0.0.1';
  if (forwardedFor) {
    clientIp = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    clientIp = realIp.trim();
  }

  const redis = getRedisClient();
  if (redis) {
    const ratelimit = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(20, '10 s'),
      ephemeralCache: new Map(),
    });
    const { success } = await ratelimit.limit(clientIp);
    if (!success) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  if (!state) {
    return NextResponse.json({ error: 'State parameter is required' }, { status: 400 });
  }

  const now = Date.now();

  // 1. Check Local Memory Cache
  if (localCache && now < localCache.expiresAt) {
    return NextResponse.json(localCache.data[state] || localCache.data['Jharkhand'] || null);
  }

  try {
    // 2. Check Upstash Redis Cache gracefully
    let redisData = null;
    let redis = null;
    try {
      redis = getRedisClient();
      if (redis) {
        redisData = await redis.get<Record<string, { petrol: string; diesel: string }>>(REDIS_KEY);
      }
    } catch (e) {
      console.warn('Redis connection/get failed, skipping cache read:', e);
    }

    if (redisData) {
      // Hydrate local cache
      localCache = {
        expiresAt: now + (getSecondsUntilNextIST60130AM() * 1000),
        data: redisData,
      };
      return NextResponse.json(redisData[state] || redisData['Jharkhand'] || null);
    }

    // 3. Fetch from Indian API if Redis is empty/stale
    // CRITICAL: We only have 60 requests per month! 
    // We MUST NOT fetch from the Indian API if Redis is missing or failed, 
    // otherwise every visitor will trigger a fetch and drain our quota instantly.
    if (!redis) {
      console.warn('Redis is unavailable. Returning fallback fuel data to protect Indian API quota.');
      return NextResponse.json({ petrol: '98.50', diesel: '90.20' }); // Generic fallback
    }

    const apiKey = process.env.INDIAN_API_KEY;
    const fallbackApiKey = 'sk-live-v0Eg9QDj49VogZTKh3CRjTZowYURPyKoh9fyjju3';
    
    if (!apiKey) {
      console.error('INDIAN_API_KEY is not configured in environment variables');
      // We will try fallback below instead of returning generic immediately
    }

    let headers = { 'x-api-key': apiKey || fallbackApiKey };

    let [petrolRes, dieselRes] = await Promise.all([
      fetch('https://fuel.indianapi.in/live_fuel_price?fuel_type=petrol&location_type=state', { headers }),
      fetch('https://fuel.indianapi.in/live_fuel_price?fuel_type=diesel&location_type=state', { headers })
    ]);

    if (!petrolRes.ok || !dieselRes.ok) {
      console.warn('First Indian API Key failed, switching to Fallback API Key...');
      headers = { 'x-api-key': fallbackApiKey };
      [petrolRes, dieselRes] = await Promise.all([
        fetch('https://fuel.indianapi.in/live_fuel_price?fuel_type=petrol&location_type=state', { headers }),
        fetch('https://fuel.indianapi.in/live_fuel_price?fuel_type=diesel&location_type=state', { headers })
      ]);
      
      if (!petrolRes.ok || !dieselRes.ok) {
        const pText = await petrolRes.text().catch(() => '');
        const dText = await dieselRes.text().catch(() => '');
        console.error(`Fallback Indian API Error Details - Petrol [${petrolRes.status}]: ${pText} | Diesel [${dieselRes.status}]: ${dText}`);
        console.warn('Both API keys failed (likely rate limit). Returning fallback data.');
        return NextResponse.json({ petrol: '98.50', diesel: '90.20' }); // Generic fallback
      }
    }

    const petrolData = await petrolRes.json();
    const dieselData = await dieselRes.json();

    const mergedData: Record<string, { petrol: string; diesel: string }> = {};

    // Assuming the API returns an array of { city: 'StateName', price: '99.99' }
    petrolData.forEach((item: any) => {
      if (item && item.city) {
        mergedData[item.city] = {
          petrol: item.price,
          diesel: 'N/A' // Default if missing
        };
      }
    });

    dieselData.forEach((item: any) => {
      if (item && item.city) {
        if (mergedData[item.city]) {
          mergedData[item.city].diesel = item.price;
        } else {
          mergedData[item.city] = {
            petrol: 'N/A',
            diesel: item.price
          };
        }
      }
    });

    const secondsToExpiry = getSecondsUntilNextIST60130AM();

    // 4. Save to Upstash Redis (gracefully)
    try {
      if (redis) {
        await redis.set(REDIS_KEY, mergedData, { ex: secondsToExpiry });
      }
    } catch (e) {
      console.warn('Redis save failed:', e);
    }

    // 5. Save to Local Cache
    localCache = {
      expiresAt: now + (secondsToExpiry * 1000),
      data: mergedData,
    };

    return NextResponse.json(mergedData[state] || mergedData['Jharkhand'] || null);
  } catch (error) {
    console.error('Fuel API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch fuel prices' }, { status: 500 });
  }
}
