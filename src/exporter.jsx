import { createRoot } from 'react-dom/client';
import { toBlob } from 'html-to-image';
import JSZip from 'jszip';
import Card from './components/Cards.jsx';
import { ExportContext } from './components/bits.jsx';
import { loadFonts } from './fit.js';

// A finished card as a PNG. The card is mounted off-screen in its open state
// at 432 css px and captured at 2.5x, so every export is 1080 × 1512 (5:7),
// with the 3D canvas itself rendered at that resolution.

export const EXPORT_W = 432;
const RATIO = 1080 / EXPORT_W;
const STILL = { get: () => 0 };

const frames = n => new Promise(resolve => {
  const step = k => (k <= 0 ? resolve() : requestAnimationFrame(() => step(k - 1)));
  step(n);
});

let queue = Promise.resolve();

export function renderCardPng({ concept, guests, index }) {
  const job = queue.then(() => draw(concept, guests, index));
  queue = job.catch(() => {});
  return job;
}

async function draw(concept, guests, index) {
  await loadFonts();
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;top:0;left:-30000px;pointer-events:none;';
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('3D scene did not start')), 15000);
      const ctx = { dpr: RATIO, onReady: () => { clearTimeout(timer); resolve(); } };
      root.render(
        <ExportContext.Provider value={ctx}>
          <Card concept={concept} guests={guests} index={index} w={EXPORT_W} shown pointer={{ x: STILL, y: STILL }} />
        </ExportContext.Provider>,
      );
    });
    await frames(12); // shaders compiled, environment baked, a settled frame drawn
    const node = host.querySelector('.card');
    const blob = await toBlob(node, { pixelRatio: RATIO, cacheBust: false });
    if (!blob) throw new Error('capture returned nothing');
    return blob;
  } finally {
    root.unmount();
    host.remove();
  }
}

export const pngName = (index, name) =>
  `syntex-invite-${String(index + 1).padStart(2, '0')}-${name.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-')}.png`;

export async function zipAll({ concept, guests }, onProgress) {
  const zip = new JSZip();
  for (let i = 0; i < guests.length; i++) {
    onProgress && onProgress(i, guests.length);
    zip.file(pngName(i, guests[i].name), await renderCardPng({ concept, guests, index: i }));
  }
  onProgress && onProgress(guests.length, guests.length);
  return zip.generateAsync({ type: 'blob' });
}

// In a claude.ai artifact files go through the downloads capability (the
// viewer confirms); anywhere else a plain download link works.
export async function saveFile(filename, blob) {
  const claude = window.claude;
  if (claude && claude.use) {
    const dl = await claude.use('downloads');
    if (dl) {
      await dl.save({ filename, data: blob });
      return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export const isDeclined = e => e && e.code === 'declined';
