// Visual-effects level: 'full' (animated Bifröst background + circling beams)
// or 'lite' (same look, frozen in place — near-zero CPU/GPU cost).
//
// Choice order: the user's saved choice → otherwise auto: start 'lite' on
// low-power hints (reduced motion, Data Saver, ≤4 CPU cores, ≤4 GB RAM) and
// also drop to 'lite' if the page measures a low frame rate after loading.
import { useEffect, useState } from 'react';

const KEY = 'squad-fx';
const EVENT = 'squad-fx-change';

function saved() {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'full' || v === 'lite' ? v : null;
  } catch {
    return null;
  }
}

function lowPowerHint() {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  return Boolean(
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
      nav.connection?.saveData ||
      (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) ||
      (nav.deviceMemory && nav.deviceMemory <= 4),
  );
}

let current = saved() || (lowPowerHint() ? 'lite' : 'full');

export function getFx() {
  return current;
}

function apply(mode) {
  current = mode;
  document.documentElement.dataset.fx = mode;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: mode }));
}

/** Set by the user from the menu — remembered on this device. */
export function setFx(mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    /* private mode etc. */
  }
  apply(mode);
}

export function onFxChange(fn) {
  const h = (e) => fn(e.detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

export function useFx() {
  const [mode, setMode] = useState(current);
  useEffect(() => onFxChange(setMode), []);
  return mode;
}

/** Call once at startup: applies the mode and, if nothing was chosen yet,
 *  watches the real frame rate for a moment and switches to lite if it lags. */
export function initFx() {
  document.documentElement.dataset.fx = current;
  if (saved() || current === 'lite') return;
  const probe = () => {
    if (document.hidden) return setTimeout(probe, 2000);
    let frames = 0;
    const t0 = performance.now();
    const tick = (t) => {
      frames++;
      if (t - t0 < 2000) return requestAnimationFrame(tick);
      const fps = (frames * 1000) / (t - t0);
      if (fps < 40 && !document.hidden && !saved()) apply('lite');
    };
    requestAnimationFrame(tick);
    return undefined;
  };
  setTimeout(probe, 2500); // let fonts/first paint settle
}
