import { NextResponse } from 'next/server';
import { BRAND } from '@/lib/brand';

const INDEXNOW_KEY = 'jharkhandexpress2026seo';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const urls: string[] = Array.isArray(body.urls) ? body.urls : [body.url].filter(Boolean);

    if (urls.length === 0) {
      return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
    }

    const host = new URL(BRAND.url).host;

    // Send payload to IndexNow endpoint
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${BRAND.url}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });

    const success = response.status === 200 || response.status === 202;

    return NextResponse.json({
      success,
      status: response.status,
      submittedUrls: urls,
      message: success ? 'Successfully notified search engines via IndexNow' : 'IndexNow response received',
    });
  } catch (error: any) {
    console.error('Error submitting to IndexNow:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit IndexNow' }, { status: 500 });
  }
}
