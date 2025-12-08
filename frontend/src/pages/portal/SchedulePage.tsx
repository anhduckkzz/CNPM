import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { X, MapPin, Clock3, NotebookPen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { ScheduleEvent } from '../../types/portal';
import { toCourseSlug } from '../../utils/courseSlug';

type PortalOutletContext = {
  isSidebarOpen: boolean;
};

// Helper functions to parse session/quiz dates and times
function parseDateToDay(dateStr: string): string | null {
  // Parse formats like "Friday, Oct 4" or "October 12, 2025 - 08:00 AM"
  const dayMap: Record<string, string> = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
  };
  
  const lowerDate = dateStr.toLowerCase();
  for (const [fullDay, abbr] of Object.entries(dayMap)) {
    if (lowerDate.includes(fullDay)) {
      return abbr;
    }
  }
  
  // For "October 12, 2025" format, parse with dayjs
  const parsed = dayjs(dateStr.split(' - ')[0].trim());
  if (parsed.isValid()) {
    return parsed.format('ddd');
  }
  
  return null;
}

function parseTimeRange(timeStr: string): { start: string; end: string } | null {
  // Parse formats like "7:30 AM - 9:30 AM"
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  
  const [, startHour, startMin, startPeriod, endHour, endMin, endPeriod] = match;
  
  const formatTime = (hour: string, min: string, period: string) => {
    let h = parseInt(hour, 10);
    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${min}`;
  };
  
  return {
    start: formatTime(startHour, startMin, startPeriod),
    end: formatTime(endHour, endMin, endPeriod),
  };
}

function parseQuizTime(dateStr: string): { day: string; start: string; end: string } | null {
  // Parse formats like "October 12, 2025 - 08:00 AM"
  const parts = dateStr.split(' - ');
  if (parts.length !== 2) return null;
  
  const datePart = parts[0].trim();
  const timePart = parts[1].trim();
  
  const parsed = dayjs(datePart);
  if (!parsed.isValid()) return null;
  
  const day = parsed.format('ddd');
  
  // Parse time
  const timeMatch = timePart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!timeMatch) return null;
  
  const [, hour, min, period] = timeMatch;
  let h = parseInt(hour, 10);
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  
  const start = `${h.toString().padStart(2, '0')}:${min}`;
  // Assume quizzes are 2 hours long
  const endH = h + 2;
  const end = `${endH.toString().padStart(2, '0')}:${min}`;
  
  return { day, start, end };
}

// Helper to detect overlapping events and calculate layout
function layoutEvents(events: ScheduleEvent[]) {
  if (events.length === 0) return [];
  
  // Sort events by start time
  const sorted = [...events].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  
  // Group overlapping events
  const columns: ScheduleEvent[][] = [];
  
  sorted.forEach(event => {
    const eventStart = toMinutes(event.start);
    const eventEnd = toMinutes(event.end);
    
    // Find a column where this event doesn't overlap
    let placed = false;
    for (let col of columns) {
      // Check if this event can fit after all events in this column
      const canFit = col.every(colEvent => {
        const colStart = toMinutes(colEvent.start);
        const colEnd = toMinutes(colEvent.end);
        // No overlap if event starts after column event ends, or event ends before column event starts
        return eventEnd <= colStart || eventStart >= colEnd;
      });
      
      if (canFit) {
        col.push(event);
        placed = true;
        break;
      }
    }
    
    // If no suitable column found, create a new one
    if (!placed) {
      columns.push([event]);
    }
  });
  
  // Calculate layout properties for each event
  const layout: Array<{ event: ScheduleEvent; column: number; totalColumns: number }> = [];
  
  sorted.forEach(event => {
    const eventStart = toMinutes(event.start);
    const eventEnd = toMinutes(event.end);
    
    // Find which columns this event overlaps with
    const overlappingColumns = columns.filter(col =>
      col.some(e => {
        const eStart = toMinutes(e.start);
        const eEnd = toMinutes(e.end);
        return !(eventEnd <= eStart || eventStart >= eEnd);
      })
    );
    
    // Find which column contains this event
    const columnIndex = columns.findIndex(col => col.includes(event));
    
    layout.push({
      event,
      column: columnIndex,
      totalColumns: overlappingColumns.length,
    });
  });
  
  return layout;
}

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

const DETAIL_TEMPLATES: EventDetail[] = [
  {
    facilitator: 'Dr. Linh Pham',
    preparation: 'Skim the latest lab brief and note blockers.',
    reminder: 'Update your progress tracker before 9 PM.',
    description: 'Studio-style working block for {TITLE} with live debugging support and breakout coaching.',
    resources: ['Slides for {TITLE}', 'Sample dataset v2', 'Forum thread #office-hours'],
  },
  {
    facilitator: 'Assoc. Prof. Nguyen Tran',
    preparation: 'Review previous quiz feedback and mark unclear concepts.',
    reminder: 'Bring a charged laptop and stylus for annotation.',
    description: 'Small group discussion targeting misconception spotting for {TITLE}.',
    resources: ['Cheat sheet: {TITLE}', 'Discussion prompts', 'Lab sandbox link'],
  },
  {
    facilitator: 'Tutor My Dinh',
    preparation: 'Complete warm-up exercises 3 & 4 before joining.',
    reminder: 'Expect a short poll at the 15-minute mark.',
    description: 'Peer-feedback sprint focused on practical applications of {TITLE}.',
    resources: ['Practice set - {TITLE}', 'Demo recording', 'Q&A board bookmark'],
  },
  {
    facilitator: 'Coach Hoang Vo',
    preparation: 'Post one question to the LMS thread ahead of time.',
    reminder: 'Download the worksheet for annotation.',
    description: 'Interactive retro to plan the next milestone for {TITLE}.',
    resources: ['Worksheet template', 'Milestone timeline', 'Reference article on {TITLE}'],
  },
];

type EventDetail = {
  facilitator: string;
  preparation: string;
  reminder: string;
  description: string;
  resources: string[];
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
  const { portal, updatePortal } = useAuth();
  const navigate = useNavigate();
  const { role } = useParams();
  const { isSidebarOpen } = useOutletContext<PortalOutletContext>();
  const [scheduleScheme, setScheduleScheme] = useState<'none' | 'tight' | 'light'>(
    (portal as any)?.scheduleScheme || 'none'
  );
  const registered = useMemo(() => {
    if (portal?.courses?.courses?.length) {
      return portal.courses;
    }
    if (role === 'tutor' && portal?.courseMatching?.history?.length) {
      return {
        title: 'Courses you tutor',
        description: 'Recently registered courses you are teaching.',
        courses: portal.courseMatching.history.map((course) => ({
          id: course.id,
          title: course.title,
          code: course.code ?? course.id.toUpperCase(),
          thumbnail: course.thumbnail ?? '',
        })),
      };
    }
    return portal?.courses;
  }, [portal?.courses, portal?.courseMatching?.history, role]);
  
  // Generate dynamic events from registered courses
  const dynamicEvents = useMemo(() => {
    const events: ScheduleEvent[] = [];
    
    // Get in-progress courses
    const inProgressCourses = portal?.courses?.courses?.filter(
      (course) => course.status === 'in-progress'
    ) ?? [];
    
    // For each in-progress course, extract sessions and quizzes
    inProgressCourses.forEach((course) => {
      const courseDetails = portal?.courseDetails?.[course.id];
      if (!courseDetails) return;
      
      // Add upcoming sessions
      courseDetails.upcomingSessions?.forEach((session) => {
        const day = parseDateToDay(session.date);
        const timeRange = parseTimeRange(session.time);
        
        if (day && timeRange) {
          events.push({
            id: `session-${session.id}`,
            title: `${course.title}: ${session.title}`,
            day,
            start: timeRange.start,
            end: timeRange.end,
            type: 'busy',
            location: course.format === 'In-person' ? 'Campus' : 'Online',
          });
        }
      });
      
      // Add quizzes
      courseDetails.quizzes?.forEach((quiz) => {
        const parsed = parseQuizTime(quiz.date);
        
        if (parsed) {
          events.push({
            id: `quiz-${quiz.id}`,
            title: `Quiz: ${quiz.title}`,
            day: parsed.day,
            start: parsed.start,
            end: parsed.end,
            type: 'busy',
            location: 'Online',
          });
        }
      });
    });
    
    return events;
  }, [portal?.courses?.courses, portal?.courseDetails]);
  
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const eventDetailMap = useMemo(() => {
    const events = dynamicEvents;
    return events.reduce<Record<string, EventDetail>>((acc, event, index) => {
      const template = DETAIL_TEMPLATES[index % DETAIL_TEMPLATES.length];
      const replaceToken = (text: string) => text.replace(/\{TITLE\}/g, event.title);
      acc[event.id] = {
        facilitator: template.facilitator,
        preparation: template.preparation,
        reminder: template.reminder,
        description: replaceToken(template.description),
        resources: template.resources.map((resource) => replaceToken(resource)),
      };
      return acc;
    }, {});
  }, [dynamicEvents]);
  const activeEvent = useMemo(
    () => (activeEventId ? dynamicEvents.find((evt) => evt.id === activeEventId) : undefined),
    [activeEventId, dynamicEvents],
  );
  const activeDetails = activeEvent ? eventDetailMap[activeEvent.id] : undefined;

  const grouped = dynamicEvents.reduce<Record<string, ScheduleEvent[]>>((acc, event) => {
    acc[event.day] = acc[event.day] ? [...acc[event.day], event] : [event];
    return acc;
  }, {});
  const today = dayjs();
  const todayLabel = today.format('dddd, D MMMM YYYY');
  const todayAbbrev = today.format('ddd');
  const todaysEvents = grouped[todayAbbrev] ?? [];
  const monthLabel = today.format('MMMM YYYY');
  const closeDetailSheet = () => setActiveEventId(null);

  useEffect(() => {
    if (!activeEventId) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activeEventId]);

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
                  const eventLayout = layoutEvents(dayEvents);
                  
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
                      {eventLayout.map(({ event, column, totalColumns }) => {
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
                        const detailAvailable = !!eventDetailMap[event.id];
                        
                        // Calculate width and position based on overlaps
                        const columnWidth = 100 / totalColumns;
                        const leftPosition = column * columnWidth;
                        const padding = 0.5; // Small padding between overlapping events
                        
                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => setActiveEventId(event.id)}
                            className={clsx(
                              'absolute flex h-auto flex-col gap-0.5 overflow-hidden rounded-2xl p-2 text-left shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
                              color.bg,
                              color.text,
                              detailAvailable ? 'cursor-pointer transition hover:translate-y-px hover:shadow-md' : 'cursor-default',
                            )}
                            style={{ 
                              top: `${top}%`, 
                              height: `${blockHeight}%`, 
                              left: `calc(${leftPosition}% + ${padding}%)`,
                              width: `calc(${columnWidth}% - ${padding * 2}%)`,
                            }}
                            aria-label={`View details for ${event.title}`}
                          >
                            <p
                              className={`truncate font-semibold leading-tight ${totalColumns > 2 ? 'text-[8px]' : isSidebarOpen ? 'text-[9px]' : 'text-[11px]'}`}
                            >
                              {event.title}
                            </p>
                            {showTime && (
                              <p
                                className={`truncate font-medium opacity-80 ${totalColumns > 2 ? 'text-[7px]' : isSidebarOpen ? 'text-[9px]' : 'text-[10px]'}`}
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
                          </button>
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
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => setActiveEventId(event.id)}
                        className={clsx(
                          'flex flex-col gap-1 rounded-2xl border border-slate-100 p-4 text-left shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
                          color.bg,
                          color.text,
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-lg font-semibold">{event.title}</p>
                          <span className="text-xs font-semibold uppercase tracking-widest">{event.day}</span>
                        </div>
                        <p className="text-sm font-medium opacity-80">{formatRange(event.start, event.end)}</p>
                        {event.location && <p className="text-sm opacity-80">{event.location}</p>}
                      </button>
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
        
        <div className="mt-4 rounded-2xl border border-slate-100 p-4">
          <label className="block text-sm font-semibold text-slate-600 mb-2">
            Schedule Scheme
          </label>
          <select
            value={scheduleScheme}
            onChange={(e) => {
              const newScheme = e.target.value as 'none' | 'tight' | 'light';
              setScheduleScheme(newScheme);
              if (updatePortal && portal) {
                updatePortal({
                  ...portal,
                  scheduleScheme: newScheme
                } as any);
              }
            }}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="none">None - Any available slot</option>
            <option value="tight">Tight - Compress into fewer days</option>
            <option value="light">Light - Spread across the week</option>
          </select>
          <p className="mt-2 text-xs text-slate-500">
            {scheduleScheme === 'none' && 'Choose any available slot without preference.'}
            {scheduleScheme === 'tight' && 'Pack sessions into fewer distinct weekdays.'}
            {scheduleScheme === 'light' && 'Spread sessions across the week with rest days.'}
          </p>
        </div>
      </aside>

      {activeEvent && activeDetails && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/40 px-4 py-6 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={closeDetailSheet}
        >
          <div
            className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">{activeEvent.day}</p>
                <h3 className="text-2xl font-semibold text-ink">{activeEvent.title}</h3>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-600">
                  <Clock3 className="h-4 w-4" />
                  {formatRange(activeEvent.start, activeEvent.end)}
                </p>
                {activeEvent.location && (
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    {activeEvent.location}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeDetailSheet}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-primary/30 hover:text-primary"
                aria-label="Close schedule detail"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm text-slate-600">{activeDetails.description}</p>

            <dl className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                <NotebookPen className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">Facilitator</dt>
                  <dd className="text-sm text-ink">{activeDetails.facilitator}</dd>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">Preparation</dt>
                <dd className="text-sm text-slate-700">{activeDetails.preparation}</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">Reminder</dt>
                <dd className="text-sm text-slate-700">{activeDetails.reminder}</dd>
              </div>
            </dl>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Resources to review</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {activeDetails.resources.map((resource) => (
                  <li key={resource}>{resource}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;

export const scheduleTestUtils = {
  toMinutes,
  formatRange,
  formatHourLabel,
};
