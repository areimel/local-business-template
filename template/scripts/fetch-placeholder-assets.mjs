#!/usr/bin/env node
/**
 * Fetches/generates de-branded placeholder assets for the template.
 * Zero deps — uses global fetch (Node 18+) and hand-rolled SVG/ICO bytes.
 *
 * Run: node scripts/fetch-placeholder-assets.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BG = 'e5e5e5';
const FG = '737373';

// Magic bytes to sanity-check a downloaded file is a real image, not an HTML error page.
const MAGIC = {
  jpg: (buf) => buf.length > 100 && buf[0] === 0xff && buf[1] === 0xd8,
  png: (buf) => buf.length > 100 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47,
};

async function fetchWithRetry(url, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}

async function fetchPlaceholder(destAbs, w, h, ext, label) {
  const url = `https://placehold.co/${w}x${h}/${BG}/${FG}.${ext}?text=${encodeURIComponent(label)}`;
  const buf = await fetchWithRetry(url);
  if (!MAGIC[ext](buf)) {
    throw new Error(`bad magic bytes / size for ${destAbs} (got ${buf.length} bytes) — likely an HTML error page`);
  }
  await mkdir(path.dirname(destAbs), { recursive: true });
  await writeFile(destAbs, buf);
  return buf;
}

function svgPlaceholder(w, h, text) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" rx="8" fill="#${BG}"/>
  <text x="50%" y="50%" font-family="sans-serif" font-size="${Math.round(h * 0.22)}" fill="#${FG}" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>
`;
}

// PNG-in-ICO: 6-byte ICONDIR + 16-byte ICONDIRENTRY + raw PNG payload. Valid since Vista.
function buildIco(pngBuf, size) {
  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(0, 0); // reserved
  dir.writeUInt16LE(1, 2); // type: icon
  dir.writeUInt16LE(1, 4); // 1 image
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // color palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuf.length, 8); // image data size
  entry.writeUInt32LE(6 + 16, 12); // offset to image data
  return Buffer.concat([dir, entry, pngBuf]);
}

const rasterManifest = [
  // [dir, ext, w, h, labelPrefix/labels[], filenames[]]
  ...['team-van', 'tech-at-van', 'tech-leaning-unit', 'van-in-neighborhood', 'two-vans', 'installer-electric-panel', 'tech-infront-unit', 'tech-outdoor'].map((name, i) => ({
    dest: `src/assets/images/hero/${name}.jpg`, w: 1920, h: 1280, ext: 'jpg', label: `Hero Photo ${i + 1}`,
  })),
  ...['tech-indoor', 'tech-crossed-arms', 'installer-smiling', 'staff-fistbump', 'staff-building'].map((name, i) => ({
    dest: `src/assets/images/team/${name}.jpg`, w: 800, h: 1000, ext: 'jpg', label: `Team Photo ${i + 1}`,
  })),
  ...[1, 2, 3, 4, 5].map((n) => ({
    dest: `src/assets/images/logos/partner-logo-${n}.png`, w: 240, h: 80, ext: 'png', label: `Partner Logo ${n}`,
  })),
  { dest: 'src/assets/images/logos/reviews-badge.png', w: 300, h: 100, ext: 'png', label: 'Reviews Badge' },
  { dest: 'public/favicon.png', w: 32, h: 32, ext: 'png', label: 'L' },
  { dest: 'public/favicon-192.png', w: 192, h: 192, ext: 'png', label: 'Logo' },
  { dest: 'public/images/og-default.jpg', w: 1200, h: 630, ext: 'jpg', label: 'Your Company Name' },
];

const svgManifest = [
  { dest: 'src/assets/logos/logo-full.svg', w: 400, h: 100, text: 'Company Logo' },
  { dest: 'src/assets/logos/logo-icon.svg', w: 128, h: 128, text: 'Logo' },
  { dest: 'src/assets/logos/logo-text.svg', w: 300, h: 60, text: 'Company Name' },
];

async function main() {
  const results = [];

  for (const item of svgManifest) {
    const destAbs = path.join(ROOT, item.dest);
    await mkdir(path.dirname(destAbs), { recursive: true });
    await writeFile(destAbs, svgPlaceholder(item.w, item.h, item.text));
    results.push({ dest: item.dest, ok: true });
  }

  let faviconPngBuf;
  for (const item of rasterManifest) {
    const destAbs = path.join(ROOT, item.dest);
    try {
      const buf = await fetchPlaceholder(destAbs, item.w, item.h, item.ext, item.label);
      if (item.dest === 'public/favicon.png') faviconPngBuf = buf;
      results.push({ dest: item.dest, ok: true });
    } catch (err) {
      results.push({ dest: item.dest, ok: false, error: err.message });
    }
  }

  if (faviconPngBuf) {
    await writeFile(path.join(ROOT, 'public/favicon.ico'), buildIco(faviconPngBuf, 32));
    results.push({ dest: 'public/favicon.ico', ok: true });
  } else {
    results.push({ dest: 'public/favicon.ico', ok: false, error: 'skipped — favicon.png fetch failed' });
  }

  const failed = results.filter((r) => !r.ok);
  for (const r of results) console.log(`${r.ok ? 'OK  ' : 'FAIL'} ${r.dest}${r.error ? ` — ${r.error}` : ''}`);
  if (failed.length) {
    console.error(`\n${failed.length} asset(s) failed.`);
    process.exit(1);
  }
}

main();
