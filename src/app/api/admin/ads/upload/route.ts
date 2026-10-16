import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

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

    let fileName = `ads/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    let contentType = file.type || 'application/octet-stream';
    
    // Lightly compress static raster images to webp at 85% quality, preserving dimensions
    if (file.type.startsWith('image/') && !file.type.includes('gif') && !file.type.includes('svg')) {
      try {
        buffer = await sharp(buffer)
          .webp({ quality: 85 })
          .toBuffer();
        contentType = 'image/webp';
        if (!fileName.toLowerCase().endsWith('.webp')) {
          fileName = fileName.replace(/\.[^.]+$/, '') + '.webp';
        }
      } catch (e) {
        console.error('Sharp compression failed, using original', e);
      }
    }

    await r2.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
    }));

    const url = `${publicUrl}/${fileName}`;
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error('Ad Upload Error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to upload ad image' }, { status: 500 });
  }
}
