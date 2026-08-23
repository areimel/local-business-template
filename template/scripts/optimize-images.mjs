import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';

const INPUT_DIR = 'temp_images';
const OUTPUT_DIR = 'temp_images/optimized';
const MAX_WIDTH = 2400;
const TARGET_KB = 450;
const JPEG_QUALITY = 80;

await mkdir(OUTPUT_DIR, { recursive: true });

const files = await readdir(INPUT_DIR);
const imageFiles = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));

console.log(`Found ${imageFiles.length} images to optimize\n`);

for (const file of imageFiles) {
  const inputPath = join(INPUT_DIR, file);
  const outputName = basename(file, extname(file)) + '.jpg';
  const outputPath = join(OUTPUT_DIR, outputName);

  const originalStats = await stat(inputPath);
  const originalKB = (originalStats.size / 1024).toFixed(0);

  let quality = JPEG_QUALITY;
  let buffer = await sharp(inputPath)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  // If still over target, progressively lower quality
  while (buffer.length / 1024 > TARGET_KB && quality > 40) {
    quality -= 5;
    buffer = await sharp(inputPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  }

  await sharp(buffer).toFile(outputPath);
  const finalKB = (buffer.length / 1024).toFixed(0);

  console.log(`${file}: ${originalKB}KB → ${finalKB}KB (q${quality})`);
}

console.log('\nDone! Optimized images in:', OUTPUT_DIR);
