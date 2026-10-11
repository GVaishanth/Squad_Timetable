// Bifröst background: a column of light streaks falling from the sky that
// bends at a horizon and fans out across the floor towards the viewer, with
// pulses of light racing along the streaks. Rendered on a fixed canvas behind
// the whole app.
// Performance: the streaks are painted ONCE (per resize) onto a static canvas.
// Only the light pulses animate, on a second transparent canvas at 1× pixel
// ratio, capped at 30 fps, paused when the tab is hidden or in Lite mode.
import { useEffect, useRef } from 'react';
import { getFx, onFxChange } from '../fx';

// Palette sampled from the reference: mostly blues, some cyan/ice, warm amber
// threads, and the odd near-white core.
const COLORS = [
  [59, 130, 246], // blue-500
  [96, 165, 250], // blue-400
  [37, 99, 235], // blue-600
  [125, 211, 252], // sky-300
  [165, 216, 255], // ice
  [251, 191, 36], // amber-400
  [245, 158, 11], // amber-500
  [253, 186, 116], // orange-300
  [226, 232, 240], // near-white
  [129, 140, 248], // indigo-400
];
const COLOR_WEIGHTS = [5, 5, 3, 3, 2, 2.2, 1.6, 1.2, 1.3, 1.2];

function pickColor(rand) {
  const total = COLOR_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < COLORS.length; i++) {
    r -= COLOR_WEIGHTS[i];
    if (r <= 0) return COLORS[i];
  }
  return COLORS[0];
}

// Small deterministic PRNG so the pattern doesn't reshuffle on every resize.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// Build streak geometry for a W×H viewport.
function buildStreaks(W, H) {
  const rand = mulberry32(1337);
  const cx = W / 2;
  const horizon = H * 0.64;
  const halfBand = Math.max(W * 0.24, Math.min(W * 0.45, 220));
  const count = Math.round(Math.min(320, Math.max(130, W / 4.5)));
  const streaks = [];
  for (let i = 0; i < count; i++) {
    // Denser towards the middle of the column.
    const u = (rand() + rand() + rand()) / 3 - 0.5; // ~triangular in [-0.5,0.5]
    const x0 = cx + u * 2 * halfBand;
    const off = (x0 - cx) / halfBand; // -1..1
    // Where it lands on the bottom edge: fanned out well past the screen edges.
    const xb = cx + off * W * (0.75 + rand() * 0.35) + (rand() - 0.5) * 30;
    const radius = 40 + rand() * 70; // softness of the bend
    const bendY = horizon + (rand() - 0.5) * H * 0.025;
    const color = pickColor(rand);
    const edge = 1 - Math.abs(off) ** 2.2; // fade at band edges
    const alpha = (0.18 + rand() * 0.6) * (0.35 + 0.65 * edge);
    const width = 0.5 + rand() * rand() * 1.6;

    // Sample the path as a polyline: vertical → quadratic bend → straight floor line.
    const dx = xb - x0;
    const dy = H - bendY;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const r = Math.min(radius, len * 0.5);
    const yK = bendY - r;
    const px = x0 + ux * r;
    const py = bendY + uy * r;
    const pts = [];
    const vSteps = 24;
    for (let s = 0; s <= vSteps; s++) pts.push([x0, (yK * s) / vSteps]);
    const qSteps = 10;
    for (let s = 1; s <= qSteps; s++) {
      const t = s / qSteps;
      const a = (1 - t) * (1 - t);
      const b = 2 * (1 - t) * t;
      const c = t * t;
      pts.push([a * x0 + b * x0 + c * px, a * yK + b * bendY + c * py]);
    }
    const fSteps = 14;
    for (let s = 1; s <= fSteps; s++) {
      const t = s / fSteps;
      pts.push([px + (xb - px) * t, py + (H + 4 - py) * t]);
    }
    const cum = [0];
    for (let k = 1; k < pts.length; k++) {
      cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    }

    // Dashes along the vertical part (the reference has broken, uneven threads).
    const dashes = [];
    let y = -rand() * 120;
    while (y < yK) {
      const segLen = 30 + rand() * 220;
      dashes.push([Math.max(0, y), Math.min(yK, y + segLen), 0.25 + rand() * 0.9]);
      y += segLen + rand() * 26;
    }

    streaks.push({ x0, xb, yK, bendY, px, py, color, alpha, width, pts, cum, total: cum[cum.length - 1], dashes });
  }
  return { streaks, horizon, cx, halfBand };
}

function drawStatic(ctx, W, H, geo) {
  const { streaks, horizon, cx, halfBand } = geo;
  ctx.fillStyle = '#020308';
  ctx.fillRect(0, 0, W, H);

  // Soft haze behind the column and a glow where it meets the floor.
  let g = ctx.createRadialGradient(cx, horizon, 0, cx, horizon, Math.max(W, H) * 0.7);
  g.addColorStop(0, 'rgba(56, 120, 255, 0.20)');
  g.addColorStop(0.35, 'rgba(40, 70, 160, 0.08)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  g = ctx.createLinearGradient(cx - halfBand * 1.3, 0, cx + halfBand * 1.3, 0);
  g.addColorStop(0, 'rgba(30, 60, 140, 0)');
  g.addColorStop(0.5, 'rgba(30, 60, 140, 0.10)');
  g.addColorStop(1, 'rgba(30, 60, 140, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - halfBand * 1.3, 0, halfBand * 2.6, horizon);

  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  for (const s of streaks) {
    ctx.lineWidth = s.width;
    // Vertical dashes, fading in from the top of the sky.
    for (const [a, b, k] of s.dashes) {
      const lg = ctx.createLinearGradient(0, a, 0, b);
      const fa = Math.min(1, (a / horizon) * 1.6 + 0.08);
      const fb = Math.min(1, (b / horizon) * 1.6 + 0.08);
      lg.addColorStop(0, rgba(s.color, s.alpha * k * fa * 0.55));
      lg.addColorStop(1, rgba(s.color, s.alpha * k * fb));
      ctx.strokeStyle = lg;
      ctx.beginPath();
      ctx.moveTo(s.x0, a);
      ctx.lineTo(s.x0, b);
      ctx.stroke();
    }
    // Bend + floor: continuous and brightest near the viewer.
    const fg = ctx.createLinearGradient(0, s.yK, 0, H);
    fg.addColorStop(0, rgba(s.color, s.alpha * 0.9));
    fg.addColorStop(0.5, rgba(s.color, s.alpha * 0.75));
    fg.addColorStop(1, rgba(s.color, s.alpha * 1.1));
    ctx.strokeStyle = fg;
    ctx.beginPath();
    ctx.moveTo(s.x0, s.yK);
    ctx.quadraticCurveTo(s.x0, s.bendY, s.px, s.py);
    ctx.lineTo(s.xb, H + 4);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = 'source-over';

  // Vignette: keep the outer edges deep black so content stays readable.
  g = ctx.createRadialGradient(cx, H * 0.55, Math.min(W, H) * 0.3, cx, H * 0.55, Math.max(W, H) * 0.85);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Point at arc-length d along a streak polyline.
function pointAt(s, d) {
  const { pts, cum } = s;
  if (d <= 0) return pts[0];
  if (d >= s.total) return pts[pts.length - 1];
  let lo = 0;
  let hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < d) lo = mid;
    else hi = mid;
  }
  const t = (d - cum[lo]) / (cum[hi] - cum[lo] || 1);
  return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * t, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * t];
}

function newPulse(geo, rand, scatter) {
  const s = geo.streaks[Math.floor(rand() * geo.streaks.length)];
  const speed = 140 + rand() * 360; // px / s
  return {
    s,
    d: scatter ? rand() * s.total : -rand() * 400,
    speed,
    len: 50 + rand() * 160,
    tip: rgba(
      s.color.map((v) => (255 + v) / 2),
      0.45 + rand() * 0.55,
    ),
  };
}

export default function BifrostBackground() {
  const staticRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    const base = staticRef.current;
    const canvas = pulseRef.current;
    if (!base || !canvas) return undefined;
    const bctx = base.getContext('2d');
    const ctx = canvas.getContext('2d');
    const rand = Math.random;
    const FRAME_MS = 1000 / 30;

    let W = 0;
    let H = 0;
    let geo = null;
    let pulses = [];
    let raf = 0;
    let last = 0;
    let lastDraw = 0;
    let resizeTimer = 0;
    const animated = () => getFx() !== 'lite' && !document.hidden;

    const setup = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      // Static streak layer: crisp (up to 2×), drawn once.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      base.width = Math.round(W * dpr);
      base.height = Math.round(H * dpr);
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      geo = buildStreaks(W, H);
      drawStatic(bctx, W, H, geo);
      // Pulse layer: soft glows don't need retina resolution.
      canvas.width = W;
      canvas.height = H;
      ctx.lineCap = 'round';
      const n = Math.round(Math.min(40, Math.max(16, W / 34)));
      pulses = Array.from({ length: n }, () => newPulse(geo, rand, true));
    };

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      if (t - lastDraw < FRAME_MS - 2) return;
      lastDraw = t;
      const dt = last ? Math.min(0.08, (t - last) / 1000) : 0;
      last = t;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        p.d += p.speed * dt;
        if (p.d - p.len > p.s.total) {
          pulses[i] = newPulse(geo, rand, false);
          continue;
        }
        if (p.d <= 0) continue;
        const head = pointAt(p.s, p.d);
        const tail = pointAt(p.s, p.d - p.len);
        const mid = pointAt(p.s, p.d - p.len / 2);
        const g = ctx.createLinearGradient(tail[0], tail[1], head[0], head[1]);
        g.addColorStop(0, rgba(p.s.color, 0));
        g.addColorStop(1, p.tip);
        ctx.strokeStyle = g;
        ctx.lineWidth = p.s.width + 0.9;
        ctx.beginPath();
        ctx.moveTo(tail[0], tail[1]);
        ctx.quadraticCurveTo(mid[0], mid[1], head[0], head[1]);
        ctx.stroke();
      }
    };

    const start = () => {
      if (raf || !animated()) return;
      last = 0;
      lastDraw = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      if (animated()) start();
      else {
        stop();
        if (getFx() === 'lite') ctx.clearRect(0, 0, W, H);
      }
    };
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (Math.abs(window.innerWidth - W) < 2 && Math.abs(window.innerHeight - H) < 80) return; // ignore mobile URL-bar jiggle
        setup();
      }, 150);
    };

    setup();
    sync();
    const offFx = onFxChange(sync);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', sync);
    return () => {
      stop();
      offFx();
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0" style={{ zIndex: -1 }}>
      <canvas ref={staticRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={pulseRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
