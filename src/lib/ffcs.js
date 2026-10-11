// ─── FFCS TIME MODEL ─────────────────────────────────────────────────────────
// 13 display columns (0–12), col 6 = LUNCH.
// Each column has TWO possible occupancy windows: theory time and lab time.
// A person is "in class" at time T if they have a registered slot whose
// theory-time OR lab-time window covers T.
//
// THEORY windows per column (50 min each):
//  col 0: 08:00–08:50   col 7: 14:00–14:50
//  col 1: 09:00–09:50   col 8: 15:00–15:50
//  col 2: 10:00–10:50   col 9: 16:00–16:50
//  col 3: 11:00–11:50   col10: 17:00–17:50
//  col 4: 12:00–12:50   col11: 18:00–18:50
//  col 5: (none)        col12: (none)
//
// LAB windows — pairs of cols share one 2-hr block:
//  cols 0+1 → 08:00–09:40   cols 7+8  → 14:00–15:40
//  cols 2+3 → 09:51–11:30   cols 9+10 → 15:51–17:30
//  cols 4+5 → 11:40–13:20   cols11+12 → 17:40–19:20

export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
export const COL_LUNCH = 6;
export const DAY_START = 480; // 8:00 AM
export const LUNCH_START = 780; // 1:00 PM
export const LUNCH_END = 840; // 2:00 PM
export const DAY_END = 1160; // 7:20 PM

// Theory slot start/end in minutes (null = no theory for that col)
export const TH_START = [480, 540, 600, 660, 720, null, null, 840, 900, 960, 1020, 1080, null];
export const TH_END = [530, 590, 650, 710, 770, null, null, 890, 950, 1010, 1070, 1130, null];

// Lab block start/end in minutes per column
export const LAB_START = [480, 480, 591, 591, 700, 700, null, 840, 840, 951, 951, 1060, 1060];
export const LAB_END = [580, 580, 690, 690, 800, 800, null, 940, 940, 1050, 1050, 1160, 1160];

// Theory slot codes per day per column
export const THEORY_SLOT = {
  MON: ['A1', 'F1', 'D1', 'TB1', 'TG1', null, null, 'A2', 'F2', 'D2', 'TB2', 'TG2', null],
  TUE: ['B1', 'G1', 'E1', 'TC1', 'TAA1', null, null, 'B2', 'G2', 'E2', 'TC2', 'TAA2', null],
  WED: ['C1', 'A1', 'F1', 'V1', 'V2', null, null, 'C2', 'A2', 'F2', 'TD2', 'TBB2', null],
  THU: ['D1', 'B1', 'G1', 'TE1', 'TCC1', null, null, 'D2', 'B2', 'G2', 'TE2', 'TCC2', null],
  FRI: ['E1', 'C1', 'TA1', 'TF1', 'TD1', null, null, 'E2', 'C2', 'TA2', 'TF2', 'TDD2', null],
};

// Lab slot codes per day per column
export const LAB_SLOT = {
  MON: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', null, 'L31', 'L32', 'L33', 'L34', 'L35', 'L36'],
  TUE: ['L7', 'L8', 'L9', 'L10', 'L11', 'L12', null, 'L37', 'L38', 'L39', 'L40', 'L41', 'L42'],
  WED: ['L13', 'L14', 'L15', 'L16', 'L17', 'L18', null, 'L43', 'L44', 'L45', 'L46', 'L47', 'L48'],
  THU: ['L19', 'L20', 'L21', 'L22', 'L23', 'L24', null, 'L49', 'L50', 'L51', 'L52', 'L53', 'L54'],
  FRI: ['L25', 'L26', 'L27', 'L28', 'L29', 'L30', null, 'L55', 'L56', 'L57', 'L58', 'L59', 'L60'],
};

// Lab columns come in pairs that share one 2-hr block. Editing helper: mirror a
// lab registration across its pair so both halves of the block are covered.
export const LAB_PAIR = { 0: 1, 1: 0, 2: 3, 3: 2, 4: 5, 5: 4, 7: 8, 8: 7, 9: 10, 10: 9, 11: 12, 12: 11 };

// Non-overlapping, contiguous column time boundaries for needle positioning.
// Each column owns an exclusive slice of the day's timeline so the needle
// maps cleanly to exactly one column at any given time.
export const NEEDLE_COL_START = [480, 540, 591, 660, 700, 770, 780, 840, 900, 951, 1020, 1060, 1131];
export const NEEDLE_COL_END = [540, 591, 660, 700, 770, 780, 840, 900, 951, 1020, 1060, 1131, 1160];

// Header labels for the timetable grid
export const AM_THEORY_LABELS = ['8AM–8:50AM', '9AM–9:50AM', '10AM–10:50AM', '11AM–11:50AM', '12PM–12:50PM'];
export const PM_THEORY_LABELS = ['2PM–2:50PM', '3PM–3:50PM', '4PM–4:50PM', '5PM–5:50PM', '6PM–6:50PM'];
export const AM_LAB_LABELS = ['8AM to 9:40AM', '9:51AM to 11:30AM', '11:40AM to 1:20PM'];
export const PM_LAB_LABELS = ['2PM to 3:40PM', '3:51PM to 5:30PM', '5:40PM to 7:20PM'];

// ─── TIME HELPERS ─────────────────────────────────────────────────────────────
export function nowMins(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

export function todayCode(date = new Date()) {
  return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()];
}

export function fmtTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return hh + ':' + (min === 0 ? '00' : String(min).padStart(2, '0')) + ' ' + ampm;
}

// Return only the course code (for example, BACSE202) rather than the full title.
export function courseCode(course) {
  return String(course || '').split(' - ')[0];
}

// ─── CORE: is a person in class right now at a specific column? ───────────────
// Returns true if the person has a registered slot in col c on day d
// AND the current time falls within that slot's theory OR lab window.
export function colCoversTime(col, mins, hasTheory, hasLab) {
  if (col === COL_LUNCH) return false;
  if (hasTheory && TH_START[col] !== null) {
    if (mins >= TH_START[col] && mins < TH_END[col]) return true;
  }
  if (hasLab && LAB_START[col] !== null) {
    if (mins >= LAB_START[col] && mins < LAB_END[col]) return true;
  }
  return false;
}

// Is this person in class right now?
export function isInClassNow(person, day, mins) {
  if (DAYS.indexOf(day) === -1) return false;
  const reg = person.registered[day];
  for (let c = 0; c < 13; c++) {
    if (c === COL_LUNCH) continue;
    const ts = THEORY_SLOT[day][c];
    const ls = LAB_SLOT[day][c];
    const hasTh = ts && reg.theory[ts] ? true : false;
    const hasLb = ls && reg.lab[ls] ? true : false;
    if (colCoversTime(c, mins, hasTh, hasLb)) return true;
  }
  return false;
}

// Returns { name, slot, room } of the current class, or null
export function currentCourse(person, day, mins) {
  if (DAYS.indexOf(day) === -1) return null;
  const reg = person.registered[day];
  for (let c = 0; c < 13; c++) {
    if (c === COL_LUNCH) continue;
    const ts = THEORY_SLOT[day][c];
    const ls = LAB_SLOT[day][c];
    const thVal = ts ? reg.theory[ts] : null;
    const lbVal = ls ? reg.lab[ls] : null;
    const hasTh = thVal ? true : false;
    const hasLb = lbVal ? true : false;
    if (colCoversTime(c, mins, hasTh, hasLb)) {
      // Prefer the window that actually covers right now
      if (hasTh && TH_START[c] !== null && mins >= TH_START[c] && mins < TH_END[c]) {
        return { name: thVal.n, slot: ts, room: thVal.r };
      }
      if (hasLb && LAB_START[c] !== null && mins >= LAB_START[c] && mins < LAB_END[c]) {
        return { name: lbVal.n, slot: ls, room: lbVal.r };
      }
      // fallback: return whichever is registered
      if (hasTh) return { name: thVal.n, slot: ts, room: thVal.r };
      if (hasLb) return { name: lbVal.n, slot: ls, room: lbVal.r };
    }
  }
  return null;
}

// When does the current class block end? (extends across back-to-back classes)
export function classEndsAt(person, day, mins) {
  if (DAYS.indexOf(day) === -1) return null;
  const reg = person.registered[day];
  let latestEnd = 0;
  for (let c = 0; c < 13; c++) {
    if (c === COL_LUNCH) continue;
    const ts = THEORY_SLOT[day][c];
    const ls = LAB_SLOT[day][c];
    const hasTh = ts && reg.theory[ts] ? true : false;
    const hasLb = ls && reg.lab[ls] ? true : false;
    if (colCoversTime(c, mins, hasTh, hasLb)) {
      if (hasTh && TH_END[c] !== null) latestEnd = Math.max(latestEnd, TH_END[c]);
      if (hasLb && LAB_END[c] !== null) latestEnd = Math.max(latestEnd, LAB_END[c]);
    }
  }
  let checkMins = latestEnd;
  let extended = true;
  while (extended) {
    extended = false;
    for (let c2 = 0; c2 < 13; c2++) {
      if (c2 === COL_LUNCH) continue;
      const ts2 = THEORY_SLOT[day][c2];
      const ls2 = LAB_SLOT[day][c2];
      const hasTh2 = ts2 && reg.theory[ts2] ? true : false;
      const hasLb2 = ls2 && reg.lab[ls2] ? true : false;
      if (colCoversTime(c2, checkMins, hasTh2, hasLb2)) {
        let newEnd = 0;
        if (hasTh2 && TH_END[c2]) newEnd = Math.max(newEnd, TH_END[c2]);
        if (hasLb2 && LAB_END[c2]) newEnd = Math.max(newEnd, LAB_END[c2]);
        if (newEnd > latestEnd) {
          latestEnd = newEnd;
          checkMins = latestEnd;
          extended = true;
        }
      }
    }
  }
  return latestEnd > 0 ? fmtTime(latestEnd) : null;
}

// When is the next class?
// Returns { time, room, name } or null (searches today, then rest of the week)
export function nextClassAt(person, day, mins) {
  if (DAYS.indexOf(day) === -1) return null;

  const searchDays = [];
  searchDays.push({ dayCode: day, reg: person.registered[day], prefix: '' });
  const di = DAYS.indexOf(day);
  for (let d = di + 1; d < DAYS.length; d++) {
    searchDays.push({ dayCode: DAYS[d], reg: person.registered[DAYS[d]], prefix: DAYS[d] + ' ' });
  }

  for (let sd = 0; sd < searchDays.length; sd++) {
    const dayCode = searchDays[sd].dayCode;
    const reg = searchDays[sd].reg;
    const prefix = searchDays[sd].prefix;
    const minTime = sd === 0 ? mins : -1; // only filter by mins on today

    // Collect all upcoming slots with their start time + room
    const candidates = [];
    for (let c = 0; c < 13; c++) {
      if (c === COL_LUNCH) continue;
      const ts = THEORY_SLOT[dayCode][c];
      const ls = LAB_SLOT[dayCode][c];
      const thVal = ts ? reg.theory[ts] : null;
      const lbVal = ls ? reg.lab[ls] : null;

      if (thVal && TH_START[c] !== null && TH_START[c] > minTime) {
        candidates.push({ t: TH_START[c], room: thVal.r, name: thVal.n, prefix });
      }
      if (lbVal && LAB_START[c] !== null && LAB_START[c] > minTime) {
        candidates.push({ t: LAB_START[c], room: lbVal.r, name: lbVal.n, prefix });
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.t - b.t);
      const best = candidates[0];
      return { time: best.prefix + fmtTime(best.t), room: best.room, name: best.name };
    }
  }
  return null;
}

// ─── STATUS ───────────────────────────────────────────────────────────────────
export function statusOf(person, day, mins) {
  if (DAYS.indexOf(day) === -1) {
    return {
      badge: 'badge-weekend',
      label: '🏖️ Weekend',
      nextLabel: '',
      nextVal: 'Enjoy!',
      course: null,
      nextClass: null,
    };
  }
  if (mins < DAY_START) {
    const nc0 = nextClassAt(person, day, mins);
    return {
      badge: 'badge-free',
      label: '😴 Before class',
      nextLabel: 'Classes start at',
      nextVal: '8:00 AM',
      course: null,
      nextClass: nc0,
    };
  }
  if (mins >= DAY_END) {
    return {
      badge: 'badge-in',
      label: '🏠 In Room',
      nextLabel: 'Done for today!',
      nextVal: '',
      course: null,
      nextClass: null,
    };
  }
  if (mins >= LUNCH_START && mins < LUNCH_END) {
    const nc1 = nextClassAt(person, day, mins);
    return {
      badge: 'badge-lunch',
      label: '🍽️ Lunch',
      nextLabel: 'Back at',
      nextVal: '2:00 PM',
      course: null,
      nextClass: nc1,
    };
  }
  if (isInClassNow(person, day, mins)) {
    const ends = classEndsAt(person, day, mins);
    const cc = currentCourse(person, day, mins);
    return {
      badge: 'badge-out',
      label: '📚 In Class',
      nextLabel: 'Free at',
      nextVal: ends || '—',
      course: cc,
      nextClass: null,
    };
  }
  const nxt = nextClassAt(person, day, mins);
  return {
    badge: 'badge-in',
    label: '🏠 In Room',
    nextLabel: 'Next class:',
    nextVal: nxt ? nxt.time : 'No more today',
    course: null,
    nextClass: nxt,
  };
}

// ─── HIGHLIGHT: which column is "current" for table display ───────────────────
// (used only for cell highlighting, not for status logic)
export function currentDisplayCol(mins) {
  if (mins >= LUNCH_START && mins < LUNCH_END) return COL_LUNCH;
  for (let c = 0; c < 13; c++) {
    if (c === COL_LUNCH) continue;
    const inTh = TH_START[c] !== null && mins >= TH_START[c] && mins < TH_END[c];
    const inLab = LAB_START[c] !== null && mins >= LAB_START[c] && mins < LAB_END[c];
    if (inTh || inLab) return c;
  }
  return -1;
}

// ─── NEEDLE ───────────────────────────────────────────────────────────────────
// Returns { col, fraction } — which column owns the current time and how far
// through its exclusive slice we are — or null when the needle should hide.
export function needleTarget(minsF) {
  for (let c = 0; c < 13; c++) {
    if (c === COL_LUNCH) continue;
    if (minsF >= NEEDLE_COL_START[c] && minsF < NEEDLE_COL_END[c]) {
      const span = NEEDLE_COL_END[c] - NEEDLE_COL_START[c];
      const fraction = Math.max(0, Math.min(1, (minsF - NEEDLE_COL_START[c]) / span));
      return { col: targetCol(c), fraction };
    }
  }
  return null;
}

// Identity helper kept explicit so needle math stays readable.
function targetCol(c) {
  return c;
}

export function isNeedleActive(day, minsF) {
  return (
    DAYS.indexOf(day) !== -1 &&
    minsF >= DAY_START &&
    minsF < DAY_END &&
    !(minsF >= LUNCH_START && minsF < LUNCH_END)
  );
}
