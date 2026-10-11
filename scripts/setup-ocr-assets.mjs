// Copies/downloads Tesseract OCR assets into public/ocr/ so timetable-photo
// import works fully offline (no CDN calls at runtime).
//
// - worker.min.js + core (wasm) are copied from node_modules (pinned by package-lock)
// - eng.traineddata.gz is downloaded once from jsDelivr (pinned URL matching the
//   tesseract.js default for LSTM mode)
//
// Idempotent: existing non-empty files are skipped. Runs on `postinstall` (local
// dev) and `prebuild` (CI/production builds).
import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { get } from 'node:https';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'public', 'ocr');
const CORE_OUT = join(OUT, 'core');
const LANG_OUT = join(OUT, 'lang');

const LANG_URL = 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz';

const COPIES = [
  ['node_modules/tesseract.js/dist/worker.min.js', join(OUT, 'worker.min.js')],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js', join(CORE_OUT, 'tesseract-core-simd-lstm.wasm.js')],
  ['node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm', join(CORE_OUT, 'tesseract-core-simd-lstm.wasm')],
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm.js', join(CORE_OUT, 'tesseract-core-lstm.wasm.js')],
  ['node_modules/tesseract.js-core/tesseract-core-lstm.wasm', join(CORE_OUT, 'tesseract-core-lstm.wasm')],
];

function isGood(path) {
  try {
    return statSync(path).size > 0;
  } catch {
    return false;
  }
}

function download(url, dest, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error('Too many redirects'));
    get(url, { headers: { 'User-Agent': 'squad-timetable-setup' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        const next = new URL(res.headers.location, url).href;
        return resolve(download(next, dest, redirects + 1));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', async () => {
        try {
          const { writeFileSync } = await import('node:fs');
          writeFileSync(dest, Buffer.concat(chunks));
          resolve();
        } catch (e) {
          reject(e);
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  mkdirSync(CORE_OUT, { recursive: true });
  mkdirSync(LANG_OUT, { recursive: true });

  for (const [src, dest] of COPIES) {
    if (isGood(dest)) {
      console.log(`[ocr-assets] skip (exists): ${dest}`);
      continue;
    }
    const abs = join(root, src);
    if (!existsSync(abs)) throw new Error(`Missing ${src} — run npm install first.`);
    copyFileSync(abs, dest);
    console.log(`[ocr-assets] copied: ${src}`);
  }

  const langDest = join(LANG_OUT, 'eng.traineddata.gz');
  if (isGood(langDest)) {
    console.log('[ocr-assets] skip (exists): eng.traineddata.gz');
  } else {
    console.log('[ocr-assets] downloading eng.traineddata.gz …');
    await download(LANG_URL, langDest);
    console.log('[ocr-assets] downloaded: eng.traineddata.gz');
  }
  console.log('[ocr-assets] done.');
}

main().catch((e) => {
  console.error(`[ocr-assets] FAILED: ${e.message}`);
  console.error('[ocr-assets] OCR will fall back to CDN at runtime. Build continues.');
  process.exit(0); // never break install/build — runtime has a CDN fallback
});
