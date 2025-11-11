import { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import type { ScheduleEvent } from '../../types/portal';
import { toCourseSlug } from '../../utils/courseSlug';

type PortalOutletContext = {
  isSidebarOpen: boolean;
};

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const START_HOUR = 7;
const END_HOUR = 18;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;
const MIN_BLOCK_HEIGHT = (45 / TOTAL_MINUTES) * 100;
const timeStops = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, idx) => START_HOUR + idx);

const eventColorMap: Record<string, { bg: string; text: string }> = {
  busy: { bg: 'bg-rose-200', text: 'text-rose-900' },
  free: { bg: 'bg-emerald-200', text: 'text-emerald-900' },
  default: { bg: 'bg-slate-200', text: 'text-slate-900' },
};

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const formatHourLabel = (hour: number) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const normalized = ((hour + 11) % 12) + 1;
  return `${normalized} ${period}`;
};

const formatRange = (start: string, end: string) => {
  const format = (value: string) => {
    const [hour, minute] = value.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const normalized = ((hour + 11) % 12) + 1;
    return `${normalized}:${minute.toString().padStart(2, '0')} ${period}`;
  };
  return `${format(start)} – ${format(end)}`;
};

const SchedulePage = () => {
  const { portal } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();
  const { isSidebarOpen } = useOutletContext<PortalOutletContext>();
  const schedule = portal?.schedule;
  const registered = portal?.courses;
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  const grouped = schedule?.events.reduce<Record<string, ScheduleEvent[]>>((acc, event) => {
    acc[event.day] = acc[event.day] ? [...acc[event.day], event] : [event];
    return acc;
  }, {}) ?? {};
  const today = dayjs();
  const todayLabel = today.format('dddd, D MMMM YYYY');
  const todayAbbrev = today.format('ddd');
  const todaysEvents = grouped[todayAbbrev] ?? [];
  const monthLabel = today.format('MMMM YYYY');

  if (!schedule) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Schedule data unavailable.</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_1.2fr]">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">Schedule Overview</p>
            <h1 className="text-3xl font-semibold text-ink">{monthLabel}</h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setViewMode('day')}
              className={clsx(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                viewMode === 'day' ? 'bg-primary text-white shadow-soft' : 'border border-slate-200 text-slate-500',
              )}
            >
              Day View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('week')}
              className={clsx(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                viewMode === 'week' ? 'bg-primary text-white shadow-soft' : 'border border-slate-200 text-slate-500',
              )}
            >
              Week View
            </button>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          {viewMode === 'week' ? (
            <>
              <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-4 text-sm font-semibold text-slate-500">
                <div className="text-xs uppercase tracking-widest text-slate-400">Time</div>
                {days.map((day) => (
                  <div key={`label-${day}`} className="text-center">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-4">
                <div className="relative h-[540px]">
                  {timeStops.map((hour, idx) => (
                    <div
                      key={`axis-${hour}`}
                      className="absolute left-0 flex -translate-y-1/2 items-center justify-end pr-3 text-xs font-semibold text-slate-400"
                      style={{ top: `${(idx / (timeStops.length - 1)) * 100}%` }}
                    >
                      {formatHourLabel(hour)}
                    </div>
                  ))}
                </div>
                {days.map((day) => {
                  const dayEvents = grouped[day] ?? [];
                  return (
                    <div key={`column-${day}`} className="relative h-[540px] overflow-hidden rounded-2xl border border-slate-100 bg-white">
                      {timeStops.map((_, idx) =>
                        idx === 0 ? null : (
                          <div
                            key={`grid-${day}-${idx}`}
                            className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                            style={{ top: `${(idx / (timeStops.length - 1)) * 100}%` }}
                          />
                        ),
                      )}
                      {dayEvents.map((event) => {
                        const startMinutes = toMinutes(event.start);
                        const endMinutes = toMinutes(event.end);
                        const clampedStart = Math.max(startMinutes, START_HOUR * 60);
                        const clampedEnd = Math.min(endMinutes, END_HOUR * 60);
                        if (clampedEnd <= clampedStart) {
                          return null;
                        }
                        const top = ((clampedStart - START_HOUR * 60) / TOTAL_MINUTES) * 100;
                        const height = ((clampedEnd - clampedStart) / TOTAL_MINUTES) * 100;
                        const durationMinutes = clampedEnd - clampedStart;
                        const blockHeight = Math.max(height, MIN_BLOCK_HEIGHT);
                        const showTime = durationMinutes > 60;
                        const color = eventColorMap[event.type] ?? eventColorMap.default;
                        return (
                          <div
                            key={event.id}
                            className={`absolute inset-x-0 flex h-auto flex-col gap-0.5 overflow-hidden rounded-2xl p-2 shadow-soft ${color.bg} ${color.text}`}
                            style={{ top: `${top}%`, height: `${blockHeight}%`, marginLeft: '0.35rem', marginRight: '0.35rem' }}
                          >
                            <p
                              className={`truncate font-semibold leading-tight ${isSidebarOpen ? 'text-[9px]' : 'text-[11px]'}`}
                            >
                              {event.title}
                            </p>
                            {showTime && (
                              <p
                                className={`truncate font-medium opacity-80 ${
                                  isSidebarOpen ? 'text-[9px]' : 'text-[10px]'
                                }`}
                              >
                                {formatRange(event.start, event.end)}
                              </p>
                            )}
                            {event.location && (
                              <p
                                className={`truncate opacity-70 ${isSidebarOpen ? 'text-[9px]' : 'text-[10px]'}`}
                              >
                                {event.location}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Today</p>
                  <h2 className="text-2xl font-semibold text-ink">{todayLabel}</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold capitalize text-primary">
                  {todayAbbrev}
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {todaysEvents.length ? (
                  todaysEvents.map((event) => {
                    const color = eventColorMap[event.type] ?? eventColorMap.default;
                    return (
                      <div
                        key={event.id}
                        className={`flex flex-col gap-1 rounded-2xl border border-slate-100 p-4 shadow-soft ${color.bg} ${color.text}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-lg font-semibold">{event.title}</p>
                          <span className="text-xs font-semibold uppercase tracking-widest">{event.day}</span>
                        </div>
                        <p className="text-sm font-medium opacity-80">{formatRange(event.start, event.end)}</p>
                        {event.location && <p className="text-sm opacity-80">{event.location}</p>}
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">You have no sessions scheduled for today.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">Course Registered</p>
            <h2 className="text-2xl font-semibold text-ink">Quick access</h2>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {registered?.courses.length ? (
            registered.courses.map((course) => {
              const slug = toCourseSlug(course.id) ?? course.id;
              return (
                <div key={course.id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-primary">{course.code}</p>
                  <p className="text-lg font-semibold text-ink">{course.title}</p>
                  <button
                    className="mt-3 text-sm font-semibold text-primary"
                    type="button"
                    onClick={() => role && navigate(`/portal/${role}/course-detail/${slug}`)}
                  >
                    View details
                  </button>
                </div>
              );
            })
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              No registered courses available right now.
            </p>
          )}
        </div>
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
          <span className="text-sm font-semibold text-slate-600">Notifications</span>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" defaultChecked />
            <div className="peer h-6 w-12 rounded-full bg-slate-200 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-6" />
          </label>
        </div>
        <button
          className="mt-4 w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft"
          type="button"
          onClick={() => role && navigate(`/portal/${role}/reschedule`)}
        >
          Reschedule
        </button>
      </aside>
    </div>
  );
};

export default SchedulePage;
