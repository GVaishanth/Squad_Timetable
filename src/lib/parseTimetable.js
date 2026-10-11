// Parses timetable text (OCR output or pasted VTOP text) into structured rows,
// then builds the app's `registered` timetable shape.
//
// VIT FFCS semantics:
// - A theory code (e.g. A1) meets on EVERY day that carries it (A1 = Mon 8AM + Wed 9AM),
//   so importing "A1" registers it on all of those days.
// - Lab codes (L1–L60) belong to exactly one day/column.
// - A bare base code ("A", "TA") gets its 1/2 suffix from the batch answer:
//   morning -> 1, evening -> 2.
import { DAYS, THEORY_SLOT, LAB_SLOT } from './ffcs.js';

// ─── Reverse lookups ──────────────────────────────────────────────────────────
export const THEORY_CODE_DAYS = {};
for (const d of DAYS) {
  for (const code of THEORY_SLOT[d]) {
    if (!code) continue;
    if (!THEORY_CODE_DAYS[code]) THEORY_CODE_DAYS[code] = [];
    if (!THEORY_CODE_DAYS[code].includes(d)) THEORY_CODE_DAYS[code].push(d);
  }
}
export const THEORY_CODES = new Set(Object.keys(THEORY_CODE_DAYS));
export const THEORY_BASES = new Set([...THEORY_CODES].map((c) => c.replace(/[12]$/, '')));

export const LAB_CODE_DAY = {};
for (const d of DAYS) {
  for (const code of LAB_SLOT[d]) {
    if (code) LAB_CODE_DAY[code] = d;
  }
}

// ─── Patterns ─────────────────────────────────────────────────────────────────
const VENUE_PREFIXES = ['SJTG', 'CDMM', 'CBMR', 'GTEC', 'PRP', 'SJT', 'TT', 'GDN', 'SMV', 'MB', 'HEX', 'CTS'];
const VENUE_RE = new RegExp(
  `\\b((?:${VENUE_PREFIXES.join('|')})[A-Z]{0,3}\\d{1,4}[A-Z]{0,2})\\b`,
);
const COURSE_RE = /\b([A-Z]{2,7}\d{3}[A-Z]?)\b/g;
const COMPOUND_RE = /([A-Z]{1,4}\d{0,2}(?:\s*[+/,;&]\s*[A-Z]{1,4}\d{0,2})+)/g;
const FULLCODE_RE = /\b(L\d{1,2}|[A-Z]{1,4}[12])\b/g;
const WORD_RE = /\b([A-Z]{1,4})\b/g;

let uidCounter = 0;
export const uid = () => `row-${Date.now().toString(36)}-${uidCounter++}`;

export function emptyRegistered() {
  const reg = {};
  for (const d of DAYS) reg[d] = { theory: {}, lab: {} };
  return reg;
}

// ─── Slot classification ──────────────────────────────────────────────────────
// Returns { kind: 'lab'|'theory'|'base'|'unknown', code?, base? } or null (ignore).
export function classifySlot(token) {
  const t = String(token || '').toUpperCase().trim();
  if (!t) return null;
  const lab = /^L(\d{1,2})$/.exec(t);
  if (lab) {
    const n = Number(lab[1]);
    if (n >= 1 && n <= 60) return { kind: 'lab', code: t };
    return { kind: 'unknown', code: t };
  }
  if (THEORY_CODES.has(t)) return { kind: 'theory', code: t };
  if (THEORY_BASES.has(t)) return { kind: 'base', base: t };
  if (/^[A-Z]{1,4}[12]$/.test(t)) return { kind: 'unknown', code: t };
  return null;
}

function claimedBy(spans, index) {
  return spans.some(([s, e]) => index >= s && index < e);
}

// Extract slot tokens from one upper-cased line.
function extractSlotTokens(lineUpper) {
  const spans = [];
  const found = [];
  const push = (token, index, length) => {
    const slot = classifySlot(token);
    if (slot) {
      found.push(slot);
      spans.push([index, index + length]);
    }
  };

  // 1. Compound expressions like "A1+TA1", "L3 + L4", "A1/TA1"
  COMPOUND_RE.lastIndex = 0;
  let m;
  while ((m = COMPOUND_RE.exec(lineUpper)) !== null) {
    const parts = m[1].split(/\s*[+/,;&]\s*/).filter(Boolean);
    let cursor = m.index;
    for (const part of parts) {
      const at = lineUpper.indexOf(part, cursor);
      push(part, at === -1 ? cursor : at, part.length);
      cursor = (at === -1 ? cursor : at) + part.length;
    }
  }

  // 2. Standalone full codes ("B2", "L33")
  FULLCODE_RE.lastIndex = 0;
  while ((m = FULLCODE_RE.exec(lineUpper)) !== null) {
    if (!claimedBy(spans, m.index)) push(m[1], m.index, m[0].length);
  }

  // 3. Bare base codes ("A", "TA") in whatever is left over
  const bases = [];
  WORD_RE.lastIndex = 0;
  while ((m = WORD_RE.exec(lineUpper)) !== null) {
    if (claimedBy(spans, m.index)) continue;
    const slot = classifySlot(m[1]);
    if (slot && slot.kind === 'base') {
      bases.push(slot);
      spans.push([m.index, m.index + m[0].length]);
    }
  }

  // Guard: single letters are everywhere in prose, so only trust bare bases when
  // the line also has real slots, or a course code / venue to anchor it.
  if (bases.length > 0 && found.length === 0) {
    COURSE_RE.lastIndex = 0;
    const hasCourse = COURSE_RE.test(lineUpper);
    const hasVenue = VENUE_RE.test(lineUpper);
    if (!hasCourse && !hasVenue) return found;
  }
  return [...found, ...bases];
}

function looksLikeSlotWord(word) {
  const t = word.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!t) return true;
  return (
    classifySlot(t) !== null ||
    /\d/.test(t) ||
    ['SLOT', 'VENUE', 'FACULTY', 'COURSE', 'CODE', 'TITLE', 'CLASS'].includes(t)
  );
}

// Extract "BACSE202 - Data Structures" + "PRP472" from a line.
function extractCourseAndRoom(line, lineUpper) {
  const venueMatch = VENUE_RE.exec(lineUpper);
  const room = venueMatch ? venueMatch[1] : '';

  let code = '';
  COURSE_RE.lastIndex = 0;
  let m;
  while ((m = COURSE_RE.exec(lineUpper)) !== null) {
    const candidate = m[1];
    if (VENUE_RE.test(candidate)) {
      VENUE_RE.lastIndex = 0;
      continue; // it's a room, not a course
    }
    VENUE_RE.lastIndex = 0;
    code = candidate;
    break;
  }

  let title = '';
  if (code) {
    const idx = lineUpper.indexOf(code);
    const after = line.slice(idx + code.length).split(/\s+/).filter(Boolean);
    const words = [];
    for (const w of after) {
      if (words.length >= 6 || looksLikeSlotWord(w)) break;
      words.push(w);
    }
    title = words.join(' ').replace(/[,;|]+$/g, '').trim();
  }

  return { course: code ? (title ? `${code} - ${title}` : code) : '', room };
}

// ─── Main entry: text -> review rows ──────────────────────────────────────────
// Row: { id, slots: [slot...], course, room, source }
export function parseTimetableText(rawText) {
  const warnings = [];
  const items = [];
  const seenExact = new Set();

  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  for (const line of lines) {
    const upper = line.toUpperCase();
    const slots = extractSlotTokens(upper);
    if (slots.length === 0) continue;

    const { course, room } = extractCourseAndRoom(line, upper);
    const key = `${slots.map((s) => s.code || s.base).join('+')}|${course}|${room}`;
    if (seenExact.has(key)) continue; // exact duplicate line
    seenExact.add(key);

    items.push({ id: uid(), slots, course, room, source: line });
    if (!course && !room) {
      warnings.push(`Line "${line.slice(0, 60)}" has slots but no readable course or room.`);
    }
  }

  // Duplicate full-slot usage across different rows (likely an OCR misread)
  const slotUse = new Map();
  for (const item of items) {
    for (const s of item.slots) {
      if (s.kind !== 'theory' && s.kind !== 'lab') continue;
      const list = slotUse.get(s.code) || [];
      list.push(item.id);
      slotUse.set(s.code, list);
    }
  }
  for (const [code, ids] of slotUse) {
    if (ids.length > 1) warnings.push(`Slot ${code} appears in ${ids.length} rows — check for an OCR misread.`);
  }

  return { items, warnings };
}

// ─── Batch resolution + registered builder ────────────────────────────────────
export function resolveSlot(slot, batch) {
  if (slot.kind !== 'base') return slot;
  const suffix = batch === 'evening' ? '2' : '1';
  const want = slot.base + suffix;
  if (THEORY_CODES.has(want)) return { ...slot, code: want };
  // Some bases only exist in one series (TBB/TDD are evening-only) — use what exists.
  const alt = slot.base + (suffix === '1' ? '2' : '1');
  if (THEORY_CODES.has(alt)) return { ...slot, code: alt, swapped: true };
  return { ...slot, code: want };
}

export function slotsToText(slots, batch) {
  return slots.map((s) => resolveSlot(s, batch).code || s.base || '?').join(' + ');
}

export function parseSlotText(text) {
  return String(text || '')
    .toUpperCase()
    .split(/\s*[+,/;&]\s*|\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => classifySlot(t) || { kind: 'unknown', code: t });
}

export function buildRegistered(items, batch) {
  const registered = emptyRegistered();
  const warnings = [];
  const counts = { theory: 0, lab: 0 };
  const seen = new Set();
  const warned = new Set();
  const warn = (msg) => {
    if (!warned.has(msg)) {
      warned.add(msg);
      warnings.push(msg);
    }
  };

  for (const item of items) {
    const name = (item.course || '').trim();
    const room = (item.room || '').trim().toUpperCase();
    for (const s of item.slots) {
      if (s.kind === 'unknown' || (!s.code && !s.base)) {
        warn(`Couldn't understand slot "${s.code || s.base || '?'}" — skipped.`);
        continue;
      }
      const r = resolveSlot(s, batch);
      const code = r.code;
      if (!code) continue;
      if (r.kind === 'lab') {
        const day = LAB_CODE_DAY[code];
        if (!day) {
          warn(`Lab slot ${code} isn't a real FFCS slot — skipped.`);
          continue;
        }
        registered[day].lab[code] = { n: name || `Slot ${code}`, r: room };
        if (!seen.has(`L${code}`)) {
          seen.add(`L${code}`);
          counts.lab += 1;
        }
      } else {
        const days = THEORY_CODE_DAYS[code];
        if (!days) {
          warn(`Theory slot ${code} isn't a real FFCS slot — skipped.`);
          continue;
        }
        if (r.swapped) warn(`${s.base} only runs in the ${code.endsWith('2') ? 'evening' : 'morning'} — used ${code}.`);
        for (const d of days) registered[d].theory[code] = { n: name || `Slot ${code}`, r: room };
        if (!seen.has(`T${code}`)) {
          seen.add(`T${code}`);
          counts.theory += 1;
        }
      }
    }
  }
  return { registered, warnings, counts };
}
