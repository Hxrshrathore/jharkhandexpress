// CJS logo processing script for Jharkhand Express
'use strict';
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

const masterSource = fs.existsSync(path.join(publicDir, 'logo-master.png'))
  ? path.join(publicDir, 'logo-master.png')
  : path.join(publicDir, 'logo.png');

console.log('🖼️  Processing Jharkhand Express logo assets (CJS)...');

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
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (let i = 0; i < count; i++) {
    const s = sizes[i];
    const buf = pngBuffers[i];
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(s >= 256 ? 0 : s, 0);
    entry.writeUInt8(s >= 256 ? 0 : s, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
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

  await sharp(masterBuffer)
    .trim()
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 95 })
    .toFile(path.join(publicDir, 'logo.webp'));

  await sharp(masterBuffer)
    .trim()
    .resize(120, 120, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90 })
    .toFile(path.join(publicDir, 'logo-small.webp'));

  await sharp(masterBuffer)
    .trim()
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-16.png'));

  await sharp(masterBuffer)
    .trim()
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-32.png'));

  await sharp(masterBuffer)
    .trim()
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-192.png'));

  await sharp(masterBuffer)
    .trim()
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon-512.png'));

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

  await generateIco(masterBuffer, [
    path.join(publicDir, 'favicon.ico'),
    path.join(appDir, 'favicon.ico'),
  ]);

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

  console.log('🎉 Done generating all logo assets!');
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
