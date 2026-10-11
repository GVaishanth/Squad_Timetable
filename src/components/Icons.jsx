// Asgard-style icons.
import { useId } from 'react';

// Mjölnir: Thor's hammer, used as the "edit / forge" icon.
// Gold head with chamfered corners, engraved knot and grooves, leather-wrapped
// handle and gold pommel; head-heavy like the real thing. Drawn on a 24×24 grid so it stays crisp at 14–20px.
export function MjolnirIcon({ className = 'h-[18px] w-[18px]', title }) {
  const id = useId().replace(/:/g, '');
  const gold = `mj-gold-${id}`;
  const goldDark = `mj-gold-d-${id}`;
  const leather = `mj-leather-${id}`;
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block shrink-0 ${className}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2c2" />
          <stop offset="0.45" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id={goldDark} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id={leather} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5b3a1e" />
          <stop offset="0.5" stopColor="#8a5a2b" />
          <stop offset="1" stopColor="#4a2f17" />
        </linearGradient>
      </defs>

      {/* Head (dark outline so it reads on gold backgrounds too) */}
      <path d="M1.2 3.4 3.1 1.5h17.8l1.9 1.9v7.2l-1.9 1.9H3.1l-1.9-1.9Z" fill={`url(#${gold})`} stroke="#451a03" strokeWidth="0.9" strokeLinejoin="round" />
      {/* End faces */}
      <path d="M1.65 3.6 3.3 1.95h1.7v10.1H3.3L1.65 10.4Z" fill={`url(#${goldDark})`} />
      <path d="M22.35 3.6 20.7 1.95H19v10.1h1.7l1.65-1.65Z" fill={`url(#${goldDark})`} />
      {/* Engraving: grooves and a central knot */}
      <path d="M6.6 4h3M14.4 4h3M6.6 10h3M14.4 10h3" stroke="#92400e" strokeWidth="0.8" strokeLinecap="round" />
      <path d="M12 3.6 14.9 7 12 10.4 9.1 7Z" fill="none" stroke="#7c2d12" strokeWidth="1.05" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="0.9" fill="#7c2d12" />
      {/* Top highlight */}
      <path d="M5.6 2.5h12.8" stroke="#fff7d6" strokeOpacity="0.75" strokeWidth="0.7" strokeLinecap="round" />

      {/* Neck collar */}
      <rect x="9.3" y="12.4" width="5.4" height="1.6" rx="0.5" fill={`url(#${goldDark})`} stroke="#451a03" strokeWidth="0.6" />
      {/* Leather-wrapped handle */}
      <rect x="10.3" y="13.9" width="3.4" height="6.6" rx="0.6" fill={`url(#${leather})`} stroke="#2b1a0b" strokeWidth="0.6" />
      <path d="M10.5 15.4 13.5 14.6M10.5 17.1 13.5 16.3M10.5 18.8 13.5 18" stroke="#2b1a0b" strokeWidth="0.65" strokeLinecap="round" />
      {/* Pommel */}
      <path d="M9.7 20.4h4.6l.6 1.25-.6 1.25H9.7l-.6-1.25Z" fill={`url(#${gold})`} stroke="#451a03" strokeWidth="0.6" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Rune icon set ───────────────────────────────────────────────────────────
// Carved-gold line icons for UI controls: angular, runic geometry with small
// diamond accents. Same 24×24 grid as Mjölnir. Pick a `tone` per context.
const TONES = {
  gold: ['#fff2c2', '#fbbf24', '#b45309'],
  red: ['#fee2e2', '#f87171', '#b91c1c'],
  ice: ['#f0f9ff', '#7dd3fc', '#2563eb'],
  ivory: ['#fffaf0', '#e6dbc0', '#a89c80'],
};

// Each entry: strokes (gradient line work) and fills (gradient solids).
const RUNES = {
  // ⋯ more / menu: three runic diamonds
  menu: { fills: ['M5 9.4 7.6 12 5 14.6 2.4 12Z', 'M12 9.4 14.6 12 12 14.6 9.4 12Z', 'M19 9.4 21.6 12 19 14.6 16.4 12Z'] },
  // ⬇ export: arrow down into a tray
  export: { strokes: ['M12 3.5v10.5', 'M7.2 9.3 12 14.1l4.8-4.8', 'M4 14.5v5.5h16v-5.5'] },
  // ⬆ import: arrow up out of a tray
  import: { strokes: ['M12 14.5V4', 'M7.2 8.7 12 3.9l4.8 4.8', 'M4 14.5v5.5h16v-5.5'] },
  // ↺ reset: angular counter-clockwise loop
  reset: { strokes: ['M16 4.5H8.5l-4 4v7l4 4h7l4-4V10.2', 'M16.8 12.6 19.5 9.6l2.7 3'] },
  // ✕ close
  close: { strokes: ['M6 6l12 12', 'M18 6 6 18'] },
  // ➕ add: cross with a diamond heart
  plus: { strokes: ['M12 3.5v6', 'M12 14.5v6', 'M3.5 12h6', 'M14.5 12h6'], fills: ['M12 9.3 14.7 12 12 14.7 9.3 12Z'] },
  // 🗑 remove
  trash: { strokes: ['M3.8 6.5h16.4', 'M9 6.5V3.8h6v2.7', 'M6.2 6.5 7.3 20.2h9.4l1.1-13.7', 'M10 10.2v6.6', 'M14 10.2v6.6'] },
  // 📷 camera
  camera: { strokes: ['M3 8.2h4.2L9.2 5h5.6l2 3.2H21V19H3Z'], fills: ['M12 10.2 15.1 13.4 12 16.6 8.9 13.4Z'] },
  // 📋 paste text: page with folded corner and lines
  scroll: { strokes: ['M6 3h8.8L18 6.2V21H6Z', 'M14.6 3v3.4H18', 'M9 11h6', 'M9 14.5h6', 'M9 18h3.8'] },
  // 🖼 image: framed mountains with a diamond sun
  image: { strokes: ['M3 4h18v16H3Z', 'M3.4 17.2l5-5.6 4 4 3-3 5.4 4.8'], fills: ['M16.4 6.3 18 7.9l-1.6 1.6-1.6-1.6Z'] },
  // ⚡ lite mode
  bolt: { strokes: ['M13.8 2.5 5.4 13.6h5.9l-1.4 7.9 8.7-11.4h-6Z'] },
  // ⚠ warning
  warning: { strokes: ['M12 3.2 21.6 20H2.4Z', 'M12 9.2v5.4'], fills: ['M12 16.3 13.2 17.5 12 18.7 10.8 17.5Z'] },
};

export function RuneIcon({ name, tone = 'gold', className = 'h-[18px] w-[18px]', strokeWidth = 2, title }) {
  const id = useId().replace(/:/g, '');
  const rune = RUNES[name];
  if (!rune) return null;
  const [a, b, c] = TONES[tone] || TONES.gold;
  const grad = `rune-${id}`;
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block shrink-0 ${className}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse" gradientTransform="scale(24)">
          <stop offset="0" stopColor={a} />
          <stop offset="0.5" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      {(rune.strokes || []).map((d, i) => (
        <path
          key={`s${i}`}
          d={d}
          fill="none"
          stroke={`url(#${grad})`}
          strokeWidth={strokeWidth}
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      ))}
      {(rune.fills || []).map((d, i) => (
        <path key={`f${i}`} d={d} fill={`url(#${grad})`} />
      ))}
    </svg>
  );
}
