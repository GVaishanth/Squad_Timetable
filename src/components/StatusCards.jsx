import { MjolnirIcon } from './Icons';
import BifrostRunner from './BifrostRunner';
import { useState } from 'react';
import { DAYS, DAY_START, DAY_END, LUNCH_START, LUNCH_END, courseCode } from '../lib/ffcs';

const BADGE_STYLES = {
  'badge-in': 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/30',
  'badge-out': 'bg-red-500/15 text-red-300 ring-red-400/30',
  'badge-lunch': 'bg-amber-500/15 text-amber-300 ring-amber-400/30',
  'badge-free': 'bg-sky-500/15 text-sky-300 ring-sky-400/30',
  'badge-weekend': 'bg-violet-500/15 text-violet-300 ring-violet-400/30',
};

export function StatusPill({ badge, label, className = '' }) {
  return (
    <span
      className={`inline-flex max-w-full items-center justify-center rounded-full px-3 py-1 text-xs font-bold ring-1 ${BADGE_STYLES[badge] || BADGE_STYLES['badge-free']} ${className}`}
    >
      {label}
    </span>
  );
}

// ─── SQUAD PULSE: who's free right now? ───────────────────────────────────────
export function SquadPulse({ statuses, day, mins }) {
  const isWeekday = DAYS.includes(day);
  let headline = '';
  let sub = '';

  if (!isWeekday) {
    headline = '🏖️ Weekend — no classes';
    sub = 'The squad is off. Touch grass.';
  } else if (mins < DAY_START) {
    headline = '😴 Quiet hours — classes start 8:00 AM';
    sub = 'Everyone is free until the day begins.';
  } else if (mins >= DAY_END) {
    headline = '🌙 Done for the day';
    sub = 'All classes are over. See you tomorrow.';
  } else if (mins >= LUNCH_START && mins < LUNCH_END) {
    headline = '🍽️ Lunch break';
    sub = 'Back to class at 2:00 PM.';
  }

  const free = statuses.filter((s) => !s.status.course && s.status.badge !== 'badge-weekend');
  const busy = statuses.filter((s) => s.status.course);

  return (
    <section className="mx-auto mb-5 max-w-3xl bifrost-box rounded-2xl p-4 sm:p-5">
      <BifrostRunner />
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>
          <div>
            <p className="text-[0.65rem] font-extrabold tracking-[0.2em] text-amber-400">SQUAD PULSE</p>
            <p className="font-display text-sm font-bold tracking-wide text-ivory-100">
              {headline || (
                <>
                  <span className="text-emerald-300">{free.length} free</span>
                  <span className="text-ivory-500"> · </span>
                  <span className="text-red-300">{busy.length} in class</span>
                </>
              )}
            </p>
            {headline && sub && <p className="text-xs text-ivory-400">{sub}</p>}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-400/10 pt-3">
          {!headline && (
            <>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="mr-1 text-[0.7rem] font-bold uppercase tracking-wide text-emerald-300/80">Free</span>
                {free.length === 0 && <span className="text-xs text-ivory-500">—</span>}
                {free.map(({ person }) => (
                  <span
                    key={person.id}
                    title={`${person.name} is free`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-lg ring-1 ring-emerald-400/30"
                  >
                    {person.emoji}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="mr-1 text-[0.7rem] font-bold uppercase tracking-wide text-red-300/80">Busy</span>
                {busy.length === 0 && <span className="text-xs text-ivory-500">—</span>}
                {busy.map(({ person, status }) => (
                  <span
                    key={person.id}
                    title={`${person.name} — in ${status.course.room} till ${status.nextVal}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-lg ring-1 ring-red-400/30"
                  >
                    {person.emoji}
                  </span>
                ))}
              </div>
            </>
          )}
          {headline && (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {statuses.map(({ person }) => (
                <span
                  key={person.id}
                  title={person.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-500/10 text-lg ring-1 ring-slate-400/25"
                >
                  {person.emoji}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── PROFILE CARD ─────────────────────────────────────────────────────────────
// Stable per-member offset (0–5 s) so the border beams don't all circle in sync.
function runnerOffset(key) {
  let h = 0;
  for (const ch of String(key)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ((h % 50) / 10).toFixed(1);
}

function NextClassBubble({ nextClass }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-400/20 bg-slate-950/60 p-2 text-left">
      <span className="shrink-0 text-sm">⏭️</span>
      <div className="min-w-0 flex-1">
        <div className="text-[0.6rem] uppercase tracking-wide text-ivory-500">Next class</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-ivory-100">{nextClass.time}</span>
          <span className="rounded-md border border-sky-300/30 bg-sky-400/10 px-1.5 py-px text-[0.7rem] font-bold tracking-wide text-sky-300">
            {nextClass.room}
          </span>
        </div>
        <div className="mt-0.5 truncate font-mono text-[0.65rem] text-ivory-400">{courseCode(nextClass.name)}</div>
      </div>
    </div>
  );
}

export function ProfileCard({ person, status, editMode, onEdit }) {
  const [showingNickname, setShowingNickname] = useState(false);
  const visibleName = showingNickname ? person.nickname || person.name : person.name;

  const toggleName = () => {
    if (!person.nickname) return;
    setShowingNickname((v) => !v);
  };

  return (
    <article
      className="bifrost-box hoverable min-w-0 rounded-2xl p-4 pb-3 text-center hover:-translate-y-1"
      style={{ '--acc': person.accent, '--d': `-${runnerOffset(person.id || person.name)}s` }}
    >
      <BifrostRunner />
      {editMode && (
        <button
          type="button"
          onClick={onEdit}
          title={`Edit ${person.name}`}
          className="group absolute right-2 top-2 z-[2] rounded-lg border border-amber-300/25 bg-slate-800/80 p-1.5 shadow transition hover:border-amber-300/60 hover:bg-slate-700/80"
        >
          <MjolnirIcon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
        </button>
      )}

      <div
        className="mx-auto mb-1.5 flex h-14 w-14 items-center justify-center rounded-full text-3xl shadow-inner"
        style={{ background: `${person.accent}22`, boxShadow: `0 0 0 2px ${person.accent}, 0 0 18px -2px ${person.accent}` }}
      >
        {person.emoji}
      </div>

      <div
        role="button"
        tabIndex={person.nickname ? 0 : -1}
        onDoubleClick={toggleName}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && person.nickname) {
            e.preventDefault();
            toggleName();
          }
        }}
        title={person.nickname ? 'Double-click to see nickname' : undefined}
        aria-label={`${visibleName}${person.nickname ? '. Double-click to see nickname.' : ''}`}
        className={`mb-2 truncate font-display text-base font-bold tracking-wide text-ivory-50 ${person.nickname ? 'cursor-pointer select-none' : ''}`}
      >
        {visibleName}
        {showingNickname && <span className="ml-1 text-[0.65rem] font-normal text-ivory-400">(aka)</span>}
      </div>

      {status.course ? (
        // ── IN CLASS ──
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-gradient-to-br from-red-950/80 to-red-950/30 p-2 text-left">
            <span className="shrink-0 text-sm">📚</span>
            <div className="min-w-0 flex-1">
              <div className="text-[0.62rem] font-bold uppercase tracking-wide text-red-300">In Class</div>
              <div className="mt-0.5">
                <span className="inline-block rounded-md border border-red-400/40 bg-red-400/15 px-1.5 py-px text-xs font-bold tracking-widest text-ivory-100">
                  {status.course.room}
                </span>
              </div>
              <div className="mt-0.5 truncate font-mono text-[0.65rem] text-red-200/70">
                {courseCode(status.course.name)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-950/40 p-2 text-left">
            <span className="shrink-0 text-sm">🕐</span>
            <div>
              <div className="text-[0.6rem] uppercase tracking-wide text-emerald-400/70">Free at</div>
              <div className="text-xs font-bold text-emerald-300">{status.nextVal || '—'}</div>
            </div>
          </div>
        </div>
      ) : status.badge === 'badge-lunch' ? (
        // ── LUNCH ──
        <div className="space-y-1.5">
          <StatusPill badge={status.badge} label={status.label} />
          {status.nextClass ? (
            <NextClassBubble nextClass={status.nextClass} />
          ) : (
            <div className="text-xs text-ivory-400">
              <strong className="text-ivory-100">Back at 2:00 PM</strong>
            </div>
          )}
        </div>
      ) : status.badge === 'badge-in' || status.badge === 'badge-free' ? (
        // ── IN ROOM / FREE ──
        <div className="space-y-1.5">
          <StatusPill badge={status.badge} label={status.label} />
          {status.nextClass ? (
            <NextClassBubble nextClass={status.nextClass} />
          ) : (
            <div className="text-xs text-ivory-400">
              <strong className="text-ivory-100">{status.nextVal || 'No more today'}</strong>
            </div>
          )}
        </div>
      ) : (
        // ── WEEKEND / DONE ──
        <div className="space-y-1.5">
          <StatusPill badge={status.badge} label={status.label} />
          {status.nextVal && (
            <div className="text-xs text-ivory-400">
              <strong className="text-ivory-100">{status.nextVal}</strong>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
