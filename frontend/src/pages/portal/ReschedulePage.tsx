import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { RescheduleSection } from '../../types/portal';

type SlotType = 'free' | 'busy' | 'open';

const blockStyles: Record<SlotType, string> = {
  free: 'bg-emerald-100 border-emerald-200 text-emerald-700',
  busy: 'bg-rose-100 border-rose-200 text-rose-700',
  open: 'bg-white border-slate-200 text-slate-500',
};

const statusOptions: Array<{ value: SlotType; label: string; description: string; swatch: string }> = [
  { value: 'free', label: 'Free Time', description: 'Available for new sessions', swatch: 'bg-emerald-500' },
  { value: 'busy', label: 'Busy Time', description: 'Already committed', swatch: 'bg-rose-500' },
  { value: 'open', label: 'Open', description: 'Undecided / TBD', swatch: 'bg-slate-300' },
];

const ReschedulePage = () => {
  const { portal } = useAuth();
  const reschedule = portal?.reschedule;
  const [gridState, setGridState] = useState<RescheduleSection['grid']>(reschedule?.grid ?? []);
  const [selectedType, setSelectedType] = useState<SlotType>('free');
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2200);
  };

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

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
                  selectedType === option.value ? 'border-primary bg-primary/5 shadow-soft' : 'border-slate-100 bg-slate-50'
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
        <div className="mt-6 grid gap-5">
          {gridState.map((row, rowIndex) => (
            <div key={row.day}>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-500">
                <span>{row.day}</span>
                <span className="text-xs uppercase tracking-wide text-slate-400">Click blocks to update</span>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {row.blocks.map((slot, colIndex) => (
                  <button
                    key={`${row.day}-${colIndex}`}
                    type="button"
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onDoubleClick={() => handleCellClick(rowIndex, colIndex, 'open')}
                    className={`h-16 rounded-2xl border text-xs font-semibold transition ${blockStyles[slot as SlotType]}`}
                  >
                    {slot === 'open' ? 'Open' : slot === 'free' ? 'Free' : 'Busy'}
                  </button>
                ))}
              </div>
            </div>
          ))}
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
          onClick={() => showToast('Availability updated successfully')}
        >
          Confirm changes
        </button>
      </aside>
    </div>

      <div
        aria-live="assertive"
        className={`pointer-events-none fixed left-6 top-6 z-[60] w-full max-w-xs transform rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm shadow-lg transition-all duration-300 ${
          toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        }`}
      >
        <div className="pointer-events-auto flex items-start gap-3 text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Success</p>
            <p className="text-xs text-emerald-800/80">{toast.message || 'Action completed successfully.'}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReschedulePage;
