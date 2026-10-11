import { useRef, useState } from 'react';
import { MjolnirIcon, RuneIcon } from './Icons';

function pad(n) {
  return String(n).padStart(2, '0');
}

// Fixed-width digit cells so the Cinzel clock doesn't wobble as numbers change.
function ClockDigits({ text }) {
  return text.split('').map((ch, i) => (
    <span key={i} className={ch === ':' ? 'px-0.5 opacity-80' : 'inline-block w-[0.8em] text-center'}>
      {ch}
    </span>
  ));
}

export default function Header({
  now,
  editMode,
  onToggleEdit,
  custom,
  onExport,
  onImport,
  onReset,
}) {
  const fileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2600);
  };

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    setMenuOpen(false);
    if (!file) return;
    const res = await onImport(file);
    flash(res.ok ? 'Timetable imported ✓' : `Import failed: ${res.error}`);
  };

  return (
    <header className="relative mb-6 sm:mb-8">
      {/* Corner actions: Edit top-left, ⋯ top-right. In flow on small screens,
          pinned to the corners (beside the title) from md up. */}
      <div className="mb-4 flex items-center justify-between md:pointer-events-none md:absolute md:inset-x-0 md:top-0 md:z-20 md:mb-0 [&>*]:pointer-events-auto">
        <button
          type="button"
          onClick={onToggleEdit}
          className={
            editMode
              ? 'group inline-flex items-center gap-2 rounded-xl border border-amber-200/70 bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:from-amber-200 hover:to-amber-400'
              : 'group inline-flex items-center gap-2 rounded-xl border border-amber-300/25 bg-slate-800/70 px-4 py-2.5 text-sm font-bold text-ivory-100 shadow transition hover:border-amber-300/60 hover:bg-slate-700/70'
          }
          title={editMode ? 'Exit edit mode' : 'Edit timetables & members'}
        >
          <MjolnirIcon
            className={`h-[18px] w-[18px] transition-transform duration-300 group-hover:-rotate-12 ${
              editMode ? 'drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]' : 'drop-shadow-[0_0_5px_rgba(251,191,36,0.45)]'
            }`}
          />
          <span className="font-display tracking-wider">{editMode ? 'Done' : 'Edit'}</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-xl border border-amber-300/25 bg-slate-800/70 px-3 py-[11px] text-sm font-bold text-ivory-100 shadow transition hover:border-amber-300/60 hover:bg-slate-700/70"
            title="Backup / restore / reset"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="More options"
          >
            <RuneIcon name="menu" className="block h-[18px] w-[18px]" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div
                role="menu"
                className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-slate-400/20 bg-slate-900/95 shadow-2xl shadow-black/50 backdrop-blur"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onExport();
                    flash('Backup downloaded ✓');
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ivory-200 transition hover:bg-slate-700/60"
                >
                  <RuneIcon name="export" tone="gold" className="h-4 w-4" />
                  Export backup
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => fileRef.current && fileRef.current.click()}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ivory-200 transition hover:bg-slate-700/60"
                >
                  <RuneIcon name="import" tone="gold" className="h-4 w-4" />
                  Import backup
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    if (window.confirm('Reset everything to the original squad data? Your edits will be lost.')) {
                      onReset();
                      flash('Reset to original ✓');
                    }
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-300 transition hover:bg-red-500/10"
                >
                  <RuneIcon name="reset" tone="red" className="h-4 w-4" />
                  Reset to original
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 text-center">
        {/* Title */}
        <div>
          <p className="mb-2 text-[0.68rem] font-extrabold tracking-[0.25em] text-amber-400">
            SQUAD · LIVE SCHEDULE
          </p>
          <h1 className="text-gilded font-display text-4xl font-black tracking-wide sm:text-5xl">
            Squad Timetable
          </h1>
          <p className="mt-2 text-sm text-ivory-400 sm:text-[0.95rem]">
            Real-time class availability, all in one place.
            {custom && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 align-middle text-[0.68rem] font-semibold text-amber-300 ring-1 ring-amber-400/30">
                ● customized
              </span>
            )}
          </p>
        </div>

        {/* Clock (centred) */}
        <div className="bifrost-box min-w-[260px] rounded-2xl px-6 py-2.5 text-center">
          <div className="font-display text-3xl font-bold text-amber-200 [text-shadow:0_0_14px_rgba(251,191,36,0.35)]">
            <ClockDigits text={`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`} />
          </div>
          <div className="mt-0.5 text-xs text-ivory-400">
            {now.toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />

      {/* Edit-mode banner */}
      {editMode && (
        <div className="mx-auto mt-4 flex max-w-3xl items-center justify-center gap-2.5 rounded-xl border border-amber-300/30 text-center bg-amber-400/10 px-4 py-2.5 text-sm text-amber-100">
          <MjolnirIcon className="h-5 w-5" />
          <p>
            <strong>Edit mode is on</strong>
            <span className="text-amber-100/80">
              {' '}
              — click any timetable cell to edit it, use <MjolnirIcon className="mx-0.5 h-4 w-4 align-[-3px]" /> on cards to edit members. Everything saves automatically in
              this browser.
            </span>
          </p>
        </div>
      )}

      {/* Toast */}
      {notice && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-slate-400/25 bg-slate-900/95 px-5 py-2.5 text-sm font-semibold text-ivory-100 shadow-2xl backdrop-blur">
          {notice}
        </div>
      )}
    </header>
  );
}
