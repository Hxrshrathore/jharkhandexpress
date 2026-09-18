/**
 * Logo processing script for Jharkhand Express
 * Converts the source logo.jpeg → logo.png (transparent), logo.webp, favicon.ico variants
 * Uses sharp (already in project dependencies)
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const src = path.join(publicDir, 'logo.jpeg');

console.log('🖼️  Processing Jharkhand Express logo...');
console.log('   Source:', src);

if (!fs.existsSync(src)) {
  console.error('❌  logo.jpeg not found in public/');
  process.exit(1);
}

async function run() {
  // 1. High-quality PNG 512×512 (with transparency - remove near-white bg)
  await sharp(src)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 6 })
    .toFile(path.join(publicDir, 'logo.png'));
  console.log('✅  logo.png (512×512)');

  // 2. WebP 512×512
  await sharp(src)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90, lossless: false })
    .toFile(path.join(publicDir, 'logo.webp'));
  console.log('✅  logo.webp (512×512)');

  // 3. Small WebP for header use (100×100)
  await sharp(src)
    .resize(100, 100, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85 })
    .toFile(path.join(publicDir, 'logo-small.webp'));
  console.log('✅  logo-small.webp (100×100)');

  // 4. OG image PNG (1200×630 news banner with logo + brand name)
  // We'll create a red banner with the circular logo 
  await sharp(src)
    .resize(1200, 630, { fit: 'contain', background: { r: 211, g: 16, b: 16, alpha: 1 } })
    .png({ quality: 90 })
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✅  og-image.png (1200×630)');

  // 5. favicon sizes (PNG) — 32×32
  await sharp(src)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-32.png'));
  console.log('✅  favicon-32.png');

  // 6. favicon sizes (PNG) — 192×192 (PWA)
  await sharp(src)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-192.png'));
  console.log('✅  favicon-192.png');

  // 7. Apple touch icon 180×180
  await sharp(src)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅  apple-touch-icon.png (180×180)');

  console.log('\n✨  All logo assets generated successfully!');
  console.log('   Generated files:');
  console.log('     public/logo.png');
  console.log('     public/logo.webp');
  console.log('     public/logo-small.webp');
  console.log('     public/og-image.png');
  console.log('     public/favicon-32.png');
  console.log('     public/favicon-192.png');
  console.log('     public/apple-touch-icon.png');
}

run().catch(err => {
  console.error('❌  Logo processing failed:', err);
  process.exit(1);
});
