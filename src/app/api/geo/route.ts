import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { getRedisClient } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    
    let clientIp = '';
    if (forwardedFor) {
      clientIp = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp.trim();
    }

    // Rate limiting: 10 requests per 10 seconds per IP
    const redis = getRedisClient();
    if (redis) {
      const ratelimit = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(10, '10 s'),
        ephemeralCache: new Map(), // Optional: local memory cache for faster subsequent checks
      });
      
      const { success } = await ratelimit.limit(clientIp || '127.0.0.1');
      if (!success) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    }


    // If running locally, fetch the developer's actual public IP so geoip works accurately
    if (!clientIp || clientIp === '::1' || clientIp === '127.0.0.1') {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          clientIp = ipData.ip;
        } else {
          clientIp = '49.36.222.12'; // Fallback to Delhi
        }
      } catch (e) {
        clientIp = '49.36.222.12'; // Fallback to Delhi
      }
    }

    // Call ip-api.com from the SERVER SIDE
    const url = clientIp ? `http://ip-api.com/json/${clientIp}` : 'http://ip-api.com/json/';
    const res = await fetch(url);
    
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        return NextResponse.json({
          latitude: data.lat,
          longitude: data.lon,
          city: data.city || 'Delhi',
          region: data.regionName || 'Delhi',
          country: data.countryCode || 'IN',
        });
      }
    }

    // Fallback if IP couldn't be resolved
    return NextResponse.json({
      latitude: 28.6139,
      longitude: 77.2090,
      city: 'Delhi',
      region: 'Delhi',
      country: 'IN',
    });
  } catch (error) {
    console.error('Geolocation error:', error);
    return NextResponse.json({
      latitude: 28.6139,
      longitude: 77.2090,
      city: 'Delhi',
      region: 'Delhi',
      country: 'IN',
    });
  }
}
