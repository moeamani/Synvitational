import { useEffect, useState } from 'react';

const ctx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;

export function measure(text, size, weight = 400, family = 'Kalameh') {
  if (!ctx) return text.length * size * 0.5;
  ctx.font = `${weight} ${size}px ${family}`;
  return ctx.measureText(text).width;
}

// Largest size (<= max) at which text fits in width.
export function fitSize(text, width, max, min = 8, weight = 400) {
  const w = measure(text, max, weight);
  return w <= width ? max : Math.max(min, Math.floor((max * width) / w));
}

const WEIGHTS = [300, 400, 500, 700, 800, 900];
let fontsPromise = null;
export function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      ...WEIGHTS.map(w => document.fonts.load(`${w} 40px Kalameh`, 'سینتکس ۱۲۳')),
      document.fonts.load('400 20px "Geist Mono"', 'SYNTEX 1405'),
    ]).catch(() => {});
  }
  return fontsPromise;
}

export function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    loadFonts().then(() => alive && setReady(true));
    return () => { alive = false; };
  }, []);
  return ready;
}
