// CJS logo processing script for Jharkhand Express
'use strict';
const sharp = require('sharp');
const path = require('path');

const src = path.join(__dirname, '..', 'public', 'logo.jpeg');
const out = path.join(__dirname, '..', 'public');

console.log('🖼️  Processing Jharkhand Express logo...');

Promise.all([
  sharp(src).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ quality: 100 }).toFile(path.join(out, 'logo.png')).then(() => console.log('✅ logo.png (512×512)')),
  sharp(src).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toFile(path.join(out, 'logo.webp')).then(() => console.log('✅ logo.webp (512×512)')),
  sharp(src).resize(100, 100, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 85 }).toFile(path.join(out, 'logo-small.webp')).then(() => console.log('✅ logo-small.webp (100×100)')),
  sharp(src).resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(out, 'favicon-32.png')).then(() => console.log('✅ favicon-32.png')),
  sharp(src).resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(path.join(out, 'favicon-192.png')).then(() => console.log('✅ favicon-192.png')),
  sharp(src).resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toFile(path.join(out, 'apple-touch-icon.png')).then(() => console.log('✅ apple-touch-icon.png (180×180)')),
  sharp(src).resize(1200, 630, { fit: 'contain', background: { r: 211, g: 16, b: 16, alpha: 1 } }).png({ quality: 90 }).toFile(path.join(out, 'og-image.png')).then(() => console.log('✅ og-image.png (1200×630)'))
]).then(() => {
  console.log('\n🎉 All Jharkhand Express logo assets generated!');
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
