// Timetable import wizard: photo/screenshot (OCR) or pasted text -> review rows
// -> new squad member with a full timetable. Also asks morning/evening batch,
// which decides the 1/2 suffix for slots read without one (e.g. bare "A").
import { useEffect, useMemo, useRef, useState } from 'react';
import { ACCENT_PRESETS, ModalShell, useEscape } from './Editors';
import { ErrorPopup, useErrorPopup } from './ErrorPopup';
import { RuneIcon } from './Icons';
import { recognizeFile } from '../lib/ocr';
import {
  buildRegistered,
  parseSlotText,
  parseTimetableText,
  resolveSlot,
  slotsToText,
  uid,
} from '../lib/parseTimetable';
import { DAYS } from '../lib/ffcs';

const MAX_IMAGE_MB = 15;

function friendlyStatus(status) {
  const s = String(status || '').toLowerCase();
  if (s.includes('core')) return 'Loading text engine… (first time only)';
  if (s.includes('traineddata') || s.includes('language')) return 'Loading English data… (first time only)';
  if (s.includes('recognizing')) return 'Reading your timetable…';
  if (s.includes('initialized')) return 'Almost there…';
  return 'Working…';
}

function BatchPicker({ batch, onChange }) {
  const btn = (value, icon, label, hint) => (
    <button
      key={value}
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={batch === value}
      className={`flex-1 rounded-xl border px-3 py-2.5 text-left transition ${
        batch === value
          ? 'border-cyan-300/60 bg-cyan-400/15 shadow-lg shadow-cyan-500/20'
          : 'border-slate-400/20 bg-slate-800/50 hover:border-slate-400/40'
      }`}
    >
      <span className="block text-lg">{icon}</span>
      <span className={`block text-sm font-bold ${batch === value ? 'text-cyan-100' : 'text-ivory-200'}`}>{label}</span>
      <span className="block text-[0.7rem] text-ivory-400">{hint}</span>
    </button>
  );
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-ivory-400">
        Batch <span className="font-normal text-ivory-500">(decides 1 vs 2 for slots read without a suffix)</span>
      </label>
      <div className="flex gap-2">
        {btn('morning', '🌅', 'Morning batch', 'Bare “A” → A1')}
        {btn('evening', '🌆', 'Evening batch', 'Bare “A” → A2')}
      </div>
    </div>
  );
}

function SlotChips({ slots, batch }) {
  if (slots.length === 0) return <span className="text-xs text-ivory-600">no slots</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {slots.map((s, i) => {
        if (s.kind === 'unknown' || (!s.code && !s.base)) {
          return (
            <span key={i} className="rounded bg-red-500/15 px-1.5 py-px text-[0.7rem] font-bold text-red-300 ring-1 ring-red-400/40">
              {s.code || '?'} ?
            </span>
          );
        }
        const r = resolveSlot(s, batch);
        const cls =
          r.kind === 'lab'
            ? 'bg-lime-400/10 text-lime-300 ring-lime-400/30'
            : 'bg-sky-400/10 text-sky-300 ring-sky-400/30';
        return (
          <span key={i} className={`rounded px-1.5 py-px font-mono text-[0.7rem] font-bold ring-1 ${cls}`}>
            {r.code}
            {r.swapped ? '*' : ''}
          </span>
        );
      })}
    </span>
  );
}

export default function ImportTimetable({ draft, onClose, onCreate }) {
  useEscape(onClose);
  const fileRef = useRef(null);

  // Profile
  const [name, setName] = useState(draft?.name || '');
  const [nickname, setNickname] = useState(draft?.nickname || '');
  const [emoji, setEmoji] = useState(draft?.emoji || '🎓');
  const [accent, setAccent] = useState(draft?.accent || '#00d4ff');
  const [batch, setBatch] = useState('morning');

  // Source
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [useText, setUseText] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // Flow
  const [step, setStep] = useState('details'); // details | working | review
  const [progress, setProgress] = useState({ label: 'Starting…', pct: null });
  const { error, showError, hideError } = useErrorPopup();
  const [rawText, setRawText] = useState('');
  const [rows, setRows] = useState([]); // { id, slotText, course, room }
  const [parseWarnings, setParseWarnings] = useState([]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const acceptFile = (file) => {
    hideError();
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showError('That file is not an image. Upload a PNG/JPG screenshot or photo.');
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      showError(`Image is over ${MAX_IMAGE_MB} MB — try a smaller screenshot.`);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setImageFile(file);
    setUseText(false);
  };

  const extract = async () => {
    if (!name.trim()) {
      showError('Give this member a name first.');
      return;
    }
    if (!useText && !imageFile) {
      showError('Upload a timetable image, or switch to “paste text”.');
      return;
    }
    if (useText && !pastedText.trim()) {
      showError('Paste the timetable text first.');
      return;
    }
    hideError();
    setStep('working');
    try {
      let text = pastedText;
      if (!useText) {
        setProgress({ label: 'Preparing image…', pct: null });
        text = await recognizeFile(imageFile, (m) => {
          const pct = m.status && String(m.status).includes('recognizing') && typeof m.progress === 'number'
            ? Math.round(m.progress * 100)
            : null;
          setProgress({ label: friendlyStatus(m.status), pct });
        });
      }
      if (!text || !text.trim()) throw new Error('Could not read any text from that image. Try a clearer screenshot, or paste the text instead.');
      setRawText(text);
      const { items, warnings } = parseTimetableText(text);
      if (items.length === 0) {
        throw new Error('No timetable slots found. Make sure slot codes like A1, TA1 or L3 are visible — or paste the text instead.');
      }
      setRows(items.map((it) => ({ id: it.id, slotText: slotsToText(it.slots, batch), course: it.course, room: it.room })));
      setParseWarnings(warnings);
      setStep('review');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Something went wrong while reading the image.');
      setStep('details');
    }
  };

  const parsedRows = useMemo(
    () => rows.map((r) => ({ ...r, slots: parseSlotText(r.slotText) })),
    [rows],
  );

  const build = useMemo(() => buildRegistered(parsedRows, batch), [parsedRows, batch]);

  const daysCovered = useMemo(() => {
    const reg = build.registered;
    return DAYS.filter((d) => Object.keys(reg[d].theory).length > 0 || Object.keys(reg[d].lab).length > 0);
  }, [build]);

  const updateRow = (id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const deleteRow = (id) => setRows((rs) => rs.filter((r) => r.id !== id));
  const addRow = () => setRows((rs) => [...rs, { id: uid(), slotText: '', course: '', room: '' }]);

  const create = () => {
    if (!name.trim()) {
      showError('Give this member a name first.');
      return;
    }
    onCreate({
      name: name.trim(),
      nickname: nickname.trim(),
      emoji: emoji.trim() || '🎓',
      accent,
      registered: build.registered,
    });
  };

  return (
    <>
    <ModalShell
      wide
      title={
        <span className="inline-flex items-center gap-2">
          <RuneIcon name="camera" className="h-5 w-5" /> Import timetable from image
        </span>
      }
      subtitle="Extract slots, courses & rooms automatically — then review before creating the member."
      onClose={onClose}
      footer={
        step === 'details' ? (
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
              onClick={extract}
              className="rounded-xl bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-300"
            >
              {useText ? 'Parse & review →' : 'Extract & review →'}
            </button>
          </div>
        ) : step === 'review' ? (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setStep('details')}
              className="rounded-xl border border-slate-400/25 px-4 py-2 text-sm font-bold text-ivory-200 transition hover:bg-slate-700/60"
            >
              ← Back
            </button>
            <div className="flex items-center gap-2 text-xs text-ivory-400">
              <span>
                {build.counts.theory} theory · {build.counts.lab} lab
                {daysCovered.length > 0 && ` · ${daysCovered.join(', ')}`}
              </span>
              <button
                type="button"
                onClick={create}
                className="rounded-xl bg-emerald-400 px-5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300"
              >
                ✓ Create {name.trim() || 'member'}
              </button>
            </div>
          </div>
        ) : null
      }
    >
      {step === 'details' && (
        <>
          {/* Profile */}
          <div className="grid gap-3 sm:grid-cols-[64px_1fr_1fr]">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ivory-400">Emoji</label>
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className="w-full rounded-lg border border-slate-400/25 bg-slate-950/70 px-2 py-2 text-center text-xl focus:border-cyan-300/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ivory-400">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aarav"
                className="w-full rounded-lg border border-slate-400/25 bg-slate-950/70 px-3 py-2 text-sm text-ivory-100 placeholder:text-ivory-600 focus:border-cyan-300/60 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ivory-400">Nickname</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="optional"
                className="w-full rounded-lg border border-slate-400/25 bg-slate-950/70 px-3 py-2 text-sm text-ivory-100 placeholder:text-ivory-600 focus:border-cyan-300/60 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ivory-400">Accent colour</label>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  aria-label={`Use colour ${c}`}
                  className={`h-7 w-7 rounded-full transition ${accent === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'ring-1 ring-white/20 hover:scale-110'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <BatchPicker batch={batch} onChange={setBatch} />

          {/* Source toggle */}
          <div className="flex rounded-xl border border-slate-400/20 bg-slate-800/40 p-1 text-sm font-bold">
            <button
              type="button"
              onClick={() => setUseText(false)}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 transition ${!useText ? 'bg-cyan-400/20 text-cyan-100' : 'text-ivory-400 hover:text-ivory-200'}`}
            >
              <RuneIcon name="camera" tone={!useText ? 'ice' : 'ivory'} className="h-4 w-4" />
              Image
            </button>
            <button
              type="button"
              onClick={() => setUseText(true)}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 transition ${useText ? 'bg-cyan-400/20 text-cyan-100' : 'text-ivory-400 hover:text-ivory-200'}`}
            >
              <RuneIcon name="scroll" tone={useText ? 'ice' : 'ivory'} className="h-4 w-4" />
              Paste text
            </button>
          </div>

          {!useText ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current && fileRef.current.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileRef.current && fileRef.current.click();
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files && e.dataTransfer.files[0];
                if (f) acceptFile(f);
              }}
              onPaste={(e) => {
                const f = e.clipboardData.files && e.clipboardData.files[0];
                if (f) {
                  e.preventDefault();
                  acceptFile(f);
                }
              }}
              className="cursor-pointer rounded-xl border-2 border-dashed border-slate-600/70 bg-slate-800/30 p-4 text-center transition hover:border-cyan-300/60 hover:bg-cyan-400/5"
            >
              {previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={previewUrl} alt="Timetable to import" className="max-h-48 rounded-lg border border-slate-400/20 object-contain" />
                  <p className="text-xs text-ivory-400">
                    {imageFile?.name || 'pasted screenshot'} · click to change, or paste a new screenshot (Ctrl+V)
                  </p>
                </div>
              ) : (
                <>
                  <RuneIcon name="image" className="mx-auto h-10 w-10" strokeWidth={1.6} />
                  <p className="mt-1 text-sm font-bold text-ivory-200">Drop a timetable screenshot here</p>
                  <p className="mt-0.5 text-xs text-ivory-400">or click to browse · or paste a screenshot with Ctrl+V</p>
                  <p className="mt-0.5 text-[0.7rem] text-ivory-500">VTOP / FFCS screenshots with slot codes work best</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => acceptFile(e.target.files[0])} />
            </div>
          ) : (
            <div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={7}
                placeholder={'Paste timetable rows, e.g.\nA1+TA1 BACSE202 Data Structures PRP472\nL3+L4 BACSE202 Data Structures Lab PRP347'}
                className="w-full rounded-xl border border-slate-400/25 bg-slate-950/70 px-3 py-2 font-mono text-xs text-ivory-100 placeholder:text-ivory-600 focus:border-cyan-300/60 focus:outline-none"
              />
              <p className="mt-1 text-[0.7rem] text-ivory-500">One course per line, with slot codes + room. Copy-paste from VTOP works great.</p>
            </div>
          )}


        </>
      )}

      {step === 'working' && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-300/30 border-t-cyan-300" />
          <div>
            <p className="text-sm font-bold text-ivory-100">{progress.label}</p>
            {progress.pct !== null && (
              <>
                <div className="mx-auto mt-3 h-2 w-56 overflow-hidden rounded-full bg-slate-700/60">
                  <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress.pct}%` }} />
                </div>
                <p className="mt-1 font-mono text-xs text-ivory-400">{progress.pct}%</p>
              </>
            )}
            {progress.pct === null && <p className="mt-1 text-xs text-ivory-500">This can take ~10–30 seconds on first use.</p>}
          </div>
        </div>
      )}

      {step === 'review' && (
        <>
          <BatchPicker batch={batch} onChange={setBatch} />

          {(parseWarnings.length > 0 || build.warnings.length > 0) && (
            <div className="space-y-1 rounded-xl border border-amber-400/30 bg-amber-400/5 px-3 py-2">
              {[...parseWarnings, ...build.warnings].slice(0, 6).map((w, i) => (
                <p key={i} className="flex items-start gap-1.5 text-xs text-amber-200/90">
                  <RuneIcon name="warning" className="mt-px h-3.5 w-3.5" strokeWidth={2.2} />
                  <span>{w}</span>
                </p>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-ivory-400">
              Check each row — fix anything the reader got wrong, then create the member.
            </p>
            {parsedRows.map((row) => (
              <div key={row.id} className="rounded-xl border border-slate-400/20 bg-slate-800/50 p-2.5">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <SlotChips slots={row.slots} batch={batch} />
                  <button
                    type="button"
                    onClick={() => deleteRow(row.id)}
                    title="Remove row"
                    className="rounded-md p-1.5 transition hover:bg-red-500/20"
                  >
                    <RuneIcon name="close" tone="red" className="block h-3 w-3" strokeWidth={2.6} />
                  </button>
                </div>
                <div className="grid gap-1.5 sm:grid-cols-[150px_1fr_110px]">
                  <input
                    value={row.slotText}
                    onChange={(e) => updateRow(row.id, { slotText: e.target.value.toUpperCase() })}
                    placeholder="A1 + TA1"
                    title="Slot codes, separated by + , / or spaces"
                    className="w-full rounded-lg border border-slate-400/25 bg-slate-950/70 px-2 py-1.5 font-mono text-xs text-ivory-100 placeholder:text-ivory-600 focus:border-cyan-300/60 focus:outline-none"
                  />
                  <input
                    value={row.course}
                    onChange={(e) => updateRow(row.id, { course: e.target.value })}
                    placeholder="Course — e.g. BACSE202 - Data Structures"
                    className="w-full rounded-lg border border-slate-400/25 bg-slate-950/70 px-2 py-1.5 text-xs text-ivory-100 placeholder:text-ivory-600 focus:border-cyan-300/60 focus:outline-none"
                  />
                  <input
                    value={row.room}
                    onChange={(e) => updateRow(row.id, { room: e.target.value.toUpperCase() })}
                    placeholder="Room"
                    className="w-full rounded-lg border border-slate-400/25 bg-slate-950/70 px-2 py-1.5 font-mono text-xs uppercase text-ivory-100 placeholder:text-ivory-600 focus:border-cyan-300/60 focus:outline-none"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="w-full rounded-xl border border-dashed border-slate-600/60 px-3 py-2 text-xs font-bold text-ivory-400 transition hover:border-cyan-300/50 hover:text-cyan-200"
            >
              ＋ Add a row manually
            </button>
          </div>

          <details className="rounded-xl border border-slate-400/15 bg-slate-950/50 px-3 py-2">
            <summary className="cursor-pointer text-xs font-semibold text-ivory-400">View raw extracted text</summary>
            <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[0.7rem] leading-relaxed text-ivory-500">
              {rawText || pastedText}
            </pre>
          </details>


        </>
      )}
    </ModalShell>
      <ErrorPopup message={error} onClose={hideError} />
    </>
  );
}
