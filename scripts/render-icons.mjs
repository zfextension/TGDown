import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'public/icons/logo.svg');
const outDir = path.join(root, 'public/icons');

const svg = fs.readFileSync(svgPath);

const sizes = [16, 32, 48, 128];

for (const size of sizes) {
  const out = path.join(outDir, `logo_${size}.png`);
  await sharp(svg, { density: 512 })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(out);
  console.log('wrote', out);
}
