/**
 * compress-images.mjs
 * Compress all sabun-garam images ke WebP quality 82 (~60-80KB setiap satu)
 * Guna nama fail yang sama — tiada perubahan code diperlukan
 *
 * Usage: node scripts/compress-images.mjs
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = join(__dirname, '..', 'public', 'images', 'sabun-garam');

async function compressImages() {
  console.log('🖼️  Compressing sabun-garam images...\n');

  const files = await readdir(IMAGE_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of imageFiles) {
    const filePath = join(IMAGE_DIR, file);
    const ext = extname(file).toLowerCase();

    const statBefore = await stat(filePath);
    const sizeBefore = statBefore.size;
    totalBefore += sizeBefore;

    try {
      // Read file sebagai buffer dulu (solve JPEG Windows path issues)
      const { readFile, writeFile } = await import('fs/promises');
      const inputBuffer = await readFile(filePath);
      const meta = await sharp(inputBuffer).metadata();

      let pipeline = sharp(inputBuffer);

      // Resize kalau lebar > 800px
      if (meta.width && meta.width > 800) {
        pipeline = pipeline.resize(800, null, { withoutEnlargement: true });
      }

      // Convert ke WebP quality 82 — overwrite dengan nama fail asal
      const compressed = await pipeline
        .webp({ quality: 82, effort: 4 })
        .toBuffer();

      await writeFile(filePath, compressed);

      const statAfter = await stat(filePath);
      const sizeAfter = statAfter.size;
      totalAfter += sizeAfter;

      const savings = Math.round((1 - sizeAfter / sizeBefore) * 100);
      const beforeKB = (sizeBefore / 1024).toFixed(0);
      const afterKB = (sizeAfter / 1024).toFixed(0);

      console.log(`✅ ${file.padEnd(40)} ${beforeKB.padStart(5)} KB → ${afterKB.padStart(4)} KB  (-${savings}%)`);
    } catch (err) {
      console.error(`❌ ${file}: ${err.message}`);
    }
  }

  const totalBeforeKB = (totalBefore / 1024).toFixed(0);
  const totalAfterKB = (totalAfter / 1024).toFixed(0);
  const totalSavings = Math.round((1 - totalAfter / totalBefore) * 100);

  console.log('\n─────────────────────────────────────────────────────────');
  console.log(`📦 Total: ${totalBeforeKB} KB → ${totalAfterKB} KB  (-${totalSavings}% saved)`);
  console.log('✨ Done! Deploy untuk kesan penuh.\n');
}

compressImages().catch(console.error);
