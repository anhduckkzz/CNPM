import { useAuth } from '../../context/AuthContext';
import type { ScheduleEvent } from '../../types/portal';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SchedulePage = () => {
  const { portal } = useAuth();
  const schedule = portal?.schedule;

  const grouped = schedule?.events.reduce<Record<string, ScheduleEvent[]>>((acc, event) => {
    acc[event.day] = acc[event.day] ? [...acc[event.day], event] : [event];
    return acc;
  }, {}) ?? {};

  if (!schedule) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Schedule data unavailable.</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_1.2fr]">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">Schedule Overview</p>
            <h1 className="text-3xl font-semibold text-ink">{schedule.month}</h1>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500" type="button">
              Day View
            </button>
            <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white" type="button">
              Week View
            </button>
            <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500" type="button">
              + Add New Session
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-7">
          {days.map((day) => (
            <div key={day} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">{day}</p>
              <div className="mt-3 space-y-3">
                {grouped[day]?.map((event) => (
                  <div
                    key={event.id}
                    className={`rounded-2xl p-3 text-sm font-semibold text-white ${
                      event.type === 'busy' ? 'bg-primary' : 'bg-slate-400'
                    }`}
                  >
                    <p>{event.title}</p>
                    <p className="text-xs text-white/80">
                      {event.start} - {event.end}
                    </p>
                  </div>
                )) ?? <p className="text-xs text-slate-400">Open Time</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">Upcoming Sessions</p>
            <h2 className="text-2xl font-semibold text-ink">Stay organized</h2>
          </div>
          <button className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white" type="button">
            Reschedule
          </button>
        </div>
        <div className="mt-6 space-y-4">
          {schedule.upcoming.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs font-semibold text-primary">{item.date}</p>
              <p className="text-lg font-semibold text-ink">{item.title}</p>
              <p className="text-sm text-slate-500">{item.time}</p>
              <button className="mt-2 text-sm font-semibold text-primary" type="button">
                {item.cta}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
          <span className="text-sm font-semibold text-slate-600">Notifications</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" defaultChecked />
            <div className="peer h-6 w-12 rounded-full bg-slate-200 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-6" />
          </label>
        </div>
      </aside>
    </div>
  );
};

export default SchedulePage;
