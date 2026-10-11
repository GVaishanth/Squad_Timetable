import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PEOPLE } from './data/defaultPeople';
import { DAYS } from './lib/ffcs';

const STORAGE_KEY = 'squad-timetable:v2';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function emptyRegistered() {
  const reg = {};
  for (const d of DAYS) reg[d] = { theory: {}, lab: {} };
  return reg;
}

function slugify(text) {
  return (
    String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'member'
  );
}

// Ticks every `step` ms with a fresh Date. The whole app re-renders off this.
export function useNow(step = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), step);
    return () => clearInterval(t);
  }, [step]);
  return now;
}

function loadPeople() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { people: clone(DEFAULT_PEOPLE), custom: false };
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('bad shape');
    return { people: normalizeImported(parsed), custom: true };
  } catch {
    return { people: clone(DEFAULT_PEOPLE), custom: false };
  }
}

// Validate + normalize imported / stored data so a bad file can't break the app.
export function normalizeImported(data) {
  if (!Array.isArray(data) || data.length === 0) throw new Error('No members found in file.');
  return data.map((p, i) => {
    if (!p || typeof p !== 'object' || !p.registered || typeof p.registered !== 'object') {
      throw new Error(`Member #${i + 1} is missing timetable data.`);
    }
    const reg = {};
    for (const d of DAYS) {
      const r = p.registered[d] || {};
      reg[d] = { theory: { ...(r.theory || {}) }, lab: { ...(r.lab || {}) } };
    }
    return {
      id: String(p.id || `${slugify(p.name)}-${i}`),
      name: String(p.name || `Member ${i + 1}`),
      // `previousName` is the pre-v2.1 field name — still accepted for old backups.
      nickname: String(p.nickname ?? p.previousName ?? ''),
      emoji: String(p.emoji || '🎓'),
      accent: String(p.accent || '#00d4ff'),
      registered: reg,
    };
  });
}

export function usePeople() {
  const [state, setState] = useState(loadPeople);

  // Persist every change to this browser.
  useEffect(() => {
    if (!state.custom) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.people));
    } catch {
      /* storage full / unavailable — app still works in-memory */
    }
  }, [state]);

  const setPeople = useCallback((updater) => {
    setState((s) => ({
      custom: true,
      people: typeof updater === 'function' ? updater(s.people) : updater,
    }));
  }, []);

  // Edit the slot registrations for one cell: { theoryCode, theory, labCode, lab }
  // where theory/lab are { n, r } objects or null (unregistered).
  const saveSlot = useCallback(
    (personId, day, { theoryCode, theory, labCode, lab }) => {
      setPeople((prev) =>
        prev.map((p) => {
          if (p.id !== personId) return p;
          const dayReg = p.registered[day] || { theory: {}, lab: {} };
          const nextTheory = { ...(dayReg.theory || {}) };
          const nextLab = { ...(dayReg.lab || {}) };
          if (theoryCode) {
            if (theory && theory.n && theory.n.trim()) {
              nextTheory[theoryCode] = { n: theory.n.trim(), r: (theory.r || '').trim() };
            } else {
              delete nextTheory[theoryCode];
            }
          }
          if (labCode) {
            if (lab && lab.n && lab.n.trim()) {
              nextLab[labCode] = { n: lab.n.trim(), r: (lab.r || '').trim() };
            } else {
              delete nextLab[labCode];
            }
          }
          return { ...p, registered: { ...p.registered, [day]: { theory: nextTheory, lab: nextLab } } };
        }),
      );
    },
    [setPeople],
  );

  const savePerson = useCallback(
    (person) => {
      setPeople((prev) => {
        const exists = prev.some((p) => p.id === person.id);
        if (exists) return prev.map((p) => (p.id === person.id ? { ...p, ...person } : p));
        return [...prev, { ...person, id: person.id || `${slugify(person.name)}-${Date.now()}`, registered: person.registered || emptyRegistered() }];
      });
    },
    [setPeople],
  );

  const removePerson = useCallback(
    (personId) => {
      setPeople((prev) => prev.filter((p) => p.id !== personId));
    },
    [setPeople],
  );

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState({ people: clone(DEFAULT_PEOPLE), custom: false });
  }, []);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(state.people, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'squad-timetable.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [state.people]);

  const importJson = useCallback(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result));
            setPeople(normalizeImported(parsed));
            resolve({ ok: true });
          } catch (err) {
            resolve({ ok: false, error: err instanceof Error ? err.message : 'Could not read that file.' });
          }
        };
        reader.onerror = () => resolve({ ok: false, error: 'Could not read that file.' });
        reader.readAsText(file);
      }),
    [setPeople],
  );

  return {
    people: state.people,
    custom: state.custom,
    saveSlot,
    savePerson,
    removePerson,
    resetAll,
    exportJson,
    importJson,
  };
}
