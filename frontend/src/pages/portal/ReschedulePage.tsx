import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { RescheduleSection } from '../../types/portal';
import { useStackedToasts } from '../../hooks/useStackedToasts';

type SlotType = 'free' | 'busy' | 'open';

const blockStyles: Record<SlotType, string> = {
  free: 'bg-emerald-50/80 text-emerald-800 ring-emerald-200/80',
  busy: 'bg-rose-50/80 text-rose-800 ring-rose-200/80',
  open: 'bg-white text-slate-500 ring-transparent',
};

const statusOptions: Array<{ value: SlotType; label: string; description: string; swatch: string }> = [
  { value: 'free', label: 'Free Time', description: 'Available for new sessions', swatch: 'bg-emerald-500' },
  { value: 'busy', label: 'Busy Time', description: 'Already committed', swatch: 'bg-rose-500' },
  { value: 'open', label: 'Open', description: 'Undecided / TBD', swatch: 'bg-slate-300' },
];

const ReschedulePage = () => {
  const { portal, updatePortal } = useAuth();
  const reschedule = portal?.reschedule;
  
  // Updated to show only 6am to 9pm (15 hours)
  const timelineLabels = useMemo(() => {
    const labels: string[] = [];
    for (let hour = 6; hour <= 11; hour += 1) {
      labels.push(`${hour.toString().padStart(2, '0')}:00 AM`);
    }
    labels.push('12:00 PM');
    for (let hour = 1; hour <= 9; hour += 1) {
      labels.push(`${hour.toString().padStart(2, '0')}:00 PM`);
    }
    return labels;
  }, []);

  // Initialize grid state with correct number of time slots (15 hours)
  const initializeGrid = () => {
    if (!reschedule?.grid) return [];
    
    return reschedule.grid.map(row => ({
      ...row,
      blocks: Array(timelineLabels.length).fill('open').map((_, idx) => {
        // Preserve existing data if available
        return row.blocks[idx] || 'open';
      })
    }));
  };

  const [gridState, setGridState] = useState<RescheduleSection['grid']>(initializeGrid());
  const [selectedType, setSelectedType] = useState<SlotType>('free');
  const dayColumns = useMemo(() => gridState.map((row) => row.day), [gridState]);
  
  const { toasts, showToast } = useStackedToasts();

  if (!reschedule) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Reschedule grid unavailable.</div>;
  }

  const handleCellClick = (rowIndex: number, colIndex: number, type?: SlotType) => {
    const nextType = type ?? selectedType;
    setGridState((prev) =>
      prev.map((row, rIdx) =>
        rIdx === rowIndex
          ? { ...row, blocks: row.blocks.map((block, cIdx) => (cIdx === colIndex ? nextType : block)) }
          : row,
      ),
    );
  };

  const handleSaveSchedule = async () => {
    if (!portal || !updatePortal) {
      showToast('Unable to save schedule. Please try again.');
      return;
    }

    // Update the reschedule section with new grid
    await updatePortal({
      reschedule: {
        ...reschedule,
        grid: gridState
      } as RescheduleSection
    });
    
    showToast('✅ Availability updated successfully! Schedule has been saved.');
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
        <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">Reschedule</h1>
        <p className="mt-2 text-slate-500">Be specific about your desired timetable for better matching.</p>
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Select a status to paint</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedType(option.value)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  selectedType === option.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-soft'
                    : 'border-slate-100 bg-slate-50 text-slate-600'
                }`}
              >
                <span className={`h-4 w-4 rounded-full ${option.swatch}`} />
                <div>
                  <p className="text-sm font-semibold text-ink">{option.label}</p>
                  <p className="text-xs text-slate-500">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 max-h-[540px] overflow-auto rounded-[28px] border border-slate-100">
          <div className="min-w-[960px]">
            <div
              className="sticky top-0 z-20 grid bg-slate-50 text-xs font-semibold uppercase tracking-widest text-slate-400"
              style={{ gridTemplateColumns: `140px repeat(${dayColumns.length}, minmax(0, 1fr))` }}
            >
              <div className="sticky left-0 z-30 border-r border-slate-100 bg-slate-50 px-4 py-3 text-center text-slate-500">
                Time / Day
              </div>
              {dayColumns.map((day) => (
                <div
                  key={`day-${day}`}
                  className="border-r border-slate-100 px-4 py-3 text-center text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>
            {timelineLabels.map((label, timeIndex) => (
              <div
                key={`time-row-${timeIndex}`}
                className="grid border-t border-slate-100"
                style={{ gridTemplateColumns: `140px repeat(${dayColumns.length}, minmax(0, 1fr))` }}
              >
                <div className="sticky left-0 z-10 border-r border-slate-100 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </div>
                {gridState.map((row, dayIndex) => {
                  const slot = row.blocks[timeIndex] as SlotType | undefined;
                  return (
                    <button
                      key={`${row.day}-${label}`}
                      type="button"
                      onClick={() => handleCellClick(dayIndex, timeIndex)}
                      onDoubleClick={() => handleCellClick(dayIndex, timeIndex, 'open')}
                      className={`flex h-16 w-full items-center justify-center border-r border-slate-100 text-xs font-semibold transition duration-200 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${blockStyles[(slot ?? 'open') as SlotType]}`}
                      style={{ boxShadow: 'inset 0 0 0 1px rgba(148, 163, 184, 0.25)' }}
                    >
                      {slot === 'open' || !slot ? 'Open' : slot === 'free' ? 'Free' : 'Busy'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
      <aside className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">Time-type choices</h2>
        <p className="mt-2 text-sm text-slate-500">Use the palette to paint your ideal availability like a When2Meet grid.</p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {[
            'Tap a status chip (Free, Busy, Open) to set your brush.',
            'Click blocks on the grid to paint that availability.',
            'Double-click any slot to reset it to Open.',
          ].map((instruction) => (
            <p key={instruction} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              {instruction}
            </p>
          ))}
        </div>
        <button
          className="mt-6 w-full rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-primary/90"
          type="button"
          onClick={handleSaveSchedule}
        >
          Confirm changes
        </button>
      </aside>
    </div>

      <div aria-live="assertive" className="pointer-events-none fixed left-6 top-6 z-[60] flex w-full max-w-xs flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Success</p>
                <p className="text-xs text-emerald-800/80">{toast.message || 'Action completed successfully.'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReschedulePage;
