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
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bucketName = process.env.R2_BUCKET_NAME || 'jharkhand-express';
    const publicUrl = process.env.R2_PUBLIC_URL || 'https://cdn.jharkhandexpress.in';

    // Avoid putting everything in ads folder, use media/
    const fileName = `media/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);

    if (file.type.startsWith('image/')) {
      try {
        buffer = await sharp(buffer)
          .webp({ quality: 70 })
          .toBuffer();
      } catch (sharpError) {
        console.warn('Sharp compression failed, proceeding with original buffer', sharpError);
      }
    }

    await r2.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000',
    }));

    const url = `${publicUrl}/${fileName}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Media Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload media image' }, { status: 500 });
  }
}
