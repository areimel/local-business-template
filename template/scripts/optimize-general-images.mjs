import sharp from 'sharp';
import { readdir, rename, stat } from 'fs/promises';
import { join } from 'path';

const DIR = 'src/assets/images/general';
const MAX_DIMENSION = 1920;
const QUALITY = 80;

const files = (await readdir(DIR)).filter(f => /\.jpe?g$/i.test(f));

// Rename file with space/parens first
const badName = 'DSC00428 (1).jpg';
const goodName = 'DSC00428-2.jpg';
if (files.includes(badName)) {
  await rename(join(DIR, badName), join(DIR, goodName));
  const idx = files.indexOf(badName);
  files[idx] = goodName;
  console.log(`Renamed: ${badName} → ${goodName}`);
}

for (const file of files) {
  const filepath = join(DIR, file);
  const before = (await stat(filepath)).size;

  const buffer = await sharp(filepath)
    .rotate() // auto-orient from EXIF before stripping
    .resize(MAX_DIMENSION, MAX_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  await sharp(buffer).toFile(filepath);

  const after = (await stat(filepath)).size;
  const pct = ((1 - after / before) * 100).toFixed(1);
  console.log(`${file}: ${(before / 1e6).toFixed(1)}MB → ${(after / 1e6).toFixed(1)}MB (${pct}% smaller)`);
}

console.log('\nDone!');
