import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Search, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { CourseCard, CourseMatchingSection, RegisteredCourse } from '../../types/portal';
import { toCourseSlug } from '../../utils/courseSlug';
import { useStackedToasts } from '../../hooks/useStackedToasts';
import CourseArtwork from '../../components/CourseArtwork';
import { getCourseCategory, getCourseStatus } from '../../utils/courseMatching';

const FORMAT_CHOICES = ['In-person', 'Blended', 'Online'];
const AI_STEPS = ['Scanning availability & capacity', 'Matching preferred formats', 'Locking the best section'];
const AI_BAR_COUNT = 6;

const CourseMatchingPage = () => {
  const { portal, role, updatePortal } = useAuth();
  const navigate = useNavigate();
  const data = portal?.courseMatching;
  const isStudentView = role === 'student';
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('All Formats');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [modalCourse, setModalCourse] = useState<CourseCard | null>(null);
  const [courseHistory, setCourseHistory] = useState<CourseCard[]>(data?.history ?? []);
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>(portal?.courses?.courses ?? []);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState(0);
  const [aiBarActive, setAiBarActive] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { toasts, showToast } = useStackedToasts(2400);
  const modalTarget = typeof document !== 'undefined' ? document.body : null;

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course matching data unavailable.</div>;
  }

  useEffect(() => {
    setCourseHistory(data?.history ?? []);
    setRegisteredCourses(portal?.courses?.courses ?? []);
  }, [data?.history, portal?.courses?.courses]);

  const parseCapacity = (capacity?: string) => {
    if (!capacity) return null;
    const [current, total] = capacity.split('/').map((value) => Number(value.replace(/\D/g, '')));
    if (!Number.isFinite(current) || !Number.isFinite(total) || total <= 0) return null;
    return { current, total, remaining: Math.max(total - current, 0) };
  };

  const pickBestSlot = (course: CourseCard): CourseMatchingSection['modal']['slots'][number] | null => {
    const slots = data.modal?.slots ?? [];
    if (!slots.length) return null;
    const normalizedCode = course.code?.toLowerCase();
    const normalizedTitle = course.title.toLowerCase();
    const matching = slots.filter((slot) => {
      const section = slot.section.toLowerCase();
      return (normalizedCode && section.includes(normalizedCode)) || section.includes(normalizedTitle);
    });
    const pool = matching.length ? matching : slots;
    return [...pool].sort((a, b) => {
      const aCapacity = parseCapacity(a.capacity);
      const bCapacity = parseCapacity(b.capacity);
      const aRemaining = aCapacity?.remaining ?? -1;
      const bRemaining = bCapacity?.remaining ?? -1;
      if (aRemaining !== bRemaining) return bRemaining - aRemaining;
      const aFormatMatch = a.format && course.format && a.format === course.format ? 1 : 0;
      const bFormatMatch = b.format && course.format && b.format === course.format ? 1 : 0;
      if (aFormatMatch !== bFormatMatch) return bFormatMatch - aFormatMatch;
      return a.section.localeCompare(b.section);
    })[0];
  };

  const formatOptions = useMemo(() => {
    const unique = Array.from(new Set((data.recommended ?? []).map((course) => course.format ?? 'Hybrid')));
    return ['All Formats', ...unique];
  }, [data.recommended]);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set((data.recommended ?? []).map((course) => getCourseCategory(course))));
    return ['All Categories', ...unique];
  }, [data.recommended]);

  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set((data.recommended ?? []).map((course) => getCourseStatus(course).label)));
    return ['All Statuses', ...unique];
  }, [data.recommended]);

  const filteredCourses = useMemo(() => {
    return (data.recommended ?? []).filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFormat = formatFilter === 'All Formats' || course.format === formatFilter;
      const courseCategory = getCourseCategory(course);
      const matchesCategory = categoryFilter === 'All Categories' || courseCategory === categoryFilter;
      const courseStatus = getCourseStatus(course);
      const matchesStatus = statusFilter === 'All Statuses' || courseStatus.label === statusFilter;
      return matchesSearch && matchesFormat && matchesCategory && matchesStatus;
    });
  }, [data.recommended, formatFilter, categoryFilter, statusFilter, searchTerm]);

  const persistCourses = async (nextHistory: CourseCard[], nextRegistered: RegisteredCourse[]) => {
    if (!updatePortal) return;
    await updatePortal((prev) => {
      const nextCourseMatching = prev.courseMatching
        ? { ...prev.courseMatching, history: nextHistory }
        : {
            title: 'Course Matching',
            description: 'Registered and available courses',
            filters: [],
            recommended: [],
            history: nextHistory,
            modal: { focusCourseId: '', slots: [] },
          };
      const nextCourses = prev.courses
        ? { ...prev.courses, courses: nextRegistered }
        : { title: 'Courses', description: 'Your registered classes', courses: nextRegistered };
      return {
        ...prev,
        courseMatching: nextCourseMatching,
        courses: nextCourses,
      };
    });
  };

  const upsertRegistration = async (course: CourseCard, format: string, badge?: string, tutor?: string) => {
    const normalizedHistory = [...courseHistory];
    const idx = normalizedHistory.findIndex((item) => item.id === course.id);
    const historyEntry: CourseCard = {
      ...course,
      actionLabel: isStudentView ? 'Go To Your Course' : 'Manage Your Course',
      tutor: tutor ?? (isStudentView ? 'Assigned soon' : 'You'),
      format,
      badge: badge ?? course.badge,
    };
    if (idx === -1) {
      normalizedHistory.push(historyEntry);
    } else {
      normalizedHistory[idx] = { ...normalizedHistory[idx], ...historyEntry };
    }

    const normalizedRegistered = [...registeredCourses];
    const regIdx = normalizedRegistered.findIndex((item) => item.id === course.id);
    const regEntry: RegisteredCourse = {
      id: course.id,
      title: course.title,
      code: course.code,
      thumbnail: course.thumbnail ?? '',
    };
    if (regIdx === -1) {
      normalizedRegistered.push(regEntry);
    } else {
      normalizedRegistered[regIdx] = regEntry;
    }

    setCourseHistory(normalizedHistory);
    setRegisteredCourses(normalizedRegistered);
    await persistCourses(normalizedHistory, normalizedRegistered);
  };

  const handleRegisterClick = (course: CourseCard) => {
    setModalCourse(course);
  };

  const handleFormatChoice = async (format: string) => {
    if (!modalCourse) return;
    await upsertRegistration(modalCourse, format);
    setModalCourse(null);
    showToast(`Registered ${modalCourse.title} in ${format}`);
  };

  const handleManageCourse = (courseId: string) => {
    if (!role) return;
    const slug = toCourseSlug(courseId) ?? courseId;
    const targetPath =
      role === 'student' ? `/portal/${role}/course-detail/${slug}` : `/portal/${role}/course-admin/${slug}`;
    navigate(targetPath);
  };

  const handleCancelCourse = async (courseId: string) => {
    const confirmDelete = window.confirm('Remove this registration?');
    if (!confirmDelete) return;
    const nextHistory = courseHistory.filter((course) => course.id !== courseId);
    const nextRegistered = registeredCourses.filter((course) => course.id !== courseId);
    setCourseHistory(nextHistory);
    setRegisteredCourses(nextRegistered);
    await persistCourses(nextHistory, nextRegistered);
    showToast('Registration cancelled.');
  };

  const handleEditCourse = async (course: CourseCard) => {
    const currentFormat = course.format ?? 'Hybrid';
    const newFormat = window.prompt('Update format (e.g., In-person, Blended, Online)', currentFormat);
    if (!newFormat) return;
    await upsertRegistration({ ...course, format: newFormat }, newFormat, course.badge, course.tutor);
    showToast('Registration updated.');
  };

  const clearTimers = () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current = [];
  };

  useEffect(() => clearTimers, []);

  const handleAutoMatch = (course: CourseCard | null) => {
    if (!course || !isStudentView) return;
    setAiAnalyzing(true);
    setAiStepIndex(0);
    setAiBarActive(0);
    clearTimers();
    AI_STEPS.slice(1).forEach((_, idx) => {
      const timerStep = setTimeout(() => setAiStepIndex(idx + 1), (idx + 1) * 900);
      timers.current.push(timerStep);
    });
    let barTick = 0;
    const barInterval = setInterval(() => {
      setAiBarActive(() => {
        const next = Math.min(barTick, AI_BAR_COUNT - 1);
        barTick += 1;
        if (next >= AI_BAR_COUNT - 1) {
          clearInterval(barInterval);
        }
        return next;
      });
    }, 380);
    timers.current.push(barInterval as unknown as ReturnType<typeof setTimeout>);
    const finalizeTimer = setTimeout(() => {
      const slot = pickBestSlot(course);
      const normalizedFormat = slot?.format ?? course.format ?? 'Hybrid';
      const capacityLabel = slot?.capacity ?? course.capacity ?? 'TBD';
      const updatedEntry: CourseCard = {
        ...course,
        actionLabel: isStudentView ? 'Go To Your Course' : 'Manage Your Course',
        tutor: slot?.tutor ?? 'AI Assigned',
        format: normalizedFormat,
        capacity: capacityLabel,
        badge: 'AI matched',
      };
      upsertRegistration(updatedEntry, normalizedFormat, 'AI matched', updatedEntry.tutor);
      const sectionLabel = slot?.section ?? `${course.code} - best available section`;
      showToast(`AI matched you to ${sectionLabel}`);
      setAiAnalyzing(false);
      setModalCourse(null);
    }, 2800);
    timers.current.push(finalizeTimer);
  };

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              {isStudentView ? 'Course Registration' : 'Tutor-Student Course Matching'}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">
              {isStudentView ? 'Pick a course and lock your section' : 'Discover and manage tutoring assignments'}
            </h1>
            <p className="mt-3 max-w-3xl text-slate-500">
              {isStudentView
                ? 'Browse openings and confirm your seat. An AI shortcut is available inside the registration flow.'
                : 'Explore open courses that align with your expertise. Register for a teaching format and keep track of the cohorts you\'re already coaching.'}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <label className="relative flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
              <Search className="mr-2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </label>
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 focus:border-primary focus:outline-none"
              value={formatFilter}
              onChange={(event) => setFormatFilter(event.target.value)}
            >
              {formatOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 focus:border-primary focus:outline-none"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 focus:border-primary focus:outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className="space-y-4 rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recommended Courses</p>
            <h2 className="text-xl font-semibold text-ink">
              {isStudentView ? 'Open cohorts you can register for' : 'Open cohorts you can register to tutor'}
            </h2>
          </div>
          <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {filteredCourses.length} courses
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => {
            const courseCategory = getCourseCategory(course);
            const courseStatus = getCourseStatus(course);
            const statusAccent =
              courseStatus.label === 'Open Seats'
                ? 'bg-emerald-100 text-emerald-700'
                : courseStatus.label === 'Limited Seats'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700';
            const capacityLabel = courseStatus.capacity
              ? `${courseStatus.capacity.current}/${courseStatus.capacity.total} seats`
              : course.capacity ?? 'TBD';
            return (
              <article key={course.id} className="flex flex-col rounded-[28px] border border-slate-100 p-5 shadow-soft">
                <CourseArtwork identifier={course.id} title={course.title} code={course.code} />
                <div className="mt-4 space-y-1">
                  <p className="text-lg font-semibold text-ink">{course.title}</p>
                  <p className="text-sm text-slate-500">
                    Course ID: {course.code} | Format: {course.format ?? 'Hybrid'}
                  </p>
                  <p className="text-xs text-slate-400">Capacity: {capacityLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{courseCategory}</span>
                    <span className={`rounded-full px-3 py-1 ${statusAccent}`}>{courseStatus.label}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRegisterClick(course)}
                  className="mt-auto rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-dark"
                >
                  Register Course
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Courses History</p>
            <h2 className="text-xl font-semibold text-ink">Manage the classes you already support</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {courseHistory.length} active
          </span>
        </div>
        {courseHistory.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courseHistory.map((course) => (
              <article key={course.id} className="flex flex-col rounded-[28px] border border-slate-100 p-5 shadow-soft">
                <div className="flex flex-col gap-1">
                  {course.badge && (
                    <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {course.badge}
                    </span>
                  )}
                  <p className="text-lg font-semibold text-ink">{course.title}</p>
                  <p className="text-sm text-slate-500">
                    Format: {course.format ?? 'Hybrid'} | Capacity: {course.capacity ?? 'TBD'}
                  </p>
                  <p className="text-xs text-slate-400">Tutor: {course.tutor ?? (isStudentView ? 'Assigned soon' : 'You')}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleManageCourse(course.id)}
                    className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-dark"
                  >
                    {course.actionLabel ?? (isStudentView ? 'Go To Your Course' : 'Manage Your Course')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelCourse(course.id)}
                    className="rounded-full border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Cancel Course
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditCourse(course)}
                    className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
                  >
                    Edit
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            {isStudentView
              ? 'You have not registered for any courses yet. Use Register or AI Auto-match to secure a section.'
              : 'You haven\'t registered to tutor any courses yet. Once you confirm a teaching format, they will appear here.'}
          </div>
        )}
      </section>

      {modalCourse &&
        modalTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-slate-900/50 p-6">
            <div className="relative w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  clearTimers();
                  setAiAnalyzing(false);
                  setAiStepIndex(0);
                  setAiBarActive(0);
                  setModalCourse(null);
                }}
                className="absolute right-6 top-6 rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
              <CourseArtwork identifier={modalCourse.id} title={modalCourse.title} code={modalCourse.code} size="modal" />
              <div className="mt-6 space-y-1">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{modalCourse.code}</p>
                <h3 className="text-2xl font-semibold text-ink">{modalCourse.title}</h3>
                <p className="text-sm text-slate-500">Capacity {modalCourse.capacity ?? 'TBD'} | Tutor credits: 4</p>
              </div>

              {isStudentView && (
                <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-amber-400/90 to-primary text-white shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_40%)] opacity-70" />
                  <div className="absolute inset-0 animate-[pulse_2.2s_ease-in-out_infinite] bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_35%)]" />
                  <div className="relative space-y-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">AI section match</p>
                        <p className="text-lg font-semibold">Let the AI lock the best section for you</p>
                        <p className="text-sm text-white/85">Capacity, format, and timing are weighted automatically.</p>
                      </div>
                </div>
                <div className="mt-2 flex gap-2">
                  {Array.from({ length: AI_BAR_COUNT }).map((_, idx) => {
                    const filled = aiAnalyzing ? idx <= aiBarActive : false;
                    return (
                      <span
                        key={`bar-${idx}`}
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${filled ? 'bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.25)]' : 'bg-white/25'}`}
                        style={{
                          transform: filled ? 'scaleY(1.25)' : 'scaleY(1)',
                          opacity: filled ? 1 : 0.5,
                        }}
                      />
                    );
                  })}
                </div>
                <div className="grid gap-2 rounded-2xl bg-white/10 p-3 text-sm backdrop-blur">
                  {AI_STEPS.map((step, idx) => {
                    const active = aiStepIndex >= idx && aiAnalyzing;
                    return (
                          <div
                            key={step}
                            className={`flex items-center gap-2 rounded-2xl px-3 py-2 ${
                              active ? 'bg-white/20 text-white' : 'text-white/75'
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full border border-white/40 text-[11px] font-semibold ${
                                active ? 'bg-white text-primary' : 'bg-white/5'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <span className="leading-tight">{step}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAutoMatch(modalCourse)}
                      disabled={aiAnalyzing}
                      className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-primary shadow-lg transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      {aiAnalyzing ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-primary" aria-hidden="true" />
                          AI is matching...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          AI Auto-match to best section
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <p className="mt-8 text-sm font-semibold text-slate-500">Choose your teaching format</p>
              <div className="mt-4 flex flex-wrap gap-4">
                {FORMAT_CHOICES.map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => handleFormatChoice(format)}
                    className="flex-1 rounded-2xl border border-primary/30 px-4 py-3 text-center text-sm font-semibold text-primary transition hover:bg-primary/10"
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          modalTarget,
        )}

      <div aria-live="polite" className="pointer-events-none fixed bottom-6 right-6 z-40 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-semibold">Registration successful</p>
                <p className="text-xs text-emerald-600">{toast.message || 'You are now assigned to this course.'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseMatchingPage;
