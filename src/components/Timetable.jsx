import { useEffect, useRef } from 'react';
import {
  AM_LAB_LABELS,
  AM_THEORY_LABELS,
  COL_LUNCH,
  DAYS,
  LAB_SLOT,
  PM_LAB_LABELS,
  PM_THEORY_LABELS,
  THEORY_SLOT,
  courseCode,
  currentDisplayCol,
  isNeedleActive,
  needleTarget,
  todayCode,
} from '../lib/ffcs';

function CellContent({ ts, ls, thVal, lbVal }) {
  if (thVal && lbVal) {
    return (
      <>
        <span className="font-bold text-sky-400">{ts}</span>
        <span className="text-ivory-500">/</span>
        <span className="font-bold text-lime-300">{ls}</span>
        <span className="mt-0.5 block font-mono text-[0.6rem] leading-snug text-ivory-400">
          {courseCode(thVal.n || lbVal.n)}
        </span>
      </>
    );
  }
  if (thVal) {
    return (
      <>
        <span className="font-bold text-sky-400">{ts}</span>
        <span className="mt-0.5 block font-mono text-[0.6rem] leading-snug text-ivory-400">
          {courseCode(thVal.n)}
        </span>
      </>
    );
  }
  if (lbVal) {
    return (
      <>
        <span className="font-bold text-lime-300">{ls}</span>
        <span className="mt-0.5 block font-mono text-[0.6rem] leading-snug text-ivory-400">
          {courseCode(lbVal.n)}
        </span>
      </>
    );
  }
  return <span className="text-ivory-600">{(ts && ls && `${ts}/${ls}`) || ts || ls || '—'}</span>;
}

export default function Timetable({ person, day, mins, now, editMode, onCellClick }) {
  const containerRef = useRef(null);
  const tableRef = useRef(null);
  const needleRef = useRef(null);
  const displayCol = currentDisplayCol(mins);

  // Time needle — repositioned every second from real DOM measurements.
  useEffect(() => {
    const needle = needleRef.current;
    const tc = containerRef.current;
    const tbl = tableRef.current;
    if (!needle || !tc || !tbl) return;

    const minsF = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    if (!isNeedleActive(todayCode(now), minsF)) {
      needle.style.display = 'none';
      return;
    }
    const target = needleTarget(minsF);
    if (!target) {
      needle.style.display = 'none';
      return;
    }
    const firstRow = tbl.querySelector('tbody tr');
    if (!firstRow) {
      needle.style.display = 'none';
      return;
    }
    const cells = firstRow.querySelectorAll('td');
    const cellIdx = target.col + 1; // cells[0] = day label
    if (cellIdx >= cells.length) {
      needle.style.display = 'none';
      return;
    }
    const cell = cells[cellIdx];
    const tcRect = tc.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    const needleX = cellRect.left - tcRect.left + target.fraction * cellRect.width;
    needle.style.display = 'block';
    needle.style.left = `${needleX}px`;
  }, [now]);

  return (
    <div className="tt-scroll overflow-x-auto p-3 sm:p-4">
      <div ref={containerRef} className="relative inline-block min-w-full">
        <table ref={tableRef} className="w-full min-w-[860px] border-collapse text-center text-[0.68rem]">
          <thead>
            <tr>
              <th
                rowSpan={3}
                className="min-w-[44px] border border-slate-400/25 bg-slate-950 px-1 py-1.5 align-middle text-[0.62rem] font-bold text-ivory-400"
              >
                Day
              </th>
              <th
                colSpan={5}
                className="border border-slate-400/25 bg-sky-950/60 px-1 py-1.5 text-[0.62rem] font-bold text-sky-300"
              >
                Theory Hours
              </th>
              <th
                rowSpan={2}
                className="border border-slate-400/25 bg-slate-950 px-1 py-1.5 align-middle text-[0.62rem] text-ivory-600"
              >
                None
              </th>
              <th
                rowSpan={3}
                className="w-7 border border-slate-400/25 bg-amber-950/70 px-1 py-1.5 align-middle text-[0.62rem] font-bold tracking-[0.2em] text-amber-300 [writing-mode:vertical-rl]"
              >
                LUNCH
              </th>
              <th
                colSpan={5}
                className="border border-slate-400/25 bg-emerald-950/50 px-1 py-1.5 text-[0.62rem] font-bold text-emerald-300"
              >
                Theory Hours
              </th>
              <th
                rowSpan={2}
                className="border border-slate-400/25 bg-slate-950 px-1 py-1.5 align-middle text-[0.62rem] text-ivory-600"
              >
                None
              </th>
            </tr>
            <tr>
              {AM_THEORY_LABELS.map((t) => (
                <th
                  key={t}
                  className="border border-slate-400/25 bg-sky-950/40 px-1 py-1 text-[0.58rem] font-normal italic text-ivory-500"
                >
                  {t}
                </th>
              ))}
              {PM_THEORY_LABELS.map((t) => (
                <th
                  key={t}
                  className="border border-slate-400/25 bg-emerald-950/30 px-1 py-1 text-[0.58rem] font-normal italic text-ivory-500"
                >
                  {t}
                </th>
              ))}
            </tr>
            <tr>
              {AM_LAB_LABELS.map((t) => (
                <th
                  key={t}
                  colSpan={2}
                  className="border border-slate-400/25 bg-sky-950/40 px-1 py-1 text-[0.58rem] font-normal italic text-ivory-500"
                >
                  {t}
                </th>
              ))}
              {PM_LAB_LABELS.map((t) => (
                <th
                  key={t}
                  colSpan={2}
                  className="border border-slate-400/25 bg-emerald-950/30 px-1 py-1 text-[0.58rem] font-normal italic text-ivory-500"
                >
                  {t}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((d) => {
              const isToday = d === day;
              const reg = person.registered[d] || { theory: {}, lab: {} };
              return (
                <tr key={d}>
                  <td
                    className={`border border-slate-400/25 px-1 py-1.5 text-[0.68rem] font-bold ${
                      isToday ? 'bg-amber-500/20 text-amber-200' : 'bg-slate-800/80 text-amber-300/80'
                    }`}
                  >
                    {d}
                  </td>
                  {Array.from({ length: 13 }, (_, c) => {
                    if (c === COL_LUNCH) {
                      return (
                        <td
                          key={c}
                          className="w-7 min-w-[26px] border border-slate-400/25 bg-amber-950/70 px-0.5 py-1.5 text-[0.7rem] font-bold tracking-[0.2em] text-amber-300 [writing-mode:vertical-rl]"
                        >
                          LUNCH
                        </td>
                      );
                    }
                    const isCur = isToday && c === displayCol;
                    const ts = THEORY_SLOT[d][c];
                    const ls = LAB_SLOT[d][c];
                    const thVal = ts ? reg.theory[ts] : null;
                    const lbVal = ls ? reg.lab[ls] : null;
                    const has = thVal || lbVal;

                    let cls =
                      'border border-slate-400/25 px-1 py-1.5 align-middle min-w-[68px] max-w-[110px] whitespace-normal transition-colors ';
                    if (isCur) {
                      cls += has
                        ? 'bg-red-950/90 shadow-[inset_0_0_0_2px_#ef4444] '
                        : 'bg-emerald-950/70 shadow-[inset_0_0_0_2px_#22c55e] ';
                    } else if (thVal && lbVal) {
                      cls += 'bg-slate-800/40 ';
                    } else if (thVal) {
                      cls += 'bg-sky-950/40 ';
                    } else if (lbVal) {
                      cls += 'bg-lime-950/30 ';
                    } else {
                      cls += 'bg-slate-950/60 ';
                    }
                    if (editMode) cls += 'cursor-pointer hover:bg-cyan-400/10 hover:shadow-[inset_0_0_0_2px_#22d3ee] ';

                    const tip = [
                      `${d} · ${[ts, ls].filter(Boolean).join(' / ')}`,
                      thVal ? `Theory: ${thVal.n} (${thVal.r || 'no room'})` : null,
                      lbVal ? `Lab: ${lbVal.n} (${lbVal.r || 'no room'})` : null,
                      editMode ? 'Click to edit' : null,
                    ]
                      .filter(Boolean)
                      .join('\n');

                    return (
                      <td
                        key={c}
                        title={tip}
                        onClick={editMode ? () => onCellClick(d, c) : undefined}
                        className={cls}
                      >
                        <CellContent ts={ts} ls={ls} thVal={thVal} lbVal={lbVal} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div ref={needleRef} className="time-needle" style={{ display: 'none' }} />
      </div>
    </div>
  );
}
