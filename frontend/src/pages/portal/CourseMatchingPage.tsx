import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { CourseMatchingSection, RegisteredCoursesSection, ScheduleSection, CourseCard } from '../../types/portal';
import { toCourseSlug } from '../../utils/courseSlug';

type SlotOption = CourseMatchingSection['modal']['slots'][number];
type ScheduleEvent = ScheduleSection['events'][number];

const DEFAULT_COURSE_MATCHING_SECTION: CourseMatchingSection = {
  title: '',
  description: '',
  filters: [],
  recommended: [],
  history: [],
  modal: {
    focusCourseId: '',
    slots: [],
  },
};

const DEFAULT_REGISTERED_COURSES_SECTION: RegisteredCoursesSection = {
  title: '',
  description: '',
  courses: [],
};

const DEFAULT_SCHEDULE_SECTION: ScheduleSection = {
  month: '',
  events: [],
  upcoming: [],
};

const dayLabelMap: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

const parseSlotDays = (label: string) => {
  const matches = label.match(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/gi) ?? [];
  return matches.map((entry) => dayLabelMap[entry.toLowerCase()] ?? entry.slice(0, 3));
};

const parseSlotWindow = (label: string) => {
  const match = label.match(/(\d{1,2})h\s*-\s*(\d{1,2})h/i);
  if (!match) return null;
  const start = parseInt(match[1], 10) * 60;
  const end = parseInt(match[2], 10) * 60;
  return { start, end };
};

const parseEventMinutes = (timeValue: string) => {
  const [hour = '0', minute = '0'] = timeValue.split(':');
  return parseInt(hour, 10) * 60 + parseInt(minute, 10);
};

const rangesOverlap = (startA: number, endA: number, startB: number, endB: number) =>
  Math.max(startA, startB) < Math.min(endA, endB);

const capacityFillRatio = (capacity: string) => {
  const match = capacity.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return 1;
  const current = parseInt(match[1], 10);
  const total = parseInt(match[2], 10) || 1;
  return current / total;
};

const scoreSlot = (slot: SlotOption, events: ScheduleEvent[]) => {
  const days = parseSlotDays(slot.days);
  const window = parseSlotWindow(slot.days);
  const conflictPenalty = days.reduce((penalty, day) => {
    const dayEvents = events.filter((event) => event.day.toLowerCase().startsWith(day.toLowerCase()));
    if (!window) {
      return penalty + dayEvents.length;
    }
    return (
      penalty +
      dayEvents.reduce((count, event) => {
        const start = parseEventMinutes(event.start);
        const end = parseEventMinutes(event.end);
        return count + (rangesOverlap(window.start, window.end, start, end) ? 1 : 0);
      }, 0)
    );
  }, 0);
  return conflictPenalty * 10 + capacityFillRatio(slot.capacity);
};

const pickBestSlot = (slotOptions: SlotOption[], events: ScheduleEvent[]) => {
  if (!slotOptions.length) return null;
  return slotOptions.slice().sort((a, b) => scoreSlot(a, events) - scoreSlot(b, events))[0];
};

interface AutoMatchState {
  active: boolean;
  running: boolean;
  progress: number;
  stage: string;
  result: SlotOption | null;
  error: string | null;
}

const CourseMatchingPage = () => {
  const { portal, updatePortal, role } = useAuth();
  const navigate = useNavigate();
  const data = portal?.courseMatching;
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoMatchState, setAutoMatchState] = useState<AutoMatchState>({
    active: false,
    running: false,
    progress: 0,
    stage: '',
    result: null,
    error: null,
  });
  const autoMatchTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoMatchSelectionRef = useRef<SlotOption | null>(null);

  interface CancelFormState {
    open: boolean;
    courseId: string;
    courseTitle: string;
    fullName: string;
    studentId: string;
    contact: string;
    reason: string;
    details: string;
  }

  const [cancelForm, setCancelForm] = useState<CancelFormState>({
    open: false,
    courseId: '',
    courseTitle: '',
    fullName: portal?.user?.name ?? '',
    studentId: portal?.user?.id ?? '',
    contact: portal?.user?.email ?? '',
    reason: '',
    details: '',
  });
  const scheduleEvents = useMemo(() => portal?.schedule?.events ?? [], [portal?.schedule?.events]);
  const stageThresholds = useMemo(
    () => [
      { threshold: 25, label: 'Scanning weekly availability for conflicts...' },
      { threshold: 55, label: 'Matching open windows with tutor sections...' },
      { threshold: 85, label: 'Checking seat availability and travel buffers...' },
      { threshold: 100, label: 'Locking in the best section for your week...' },
    ],
    [],
  );
  const getStageLabel = useCallback(
    (value: number) =>
      stageThresholds.find((stage) => value <= stage.threshold)?.label ??
      stageThresholds[stageThresholds.length - 1].label,
    [stageThresholds],
  );
  const stopAutoMatchTimer = useCallback(() => {
    if (autoMatchTimer.current) {
      clearInterval(autoMatchTimer.current);
      autoMatchTimer.current = null;
    }
  }, []);
  const resetAutoMatch = useCallback(() => {
    stopAutoMatchTimer();
    autoMatchSelectionRef.current = null;
    setAutoMatchState({
      active: false,
      running: false,
      progress: 0,
      stage: '',
      result: null,
      error: null,
    });
  }, [stopAutoMatchTimer]);

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course matching data unavailable.</div>;
  }

  const modalCourse: CourseCard | undefined = useMemo(() => {
    const recommendedCourse = data.recommended.find((course) => course.id === activeCourseId);
    if (recommendedCourse) return recommendedCourse;

    const registeredCourse = portal?.courses?.courses.find((course) => course.id === activeCourseId);
    if (registeredCourse) {
      // Convert RegisteredCourse to CourseCard by providing default values for missing properties
      return {
        ...registeredCourse,
        tutor: 'N/A',
        format: 'N/A',
        capacity: 'N/A',
        badge: 'Registered',
        actionLabel: 'Go To Your Course',
        accent: '#FFD7E2',
      };
    }
    return undefined;
  }, [activeCourseId, data.recommended, portal?.courses?.courses]);
  const showModal = isModalOpen && modalCourse;
  const slots = data.modal.slots;
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  useEffect(() => {
    if (!showModal) {
      resetAutoMatch();
    }
  }, [resetAutoMatch, showModal]);

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message });
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
      stopAutoMatchTimer();
    };
  }, [stopAutoMatchTimer]);

  useEffect(() => {
    setCancelForm((prev) => ({
      ...prev,
      fullName: portal?.user?.name ?? '',
      studentId: portal?.user?.id ?? '',
      contact: portal?.user?.email ?? '',
    }));
  }, [portal?.user?.name, portal?.user?.id, portal?.user?.email]);

  const openModal = (courseId: string) => {
    setActiveCourseId(courseId);
    setModalOpen(true);
  };

  const closeModal = () => {
    resetAutoMatch();
    setModalOpen(false);
    setActiveCourseId(null);
  };

  const openCancelForm = (courseId: string, courseTitle: string) => {
    setCancelForm((prev) => ({
      ...prev,
      open: true,
      courseId,
      courseTitle,
      reason: '',
      details: '',
    }));
  };

  const closeCancelForm = () => {
    setCancelForm((prev) => ({
      ...prev,
      open: false,
      reason: '',
      details: '',
    }));
  };

  const handleCancelInput =
    (field: 'fullName' | 'studentId' | 'contact' | 'reason' | 'details') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setCancelForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleCancelSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showToast(`Cancellation submitted for ${cancelForm.courseTitle || 'selected course'}.`);
  
    if (!portal || !data) return;

    const courseToCancel =
      data.recommended.find((course) => course.id === cancelForm.courseId) ??
      data.history.find((course) => course.id === cancelForm.courseId);

    if (!courseToCancel) return;

    const currentCourseMatching = portal.courseMatching || DEFAULT_COURSE_MATCHING_SECTION;
    const currentCourses = portal.courses || DEFAULT_REGISTERED_COURSES_SECTION;
    const currentSchedule = portal.schedule || DEFAULT_SCHEDULE_SECTION;

    const updatedRecommended = [...currentCourseMatching.recommended, { ...courseToCancel, actionLabel: 'Register Course' }];

    const updatedCourses = currentCourses.courses.filter(
      (course) => course.id !== cancelForm.courseId
    );

    const updatedScheduleEvents = currentSchedule.events.filter(
      (event) => !event.id.startsWith(cancelForm.courseId)
    );

    updatePortal({
      ...portal,
      courseMatching: {
        ...currentCourseMatching,
        recommended: updatedRecommended,
      },
      courses: {
        ...currentCourses,
        courses: updatedCourses,
      },
      schedule: {
        ...currentSchedule,
        events: updatedScheduleEvents,
      },
    });

    closeCancelForm();
  };

  const handleRegisterSlot = useCallback(
    (slot: SlotOption, modalCourse: CourseMatchingSection['recommended'][number]) => {
      if (!portal) return;

      const currentCourseMatching = portal.courseMatching || DEFAULT_COURSE_MATCHING_SECTION;
      const currentCourses = portal.courses || DEFAULT_REGISTERED_COURSES_SECTION;
      const currentSchedule = portal.schedule || DEFAULT_SCHEDULE_SECTION;

      // Prevent duplicate registration
      if (currentCourses.courses.some(course => course.id === modalCourse.id)) {
        showToast(`Error: You are already registered for ${modalCourse.title}.`);
        closeModal();
        return;
      }

      const newCourse = {
        id: modalCourse.id,
        title: modalCourse.title,
        code: modalCourse.code,
        format: slot.format,
        capacity: slot.capacity,
        tutor: slot.tutor,
        thumbnail: modalCourse.thumbnail,
        badge: 'In progress',
        accent: '#FFD7E2', // This might need to be dynamic or removed
        actionLabel: 'Go To Your Course',
      };

      const timeMatch = slot.days.match(/(\d{1,2})h-(\d{1,2})h/);
      let startTime = '00:00';
      let endTime = '00:00';
      if (timeMatch) {
        startTime = `${timeMatch[1].padStart(2, '0')}:00`;
        endTime = `${timeMatch[2].padStart(2, '0')}:00`;
      }

      const newScheduleEvent: ScheduleEvent = {
        id: `${modalCourse.id}-${slot.id}`,
        title: `${modalCourse.title} (${slot.section})`,
        day: slot.days.split(' ')[0].substring(0, 3), // Extract day from "Monday (7h-9h)" to "Mon"
        start: startTime,
        end: endTime,
        type: 'busy',
      };

      const updatedRecommended = currentCourseMatching.recommended.filter(
        (course) => course.id !== modalCourse.id
      );

      const updatedCourses = [...currentCourses.courses];
      if (!updatedCourses.some(course => course.id === newCourse.id)) {
        updatedCourses.push({
          id: newCourse.id,
          title: newCourse.title,
          code: newCourse.code,
          thumbnail: newCourse.thumbnail,
        });
      }

      const updatedScheduleEvents = [...currentSchedule.events, newScheduleEvent];

      updatePortal({
        ...portal,
        courseMatching: {
          ...currentCourseMatching,
          recommended: updatedRecommended,
        },
        courses: {
          ...currentCourses,
          courses: updatedCourses,
        },
        schedule: {
          ...currentSchedule,
          events: updatedScheduleEvents,
        },
      });

      showToast(`Successfully registered for ${slot.section}.`);
      closeModal();
    },
    [portal, modalCourse, showToast, updatePortal, closeModal],
  );

  const startAutoMatch = useCallback(() => {
    if (!modalCourse) {
      return;
    }
    if (!slots.length) {
      setAutoMatchState({
        active: true,
        running: false,
        progress: 0,
        stage: 'Unable to find any open sections right now.',
        result: null,
        error: 'No sections are currently available for automatching.',
      });
      return;
    }
    const bestSlot = pickBestSlot(slots, scheduleEvents);
    if (!bestSlot) {
      setAutoMatchState({
        active: true,
        running: false,
        progress: 0,
        stage: 'Unable to find a compatible section.',
        result: null,
        error: 'Every section conflicts with your current schedule.',
      });
      return;
    }
    autoMatchSelectionRef.current = bestSlot;
    setAutoMatchState({
      active: true,
      running: true,
      progress: 5,
      stage: getStageLabel(5),
      result: null,
      error: null,
    });
    stopAutoMatchTimer();
    autoMatchTimer.current = setInterval(() => {
      setAutoMatchState((prev) => {
        if (!prev.running) {
          return prev;
        }
        const nextProgress = Math.min(100, prev.progress + Math.random() * 18);
        const nextStage = getStageLabel(nextProgress);
        if (nextProgress >= 100) {
          stopAutoMatchTimer();
          const chosenSlot = autoMatchSelectionRef.current;
          if (chosenSlot && modalCourse) {
            handleRegisterSlot(chosenSlot, modalCourse);
          }
          return {
            ...prev,
            running: false,
            progress: 100,
            stage: 'Section assigned based on your availability.',
            result: chosenSlot ?? null,
            error: chosenSlot ? null : 'No compatible section found.',
          };
        }
        return { ...prev, progress: nextProgress, stage: nextStage };
      });
    }, 450);
  }, [getStageLabel, handleRegisterSlot, modalCourse, scheduleEvents, slots, stopAutoMatchTimer]);

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink">{data.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-500">{data.description}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Search for courses…" />
          {data.filters.map((filter) => (
            <select key={filter} className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-500">
              <option>{filter}</option>
            </select>
          ))}
        </div>
      </header>

      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">Recommended Courses</h2>
          <span className="text-sm text-slate-500">Explore courses you can register for</span>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {data.recommended.map((course) => (
            <div key={course.id} className="rounded-[28px] border border-slate-100 p-5 shadow-soft">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-40 w-full rounded-2xl object-cover"
              />
              <div className="mt-4 space-y-1 text-sm text-slate-500">
                <p className="text-lg font-semibold text-ink">{course.title}</p>
                <p>Course ID: {course.code}</p>
                <p>Format: {course.format}</p>
                <p>Capacity: {course.capacity}</p>
              </div>
              <button
                type="button"
                onClick={() => openModal(course.id)}
                className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-soft"
              >
                {course.actionLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-ink">Courses History</h2>
          <span className="text-sm text-slate-500">View and manage courses you are attending</span>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {(portal?.courses?.courses || []).map((course) => (
            <div key={course.id} className="flex flex-col rounded-[28px] border border-slate-100 p-5 shadow-soft">
              <img src={course.thumbnail} alt={course.title} className="h-32 w-full rounded-2xl object-cover" />
              <div className="mt-4 flex-1">
                <p className="text-lg font-semibold text-ink">{course.title}</p>
                <p className="text-sm text-slate-500">Course ID: {course.code}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  className="rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-soft"
                  type="button"
                  onClick={() => {
                    if (!role) return;
                    const slug = toCourseSlug(course.id) ?? course.id;
                    navigate(`/portal/${role}/course-detail/${slug}`);
                  }}
                >
                  Access Course
                </button>
                <button
                  className="rounded-2xl border border-red-200 px-4 py-3 font-semibold text-red-500"
                  type="button"
                  onClick={() => openCancelForm(course.id, course.title)}
                >
                  Cancel Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showModal &&
        portalTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex min-h-screen w-screen items-center justify-center bg-slate-900/40 px-4 py-8">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
              <div className="flex items-start gap-4 border-b border-slate-100 p-6">
                <img src={modalCourse.thumbnail} alt={modalCourse.title} className="h-24 w-32 rounded-2xl object-cover" />
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Course ID: {modalCourse.code}</p>
                  <h3 className="text-2xl font-semibold text-ink">{modalCourse.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Credits: 4 <span className="mx-2 text-slate-300">|</span> Prerequisite: None
                  </p>
                <button
                  type="button"
                  onClick={startAutoMatch}
                  disabled={autoMatchState.running}
                  className={`mt-3 w-full rounded-full px-6 py-2 text-sm font-semibold text-white transition ${
                    autoMatchState.running ? 'cursor-wait bg-primary/50' : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  {autoMatchState.running ? 'Scanning…' : 'Automatching'}
                </button>
              </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-6 pb-6">
                <div className="space-y-4">
                  {slots.map((slot) => (
                    <div key={slot.id} className="rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-600">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-semibold text-ink">{slot.section}</p>
                        <p className="text-sm text-slate-400">Tutor: {slot.tutor}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-1">Format: {slot.format}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">Capacity: {slot.capacity}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">{slot.days}</span>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
                          onClick={() => handleRegisterSlot(slot, modalCourse)}
                        >
                          {slot.cta}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {autoMatchState.active && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[32px] bg-slate-950/80 p-6 text-white backdrop-blur">
                <div className="relative w-full max-w-xl space-y-5 rounded-[28px] border border-primary/40 bg-slate-900/70 p-6 shadow-2xl">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-primary/60">
                    <span>
                      {autoMatchState.running
                        ? 'AI automatching in progress'
                        : autoMatchState.error
                          ? 'Automatching blocked'
                          : 'Match assigned'}
                    </span>
                    <span>{autoMatchState.running ? `${Math.round(autoMatchState.progress)}%` : 'Done'}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/60 via-emerald-400 to-primary/80 transition-all duration-300"
                      style={{ width: `${autoMatchState.running ? autoMatchState.progress : 100}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-100">
                    {autoMatchState.stage || 'Initializing automatching sequence...'}
                  </p>
                  {autoMatchState.running && (
                    <div className="ai-scan-grid relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="ai-scan-beam" />
                      <p className="relative text-xs uppercase tracking-[0.3em] text-white/70">Scanning schedule blocks</p>
                      <div className="relative mt-3 flex flex-wrap gap-2 text-xs text-white/80">
                        {scheduleEvents.slice(0, 3).map((event) => (
                          <span key={event.id} className="rounded-full border border-white/30 px-3 py-1">
                            {event.day} {event.start}-{event.end}
                          </span>
                        ))}
                        {!scheduleEvents.length && (
                          <span className="rounded-full border border-white/30 px-3 py-1">No conflicts detected</span>
                        )}
                      </div>
                    </div>
                  )}
                  {!autoMatchState.running && autoMatchState.result && !autoMatchState.error && (
                    <div className="space-y-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-left text-emerald-50">
                      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">Assigned section</p>
                      <h4 className="text-lg font-semibold text-white">{autoMatchState.result.section}</h4>
                      <p className="text-sm text-emerald-100">Tutor: {autoMatchState.result.tutor}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-emerald-100">
                        <span className="rounded-full border border-emerald-200/40 px-3 py-1">{autoMatchState.result.days}</span>
                        <span className="rounded-full border border-emerald-200/40 px-3 py-1">
                          Capacity {autoMatchState.result.capacity}
                        </span>
                        <span className="rounded-full border border-emerald-200/40 px-3 py-1">{autoMatchState.result.format}</span>
                      </div>
                      <p className="mt-2 text-xs text-emerald-200">
                        Slot locked automatically. You can rescan or switch sections anytime.
                      </p>
                    </div>
                  )}
                  {autoMatchState.error && (
                    <div className="rounded-2xl border border-rose-400/50 bg-rose-500/20 p-4 text-left text-rose-100">
                      {autoMatchState.error}
                    </div>
                  )}
                  <div className="flex flex-wrap justify-end gap-3 text-sm">
                    {autoMatchState.running ? (
                      <button
                        type="button"
                        className="rounded-full border border-white/30 px-4 py-2 text-white transition hover:bg-white/10"
                        onClick={resetAutoMatch}
                      >
                        Cancel scan
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="rounded-full border border-white/30 px-4 py-2 text-white transition hover:bg-white/10"
                          onClick={resetAutoMatch}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-primary px-4 py-2 font-semibold text-white shadow-soft transition hover:bg-primary-dark"
                          onClick={startAutoMatch}
                        >
                          Scan again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>,
          portalTarget,
        )}
      {cancelForm.open &&
        portalTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex min-h-screen w-screen items-center justify-center bg-slate-900/40 px-4 py-8">
            <form
              className="w-full max-w-2xl space-y-4 rounded-[28px] bg-white p-6 shadow-2xl"
              onSubmit={handleCancelSubmit}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cancellation form</p>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">Cancel {cancelForm.courseTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Tell us why you are dropping this course so we can improve future planning.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  onClick={closeCancelForm}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-600">
                  Full name
                  <input
                    required
                    type="text"
                    value={cancelForm.fullName}
                    onChange={handleCancelInput('fullName')}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-600">
                  Student ID
                  <input
                    required
                    type="text"
                    value={cancelForm.studentId}
                    onChange={handleCancelInput('studentId')}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-600">
                  HCMUT email
                  <input
                    required
                    type="email"
                    value={cancelForm.contact}
                    onChange={handleCancelInput('contact')}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-600">
                  Reason for cancellation
                  <input
                    required
                    type="text"
                    placeholder="e.g., schedule conflict, module switch..."
                    value={cancelForm.reason}
                    onChange={handleCancelInput('reason')}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <label className="text-sm font-semibold text-slate-600">
                Additional context
                <textarea
                  required
                  rows={4}
                  value={cancelForm.details}
                  onChange={handleCancelInput('details')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
                  placeholder="Share any notes for the academic advisor..."
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCancelForm}
                  className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Keep course
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-soft"
                >
                  Submit cancellation
                </button>
              </div>
            </form>
          </div>,
          portalTarget,
        )}
      <div
        className={`pointer-events-none fixed left-6 top-6 z-[60] w-full max-w-xs transform rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm shadow-lg transition-all duration-300 ${
          toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        }`}
      >
        <div className="pointer-events-auto flex items-start gap-3 text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Success</p>
            <p className="text-xs text-emerald-800/80">{toast.message || 'Your action has been recorded.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMatchingPage;
