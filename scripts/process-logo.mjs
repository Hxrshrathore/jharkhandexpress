/**
 * Logo processing script for Jharkhand Express
 * Converts the master source logo.png into all required formats:
 * - logo.webp (512×512 WebP)
 * - logo-small.webp (100×100 WebP)
 * - favicon-16.png (16×16 PNG)
 * - favicon-32.png (32×32 PNG)
 * - favicon-192.png (192×192 PWA PNG)
 * - favicon-512.png (512×512 PWA PNG)
 * - apple-touch-icon.png (180×180 iOS PNG)
 * - favicon.ico (multi-resolution 16/32/48 ICO)
 * - og-image.png (1200×630 OpenGraph banner)
 * - logo.jpeg (standard JPEG on white)
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const appDir = path.join(root, 'src', 'app');

// Pick master logo source
const masterSource = fs.existsSync(path.join(publicDir, 'logo-master.png'))
  ? path.join(publicDir, 'logo-master.png')
  : path.join(publicDir, 'logo.png');

console.log('🖼️  Processing Jharkhand Express logo assets...');
console.log('   Source:', masterSource);

if (!fs.existsSync(masterSource)) {
  console.error('❌  Master logo not found in public/');
  process.exit(1);
}

// Function to generate multi-resolution ICO file
async function generateIco(srcBuffer, outPaths) {
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map(s =>
      sharp(srcBuffer)
        .trim()
        .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer()
    )
  );

  const count = sizes.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (let i = 0; i < count; i++) {
    const s = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(s >= 256 ? 0 : s, 0);
    entry.writeUInt8(s >= 256 ? 0 : s, 1);
    entry.writeUInt8(0, 2); // Palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buf.length, 8); // Size
    entry.writeUInt32LE(offset, 12); // Offset
    dirEntries.push(entry);
    offset += buf.length;
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...pngBuffers]);
  for (const p of outPaths) {
    fs.writeFileSync(p, icoBuffer);
  }
}

async function run() {
  const masterBuffer = fs.readFileSync(masterSource);

  // 1. High-quality WebP (512×512)
  await sharp(masterBuffer)
    .trim()
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95, lossless: false })
    .toFile(path.join(publicDir, 'logo.webp'));
  console.log('✅  logo.webp (512×512)');

  // 2. Small WebP for notification prompt / header (120×120)
  await sharp(masterBuffer)
    .trim()
    .resize(120, 120, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toFile(path.join(publicDir, 'logo-small.webp'));
  console.log('✅  logo-small.webp (120×120)');

  // 3. Favicon 16×16 PNG
  await sharp(masterBuffer)
    .trim()
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-16.png'));
  console.log('✅  favicon-16.png (16×16)');

  // 4. Favicon 32×32 PNG
  await sharp(masterBuffer)
    .trim()
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-32.png'));
  console.log('✅  favicon-32.png (32×32)');

  // 5. Favicon 192×192 PNG (PWA)
  await sharp(masterBuffer)
    .trim()
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-192.png'));
  console.log('✅  favicon-192.png (192×192)');

  // 6. Favicon 512×512 PNG (PWA High-Res)
  await sharp(masterBuffer)
    .trim()
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-512.png'));
  console.log('✅  favicon-512.png (512×512)');

  // 7. Apple Touch Icon 180×180 PNG (Clean crisp white backing with comfortable padding)
  const appleInner = await sharp(masterBuffer)
    .trim()
    .resize(150, 150, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: appleInner, gravity: 'center' }])
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅  apple-touch-icon.png (180×180)');

  // 8. Multi-resolution favicon.ico for public/ and src/app/
  await generateIco(masterBuffer, [
    path.join(publicDir, 'favicon.ico'),
    path.join(appDir, 'favicon.ico'),
  ]);
  console.log('✅  favicon.ico (16×16, 32×32, 48×48) in public/ and src/app/');

  // 9. Standard JPEG version (1024×1024 on white)
  const jpegInner = await sharp(masterBuffer)
    .trim()
    .resize(960, 960, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: jpegInner, gravity: 'center' }])
    .jpeg({ quality: 92 })
    .toFile(path.join(publicDir, 'logo.jpeg'));
  console.log('✅  logo.jpeg (1024×1024)');

  // 10. OG Image (1200×630) social share banner
  // Jharkhand Express Red (#D31010) backdrop with centered emblem
  const ogLogo = await sharp(masterBuffer)
    .trim()
    .resize(480, 480, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 211, g: 16, b: 16, alpha: 1 },
    },
  })
    .composite([{ input: ogLogo, gravity: 'center' }])
    .png({ quality: 90 })
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('✅  og-image.png (1200×630)');

  console.log('\n🎉 All Jharkhand Express logo and icon assets successfully generated!');
}

run().catch(err => {
  console.error('❌  Logo processing failed:', err);
  process.exit(1);
});
