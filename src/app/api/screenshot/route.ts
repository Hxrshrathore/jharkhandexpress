import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// Extend timeout to 90s — thum.io with noanimate/ blocks until the real screenshot
// is ready, which can take 40-50s for a cold render.
export const maxDuration = 90;

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

    // _cacheBuster forces thum.io to see this as a completely new URL, bypassing any cached spinners
    const separator = url.includes('?') ? '&' : '?';
    const cacheBustedUrl = `${url}${separator}_cb=${Date.now()}`;

    // noanimate/ — blocks until the real screenshot is ready (no spinner GIF returned)
    // wait/4/    — gives the page 4s after load to finish JS/fonts/animations
    // maxAge/0/  — tells thum.io to never use a cached image
    // fullpage/  — captures the entire page from top to bottom
    // allowJPG/  — smaller file size
    const thumUrl = `https://image.thum.io/get/noanimate/wait/4/maxAge/0/fullpage/width/1280/allowJPG/${cacheBustedUrl}`;

    // 60s timeout: thum.io with noanimate blocks until render is done, which can take ~20-40s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60_000);

    let thumRes: Response;
    try {
      thumRes = await fetch(thumUrl, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!thumRes.ok) {
      throw new Error(`Thum.io returned ${thumRes.status}`);
    }

    // Guard: thum.io returns a GIF spinner if noanimate is ignored (shouldn't happen, but be safe)
    const contentType = thumRes.headers.get('content-type') || '';
    if (contentType.includes('gif')) {
      throw new Error('Thum.io returned a loading spinner instead of a real screenshot');
    }

    const buffer = Buffer.from(await thumRes.arrayBuffer());

    const bucketName = process.env.R2_BUCKET_NAME || 'newsbridge-bucket';
    const publicUrl = process.env.R2_PUBLIC_URL || 'https://cdn.jharkhandexpress.com';
    const fileName = `media/screenshot-${crypto.randomUUID()}.jpg`;

    await r2.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000',
    }));

    return NextResponse.json({ success: true, url: `${publicUrl}/${fileName}` });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json({ error: 'Failed to capture screenshot' }, { status: 500 });
  }
}
