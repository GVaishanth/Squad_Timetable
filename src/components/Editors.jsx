import { useEffect, useState } from 'react';
import { ErrorPopup, useErrorPopup } from './ErrorPopup';
import { RuneIcon } from './Icons';
import { LAB_PAIR, LAB_SLOT, THEORY_SLOT } from '../lib/ffcs';

export const ACCENT_PRESETS = [
  '#e91e8c',
  '#1565c0',
  '#2e7d32',
  '#e65100',
  '#9e9e9e',
  '#b71c1c',
  '#00d4ff',
  '#9b59b6',
  '#eab308',
  '#14b8a6',
];

export function useEscape(onClose) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
}

export function ModalShell({ title, subtitle, onClose, children, footer, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div
        className={`modal-pop relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bifrost-panel shadow-2xl shadow-blue-950/50 sm:rounded-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
      >
        <div className="sticky top-0 border-b border-slate-400/15 bg-slate-900/95 px-5 pb-3 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold tracking-wide text-ivory-50">{title}</h2>
              {subtitle && <p className="mt-0.5 text-xs text-ivory-400">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-amber-300/20 bg-slate-800/70 p-2 text-sm text-ivory-200 transition hover:border-amber-300/60 hover:bg-slate-700"
              aria-label="Close"
            >
              <RuneIcon name="close" className="block h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          </div>
        </div>
        <div className="space-y-4 px-5 py-4">{children}</div>
        {footer && <div className="sticky bottom-0 border-t border-slate-400/15 bg-slate-900/95 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

function SlotFields({ code, kind, value, onChange, accent, invalid }) {
  const enabled = value !== null;
  const badgeCls =
    kind === 'Theory' ? 'bg-sky-400/10 text-sky-300 ring-sky-400/30' : 'bg-lime-400/10 text-lime-300 ring-lime-400/30';
  return (
    <div className={`rounded-xl border p-3 ${invalid ? 'border-red-400/70 bg-red-500/10 ring-2 ring-red-500/30' : enabled ? 'border-slate-400/25 bg-slate-800/50' : 'border-slate-400/10 bg-slate-900/60'}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-xs font-bold ring-1 ${badgeCls}`}>{code}</span>
          <span className="text-xs font-semibold text-ivory-400">{kind} slot</span>
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ivory-300">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked ? { n: '', r: '' } : null)}
            className="h-4 w-4 accent-cyan-400"
          />
          Registered
        </label>
      </div>
      {enabled && (
        <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
          <input
            value={value.n}
            onChange={(e) => onChange({ ...value, n: e.target.value })}
            placeholder="Course name — e.g. BACSE202 - Data Structures"
            className="w-full rounded-lg border border-slate-400/25 bg-slate-950/70 px-3 py-2 text-sm text-ivory-100 placeholder:text-ivory-600 focus:border-cyan-300/60 focus:outline-none"
            style={accent ? { caretColor: accent } : undefined}
          />
          <input
            value={value.r}
            onChange={(e) => onChange({ ...value, r: e.target.value.toUpperCase() })}
            placeholder="Room — e.g. PRP472"
            className="w-full rounded-lg border border-slate-400/25 bg-slate-950/70 px-3 py-2 font-mono text-sm uppercase tracking-wider text-ivory-100 placeholder:text-ivory-600 focus:border-cyan-300/60 focus:outline-none"
          />
        </div>
      )}
      {!enabled && <p className="text-xs text-ivory-500">Not registered — tick “Registered” to add a class here.</p>}
    </div>
  );
}

// ─── CELL EDITOR ──────────────────────────────────────────────────────────────
export function CellEditorModal({ person, day, col, onClose, onSave, onMirrorLab }) {
  useEscape(onClose);
  const ts = THEORY_SLOT[day][col];
  const ls = LAB_SLOT[day][col];
  const reg = person.registered[day] || { theory: {}, lab: {} };

  const [theory, setTheory] = useState(() => (ts && reg.theory[ts] ? { ...reg.theory[ts] } : null));
  const [lab, setLab] = useState(() => (ls && reg.lab[ls] ? { ...reg.lab[ls] } : null));
  const [mirrored, setMirrored] = useState(false);
  const { error, showError, hideError } = useErrorPopup();
  const [invalidKind, setInvalidKind] = useState(null);

  const pairCol = LAB_PAIR[col];
  const pairCode = pairCol !== undefined && day ? LAB_SLOT[day][pairCol] : null;

  const save = () => {
    if (theory !== null && !theory.n.trim()) {
      setInvalidKind('theory');
      showError(`Course name is empty for theory slot ${ts}. Fill it in or untick \u201cRegistered\u201d.`);
      return;
    }
    if (lab !== null && !lab.n.trim()) {
      setInvalidKind('lab');
      showError(`Course name is empty for lab slot ${ls}. Fill it in or untick \u201cRegistered\u201d.`);
      return;
    }
    onSave({ theoryCode: ts, theory, labCode: ls, lab });
    onClose();
  };

  const mirror = () => {
    if (!lab || !lab.n.trim() || pairCol === undefined) return;
    onMirrorLab(pairCol, lab);
    setMirrored(true);
    setTimeout(() => setMirrored(false), 2000);
  };

  return (
    <>
    <ModalShell
      title={`${person.emoji} ${person.name} · ${day}`}
      subtitle={`Editing ${[ts ? `theory ${ts}` : null, ls ? `lab ${ls}` : null].filter(Boolean).join(' + ')} — changes apply instantly`}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-400/25 px-4 py-2 text-sm font-bold text-ivory-200 transition hover:bg-slate-700/60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            className="rounded-xl bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-300"
          >
            Save
          </button>
        </div>
      }
    >
      {ts && <SlotFields code={ts} kind="Theory" value={theory} onChange={(v) => { setTheory(v); setInvalidKind(null); }} invalid={invalidKind === 'theory'} accent={person.accent} />}
      {ls && (
        <>
          <SlotFields code={ls} kind="Lab" value={lab} onChange={(v) => { setLab(v); setInvalidKind(null); }} invalid={invalidKind === 'lab'} accent={person.accent} />
          {pairCode && lab && lab.n.trim() && (
            <button
              type="button"
              onClick={mirror}
              className="w-full rounded-xl border border-dashed border-lime-400/40 bg-lime-400/5 px-3 py-2 text-xs font-semibold text-lime-200 transition hover:bg-lime-400/10"
            >
              {mirrored ? `✓ Copied to ${pairCode}` : `⧉ Also set ${pairCode} (labs span both halves of a 2-hr block)`}
            </button>
          )}
        </>
      )}
      {!ts && !ls && <p className="text-sm text-ivory-400">Nothing editable in this column.</p>}
    </ModalShell>
      <ErrorPopup message={error} onClose={hideError} />
    </>
  );
}

// ─── PERSON EDITOR (add + edit) ───────────────────────────────────────────────
export function PersonModal({ person, onClose, onSave, onDelete, onImport }) {
  useEscape(onClose);
  const isNew = !person;
  const [name, setName] = useState(person?.name || '');
  const [nickname, setNickname] = useState(person?.nickname || '');
  const [emoji, setEmoji] = useState(person?.emoji || '🎓');
  const [accent, setAccent] = useState(person?.accent || '#00d4ff');
  const { error, showError, hideError } = useErrorPopup();
  const [nameInvalid, setNameInvalid] = useState(false);

  const save = () => {
    if (!name.trim()) {
      setNameInvalid(true);
      showError('Please enter a name for this member.');
      return;
    }
    onSave({
      ...(person || {}),
      name: name.trim(),
      nickname: nickname.trim(),
      emoji: emoji.trim() || '🎓',
      accent,
    });
    onClose();
  };

  return (
    <>
    <ModalShell
      title={
        isNew ? (
          <span className="inline-flex items-center gap-2">
            <RuneIcon name="plus" className="h-5 w-5" /> Add squad member
          </span>
        ) : (
          `${person.emoji} Edit ${person.name}`
        )
      }
      subtitle={isNew ? 'Import from a timetable photo, or start empty and fill cells by hand.' : 'Profile details. Timetable cells are edited from the grid.'}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-2">
          <div>
            {!isNew && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Remove ${person.name} from the squad?`)) {
                    onDelete();
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
              >
                <RuneIcon name="trash" tone="red" className="h-4 w-4" />
                Remove
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-400/25 px-4 py-2 text-sm font-bold text-ivory-200 transition hover:bg-slate-700/60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-xl bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-300"
            >
              {isNew ? 'Add member' : 'Save'}
            </button>
          </div>
        </div>
      }
    >
      {isNew && onImport && (
        <button
          type="button"
          onClick={() => onImport({ name, nickname, emoji, accent })}
          className="flex w-full items-center gap-3 rounded-xl border border-cyan-300/30 bg-cyan-400/10 p-3 text-left transition hover:bg-cyan-400/20"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/20">
            <RuneIcon name="camera" tone="ice" className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-sm font-bold text-cyan-100">Upload timetable image</span>
            <span className="block text-xs text-cyan-200/70">
              Snap of VTOP / FFCS timetable → slots, courses & rooms extracted automatically
            </span>
          </span>
        </button>
      )}
      <div className="grid gap-3 sm:grid-cols-[72px_1fr]">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ivory-400">Emoji</label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
            className="w-full rounded-lg border border-slate-400/25 bg-slate-950/70 px-3 py-2 text-center text-xl focus:border-cyan-300/60 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ivory-400">Name</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameInvalid(false);
            }}
            placeholder="e.g. Vaishanth"
            className={`w-full rounded-lg border bg-slate-950/70 px-3 py-2 text-sm text-ivory-100 placeholder:text-ivory-600 focus:outline-none ${nameInvalid ? 'border-red-400/70 ring-2 ring-red-500/30' : 'border-slate-400/25 focus:border-cyan-300/60'}`}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ivory-400">
          Nickname <span className="font-normal text-ivory-500">(optional — shown on double-click)</span>
        </label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="e.g. Playboy"
          className="w-full rounded-lg border border-slate-400/25 bg-slate-950/70 px-3 py-2 text-sm text-ivory-100 placeholder:text-ivory-600 focus:border-cyan-300/60 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-ivory-400">Accent colour</label>
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setAccent(c)}
              title={c}
              aria-label={`Use colour ${c}`}
              className={`h-8 w-8 rounded-full transition ${accent === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'ring-1 ring-white/20 hover:scale-110'}`}
              style={{ background: c }}
            />
          ))}
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            title="Custom colour"
            className="h-8 w-10 cursor-pointer rounded-md border border-slate-400/25 bg-transparent"
          />
        </div>
      </div>

      <div
        className="flex items-center gap-2.5 rounded-xl border border-slate-400/20 bg-slate-800/50 p-3"
        style={{ borderTop: `3px solid ${accent}` }}
      >
        <span className="text-2xl">{emoji || '🎓'}</span>
        <div>
          <p className="text-sm font-bold text-ivory-100">{name || 'Preview Name'}</p>
          <p className="text-xs text-ivory-400">This is how their card will look.</p>
        </div>
      </div>
    </ModalShell>
      <ErrorPopup message={error} onClose={hideError} />
    </>
  );
}
