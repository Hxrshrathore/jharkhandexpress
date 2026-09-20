import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import sharp from 'sharp';
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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No valid file provided or file is empty' }, { status: 400 });
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'jharkhand-express';
    const publicUrl = process.env.R2_PUBLIC_URL || 'https://cdn.jharkhandexpress.in';

    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'File buffer is empty' }, { status: 400 });
    }

    let contentType = file.type || 'application/octet-stream';
    let baseName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');

    if (file.type.startsWith('image/') && !file.type.includes('svg') && !file.type.includes('gif')) {
      try {
        buffer = await sharp(buffer)
          .webp({ quality: 75 })
          .toBuffer();
        contentType = 'image/webp';
        baseName = baseName.replace(/\.[^/.]+$/, '.webp');
      } catch (sharpError) {
        console.warn('Sharp compression skipped, proceeding with original:', sharpError);
      }
    }

    // Store in media/ prefix
    const fileName = `media/${crypto.randomUUID()}-${baseName}`;

    await r2.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
    }));

    const url = `${publicUrl}/${fileName}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Media Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload media image' }, { status: 500 });
  }
}
