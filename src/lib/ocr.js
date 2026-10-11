// Client-side OCR wrapper (tesseract.js).
// The engine + English language data are self-hosted under /ocr/ (see
// scripts/setup-ocr-assets.mjs), so imports work fully offline. If local
// assets are missing, we fall back to the default CDN paths.
import { createWorker } from 'tesseract.js';

const OCR_BASE = `${import.meta.env.BASE_URL}ocr`;

let workerPromise = null;

function localOptions(coreFile) {
  return {
    workerPath: `${OCR_BASE}/worker.min.js`,
    corePath: `${OCR_BASE}/core/${coreFile}`,
    langPath: `${OCR_BASE}/lang`,
    gzip: true,
  };
}

async function createWithFallback(onProgress) {
  const logger = (m) => {
    try {
      onProgress?.(m);
    } catch {
      /* ignore listener errors */
    }
  };
  const attempts = [
    localOptions('tesseract-core-simd-lstm.wasm.js'), // fast path, modern browsers
    localOptions('tesseract-core-lstm.wasm.js'), // plain wasm fallback
    {}, // CDN defaults (needs internet)
  ];
  let lastError = null;
  for (const options of attempts) {
    try {
      return await createWorker('eng', undefined, { ...options, logger });
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Could not start the text reader.');
}

export function getOcrWorker(onProgress) {
  if (!workerPromise) {
    workerPromise = createWithFallback(onProgress).catch((e) => {
      workerPromise = null; // allow retry on next import
      throw e;
    });
  }
  return workerPromise;
}

// Downscale huge phone photos so OCR stays fast. Returns a canvas.
export function prepareImage(file, maxDim = 2400) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image. Try a PNG or JPG screenshot.'));
    };
    img.src = url;
  });
}

// Full pipeline: file -> OCR text.
export async function recognizeFile(file, onProgress) {
  const canvas = await prepareImage(file);
  const worker = await getOcrWorker(onProgress);
  const {
    data: { text },
  } = await worker.recognize(canvas);
  return text || '';
}
