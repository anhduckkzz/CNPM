import { useAuth } from '../../context/AuthContext';

const colorMap: Record<string, string> = {
  free: 'bg-emerald-100 border-emerald-200',
  busy: 'bg-rose-100 border-rose-200',
  open: 'bg-white border-slate-100',
};

const ReschedulePage = () => {
  const { portal } = useAuth();
  const reschedule = portal?.reschedule;

  if (!reschedule) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Reschedule grid unavailable.</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_1fr]">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">Reschedule</h1>
        <p className="mt-2 text-slate-500">Be specific about your desired timetable for better matching.</p>
        <div className="mt-6 grid gap-4">
          {reschedule.grid.map((row) => (
            <div key={row.day}>
              <p className="mb-2 text-sm font-semibold text-slate-500">{row.day}</p>
              <div className="grid grid-cols-8 gap-2">
                {row.blocks.map((slot, idx) => (
                  <div
                    key={`${row.day}-${idx}`}
                    className={`h-16 rounded-2xl border ${colorMap[slot] ?? 'bg-white border-slate-100'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <aside className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">Time-type choices</h2>
        <p className="mt-2 text-sm text-slate-500">Define your timetable for precise matching.</p>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {reschedule.instructions.map((instruction) => (
            <p key={instruction} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              {instruction}
            </p>
          ))}
        </div>
        <button className="mt-6 w-full rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft" type="button">
          Confirm changes
        </button>
      </aside>
    </div>
  );
};

export default ReschedulePage;
