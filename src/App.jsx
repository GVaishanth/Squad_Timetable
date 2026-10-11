import { useMemo, useState } from 'react';
import Header from './components/Header';
import { ProfileCard, SquadPulse, StatusPill } from './components/StatusCards';
import Timetable from './components/Timetable';
import { CellEditorModal, PersonModal } from './components/Editors';
import ImportTimetable from './components/ImportTimetable';
import BifrostBackground from './components/BifrostBackground';
import { MjolnirIcon, RuneIcon } from './components/Icons';
import { useNow, usePeople } from './hooks';
import { LAB_SLOT, THEORY_SLOT, nowMins, statusOf, todayCode } from './lib/ffcs';

// Card widths for a centered, wrapping row (gap-2.5 on mobile, gap-4 from sm).
const CARD_W =
  'w-[calc((100%-0.625rem)/2)] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-5rem)/6)]';

export default function App() {
  const now = useNow(1000);
  const { people, custom, saveSlot, savePerson, removePerson, resetAll, exportJson, importJson } = usePeople();

  const day = todayCode(now);
  const mins = nowMins(now);

  const [editMode, setEditMode] = useState(false);
  const [cellTarget, setCellTarget] = useState(null); // { personId, day, col }
  const [personTarget, setPersonTarget] = useState(undefined); // undefined = closed, null = new, id = edit
  const [importDraft, setImportDraft] = useState(null); // null = closed, object = import wizard open

  const statuses = useMemo(
    () => people.map((person) => ({ person, status: statusOf(person, day, mins) })),
    [people, day, mins],
  );

  const cellPerson = cellTarget ? people.find((p) => p.id === cellTarget.personId) : null;
  const editingPerson =
    personTarget === undefined || personTarget === null
      ? null
      : people.find((p) => p.id === personTarget) || null;

  return (
    <>
    <BifrostBackground />
    <div className="mx-auto min-h-screen w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-6">
      <Header
        now={now}
        editMode={editMode}
        onToggleEdit={() => setEditMode((v) => !v)}
        custom={custom}
        onExport={exportJson}
        onImport={importJson}
        onReset={resetAll}
      />

      <SquadPulse statuses={statuses} day={day} mins={mins} />

      {/* Legend */}
      <div className="mb-5 flex flex-wrap justify-center gap-2 text-xs text-ivory-400">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/60 px-2.5 py-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" /> Theory slot
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/60 px-2.5 py-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-lime-300" /> Lab slot
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/60 px-2.5 py-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-950 shadow-[inset_0_0_0_2px_#ef4444]" /> Current (class)
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/60 px-2.5 py-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-950 shadow-[inset_0_0_0_2px_#22c55e]" /> Current (free)
        </span>
      </div>

      {/* Profile cards */}
      <div className="mb-7 flex flex-wrap justify-center gap-2.5 sm:gap-4">
        {statuses.map(({ person, status }) => (
          <div key={person.id} className={`${CARD_W} flex [&>*]:flex-1`}>
          <ProfileCard
            person={person}
            status={status}
            editMode={editMode}
            onEdit={() => setPersonTarget(person.id)}
          />
          </div>
        ))}
        {editMode && (
          <button
            type="button"
            onClick={() => setPersonTarget(null)}
            className={`${CARD_W} group flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-amber-300/25 bg-slate-800/30 p-4 text-ivory-400 transition hover:border-amber-300/60 hover:bg-amber-400/5 hover:text-amber-200`}
          >
            <RuneIcon name="plus" className="h-9 w-9 transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            <span className="text-sm font-bold">Add member</span>
          </button>
        )}
      </div>

      {/* Timetables */}
      <div className="space-y-5">
        {statuses.map(({ person, status }) => (
          <section
            key={person.id}
            className="bifrost-box slow overflow-hidden rounded-2xl"
          >
            <div
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 border-b border-slate-400/15 bg-white/[0.02] px-4 py-3"
              style={{ borderLeft: `5px solid ${person.accent}` }}
            >
              <div className="justify-self-start">
                {editMode && (
                  <button
                    type="button"
                    onClick={() => setPersonTarget(person.id)}
                    title={`Edit ${person.name}`}
                    className="group inline-flex items-center gap-1.5 rounded-lg border border-amber-300/25 bg-slate-800/80 px-2.5 py-1 text-xs font-bold text-ivory-100 transition hover:border-amber-300/60 hover:bg-slate-700/80"
                  >
                    <MjolnirIcon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12" />
                    <span className="font-display tracking-wider">Edit</span>
                  </button>
                )}
              </div>
              <h2 className="flex min-w-0 items-center justify-center gap-2.5 font-display text-base font-bold tracking-wide text-ivory-50 sm:text-lg">
                <span className="text-2xl">{person.emoji}</span>
                <span className="truncate">{person.name}</span>
              </h2>
              <div className="justify-self-end">
                <StatusPill badge={status.badge} label={status.label} />
              </div>
            </div>
            <Timetable
              person={person}
              day={day}
              mins={mins}
              now={now}
              editMode={editMode}
              onCellClick={(d, c) => setCellTarget({ personId: person.id, day: d, col: c })}
            />
          </section>
        ))}
      </div>

      <footer className="mt-6 pb-4 text-center text-xs text-ivory-500">
        Auto-updates every second · 100% offline · Mon–Fri
        {custom ? ' · showing your saved edits' : ' · showing original data'}
      </footer>

      {/* Modals */}
      {cellTarget && cellPerson && (
        <CellEditorModal
          person={cellPerson}
          day={cellTarget.day}
          col={cellTarget.col}
          onClose={() => setCellTarget(null)}
          onSave={(payload) => saveSlot(cellPerson.id, cellTarget.day, payload)}
          onMirrorLab={(pairCol, labVal) =>
            saveSlot(cellPerson.id, cellTarget.day, {
              theoryCode: THEORY_SLOT[cellTarget.day][pairCol],
              theory:
                (THEORY_SLOT[cellTarget.day][pairCol] &&
                  cellPerson.registered[cellTarget.day]?.theory[THEORY_SLOT[cellTarget.day][pairCol]]) ||
                null,
              labCode: LAB_SLOT[cellTarget.day][pairCol],
              lab: labVal,
            })
          }
        />
      )}
      {personTarget !== undefined && (
        <PersonModal
          person={editingPerson}
          onClose={() => setPersonTarget(undefined)}
          onSave={savePerson}
          onDelete={() => personTarget && removePerson(personTarget)}
          onImport={(draft) => {
            setPersonTarget(undefined);
            setImportDraft(draft || {});
          }}
        />
      )}
      {importDraft !== null && (
        <ImportTimetable
          draft={importDraft}
          onClose={() => setImportDraft(null)}
          onCreate={(person) => {
            savePerson(person);
            setImportDraft(null);
          }}
        />
      )}
    </div>
    </>
  );
}
