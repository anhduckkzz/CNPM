import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Search, Sparkles, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchPortalBundle } from '../../lib/api';
import type { CourseCard, CourseDetailSection, CourseMatchingSection, RegisteredCourse } from '../../types/portal';
import { courseIdFromSlug } from '../../utils/courseSlug';
import { useStackedToasts } from '../../hooks/useStackedToasts';
import CourseArtwork from '../../components/CourseArtwork';
import { getCourseCategory, getCourseStatus } from '../../utils/courseMatching';

const FORMAT_CHOICES = ['In-person', 'Blended', 'Online'];
const AI_STEPS = ['Scanning availability & capacity', 'Matching preferred formats', 'Locking the best section'];
const AI_BAR_COUNT = 6;

// Normalize status to handle both 'in-progress' and 'In progress' formats
const normalizeStatus = (status?: string): string => {
  if (!status) return 'in-progress';
  const lower = status.toLowerCase().trim();
  if (lower === 'in progress' || lower === 'in-progress') return 'in-progress';
  return lower;
};

const CourseMatchingPage = () => {
  const { portal, role, updatePortal } = useAuth();
  const data = portal?.courseMatching;
  const isStudentView = role === 'student';
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('All Formats');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [tagFilter, setTagFilter] = useState('All Tags');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [modalCourse, setModalCourse] = useState<CourseCard | null>(null);
  const [courseHistory, setCourseHistory] = useState<CourseCard[]>(data?.history ?? []);
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>(portal?.courses?.courses ?? []);
  const [allAvailableCourses, setAllAvailableCourses] = useState<CourseCard[]>([]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiStepIndex, setAiStepIndex] = useState(0);
  const [aiBarActive, setAiBarActive] = useState(0);
  const tutorCoursesRef = useRef<Record<string, CourseDetailSection> | null>(null);
  const tutorLoadPromise = useRef<Promise<void> | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { toasts, showToast } = useStackedToasts(2400);
  const modalTarget = typeof document !== 'undefined' ? document.body : null;

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course matching data unavailable.</div>;
  }

  useEffect(() => {
    setCourseHistory(data?.history ?? []);
    // Filter to only show courses with status tags
    const coursesWithStatus = (portal?.courses?.courses ?? []).filter(course => course.status);
    setRegisteredCourses(coursesWithStatus);
  }, [data?.history, portal?.courses?.courses]);

  // Load all available courses from tutor bundle
  useEffect(() => {
    const loadAllCourses = async () => {
      try {
        const bundle = await fetchPortalBundle('tutor');
        const tutorCourses = bundle.courses?.courses ?? [];
        setAllAvailableCourses(tutorCourses as CourseCard[]);
      } catch (error) {
        console.error('Failed to load all courses', error);
      }
    };
    loadAllCourses();
  }, []);

  const availableRecommended = useMemo(() => {
    const registeredIds = new Set(registeredCourses.map((course) => course.id));
    let filtered = (data.recommended ?? []).filter((course) => !registeredIds.has(course.id));
    // For tutors, show only "in-progress" courses
    if (!isStudentView) {
      filtered = filtered.filter((course) => normalizeStatus(course.status) === 'in-progress');
    }
    return filtered;
  }, [data.recommended, registeredCourses, isStudentView]);

  const loadTutorCourses = useCallback(async () => {
    if (tutorCoursesRef.current) return tutorCoursesRef.current;
    if (!tutorLoadPromise.current) {
      tutorLoadPromise.current = fetchPortalBundle('tutor')
        .then((bundle) => {
          tutorCoursesRef.current = bundle.courseDetails ?? {};
        })
        .catch((error) => {
          console.error('Failed to load tutor bundle', error);
          tutorCoursesRef.current = {};
        })
        .finally(() => {
          tutorLoadPromise.current = null;
        });
    }
    if (tutorLoadPromise.current) {
      await tutorLoadPromise.current;
    }
    return tutorCoursesRef.current ?? {};
  }, []);

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
    const unique = Array.from(new Set(availableRecommended.map((course) => course.format ?? 'Hybrid')));
    return ['All Formats', ...unique];
  }, [availableRecommended]);

  const categoryOptions = useMemo(() => {
    const unique = Array.from(new Set(availableRecommended.map((course) => getCourseCategory(course))));
    return ['All Categories', ...unique];
  }, [availableRecommended]);

  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set(availableRecommended.map((course) => getCourseStatus(course).label)));
    return ['All Statuses', ...unique];
  }, [availableRecommended]);

  const tagOptions = useMemo(() => {
    const allTags = new Set<string>();
    availableRecommended.forEach((course) => {
      if (course.tags && Array.isArray(course.tags)) {
        course.tags.forEach((tag) => allTags.add(tag));
      }
    });
    return ['All Tags', ...Array.from(allTags).sort()];
  }, [availableRecommended]);

  const filteredCourses = useMemo(() => {
    return availableRecommended.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFormat = formatFilter === 'All Formats' || course.format === formatFilter;
      const courseCategory = getCourseCategory(course);
      const matchesCategory = categoryFilter === 'All Categories' || courseCategory === categoryFilter;
      const courseStatus = getCourseStatus(course);
      const matchesStatus = statusFilter === 'All Statuses' || courseStatus.label === statusFilter;
      const matchesTag = 
        tagFilter === 'All Tags' || 
        (course.tags && Array.isArray(course.tags) && course.tags.includes(tagFilter));
      return matchesSearch && matchesFormat && matchesCategory && matchesStatus && matchesTag;
    });
  }, [availableRecommended, formatFilter, categoryFilter, statusFilter, tagFilter, searchTerm]);

  const sidebarFilteredCourses = useMemo(() => {
    return allAvailableCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
        course.code.toLowerCase().includes(sidebarSearch.toLowerCase());
      return matchesSearch;
    });
  }, [allAvailableCourses, sidebarSearch]);

  const persistState = async (
    nextHistory: CourseCard[],
    nextRegistered: RegisteredCourse[],
    courseDetailUpserts?: Record<string, CourseDetailSection>,
    courseDetailRemovals?: string[],
  ) => {
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

      const nextCourseDetails = { ...(prev.courseDetails ?? {}) };
      if (courseDetailUpserts) {
        Object.entries(courseDetailUpserts).forEach(([id, detail]) => {
          nextCourseDetails[id] = detail;
        });
      }
      if (courseDetailRemovals?.length) {
        courseDetailRemovals.forEach((id) => {
          delete nextCourseDetails[id];
        });
      }

      return {
        ...prev,
        courseMatching: nextCourseMatching,
        courses: nextCourses,
        courseDetails: nextCourseDetails,
      };
    });
  };

  const syncTutorCourseDetail = useCallback(
    async (courseId: string) => {
      const tutorCourses = await loadTutorCourses();
      const normalizedId = courseIdFromSlug(courseId);
      if (!normalizedId) return undefined;
      return tutorCourses[normalizedId];
    },
    [loadTutorCourses],
  );

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

    const tutorDetail = await syncTutorCourseDetail(course.id);
    const detailPatch = tutorDetail ? { [tutorDetail.courseId]: tutorDetail } : undefined;

    setCourseHistory(normalizedHistory);
    setRegisteredCourses(normalizedRegistered);
    await persistState(normalizedHistory, normalizedRegistered, detailPatch);
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

  const handleManualRegister = async (course: CourseCard | null, slot: CourseMatchingSection['modal']['slots'][number]) => {
    if (!course) return;
    await upsertRegistration(course, slot.format);
    setModalCourse(null);
    showToast(`Registered ${course.title} - ${slot.section}`);
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
    const finalizeTimer = setTimeout(async () => {
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
      await upsertRegistration(updatedEntry, normalizedFormat, 'AI matched', updatedEntry.tutor);
      const sectionLabel = slot?.section ?? `${course.code} - best available section`;
      showToast(`AI matched you to ${sectionLabel}`);
      setAiAnalyzing(false);
      setModalCourse(null);
    }, 2800);
    timers.current.push(finalizeTimer);
  };

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
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
          <div className="grid gap-4 md:grid-cols-5">
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
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 focus:border-primary focus:outline-none"
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
            >
              {tagOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {isStudentView && (
      <section className="space-y-4 rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recommended Courses</p>
            <h2 className="text-xl font-semibold text-ink">
              {isStudentView ? 'Recommended courses that may suit your interests' : 'Recommend course that may suitable with your personal interest'}
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
      )}

      {registeredCourses.length > 0 && (
        <section className="space-y-4 rounded-[32px] bg-white p-8 shadow-soft">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Registration Results</p>
            <h2 className="text-xl font-semibold text-ink">
              {isStudentView ? 'Your Registered Courses' : 'Your Teaching Assignments'}
            </h2>
          </div>
          
          {isStudentView ? (
            // Student View: Show courses grouped by status (excluding cancelled)
            <div className="space-y-6">
              {['In progress', 'Completed'].map((status) => {
                const coursesByStatus = registeredCourses.filter((c) => c.status === status && c.status !== 'Cancelled');
                if (coursesByStatus.length === 0) return null;
                
                const statusConfig = {
                  'In progress': { badge: 'bg-blue-100 text-blue-700', icon: '📚' },
                  'Completed': { badge: 'bg-emerald-100 text-emerald-700', icon: '✅' },
                  'Cancelled': { badge: 'bg-slate-100 text-slate-700', icon: '❌' },
                };
                
                const config = statusConfig[status as keyof typeof statusConfig] || { badge: 'bg-slate-100 text-slate-700', icon: '📋' };
                
                return (
                  <div key={status}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-xl">{config.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-600">{status}</p>
                        <p className="text-xs text-slate-500">{coursesByStatus.length} course{coursesByStatus.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {coursesByStatus.map((course) => (
                        <article key={course.id} className="flex flex-col rounded-[24px] border border-slate-100 p-4 shadow-soft">
                          <CourseArtwork identifier={course.id} title={course.title} code={course.code} />
                          <div className="mt-3 space-y-1">
                            <p className="text-base font-semibold text-ink">{course.title}</p>
                            <p className="text-xs text-slate-500">Course ID: {course.code}</p>
                            <div className="mt-2">
                              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Tutor View: Show all enrolled courses (In progress, Completed, Failed, Cancelled)
            <div className="space-y-6">
              {['In progress', 'Completed', 'Failed', 'Cancelled'].map((status) => {
                const coursesByStatus = registeredCourses.filter((c) => c.status === status);
                if (coursesByStatus.length === 0) return null;
                
                const statusConfig = {
                  'In progress': { badge: 'bg-blue-100 text-blue-700', icon: '🎓', description: 'Currently tutoring' },
                  'Completed': { badge: 'bg-emerald-100 text-emerald-700', icon: '✅', description: 'Completed tutoring' },
                  'Cancelled': { badge: 'bg-slate-100 text-slate-700', icon: '❌', description: 'Tutor cancelled' },
                  'Failed': { badge: 'bg-amber-100 text-amber-700', icon: '⚠️', description: 'No students enrolled' },
                };
                
                const config = statusConfig[status as keyof typeof statusConfig] || { badge: 'bg-slate-100 text-slate-700', icon: '📋', description: 'Unknown' };
                
                return (
                  <div key={status}>
                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-xl">{config.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-600">{status}</p>
                        <p className="text-xs text-slate-500">{config.description} • {coursesByStatus.length} course{coursesByStatus.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {coursesByStatus.map((course) => (
                        <article key={course.id} className="flex flex-col rounded-[24px] border border-slate-100 p-4 shadow-soft">
                          <CourseArtwork identifier={course.id} title={course.title} code={course.code} />
                          <div className="mt-3 space-y-1">
                            <p className="text-base font-semibold text-ink">{course.title}</p>
                            <p className="text-xs text-slate-500">Course ID: {course.code}</p>
                            {course.studentCount && <p className="text-xs text-slate-400">Students: {course.studentCount}</p>}
                            <div className="mt-2">
                              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.badge}`}>
                                {status}
                              </span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Course History Section - Both Student and Tutor Views */}
      {registeredCourses.length > 0 && (
        <section className="space-y-4 rounded-[32px] bg-white p-8 shadow-soft">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Course History</p>
            <h2 className="text-xl font-semibold text-ink">Your Registered Courses</h2>
            <p className="mt-1 text-sm text-slate-500">View all your course registrations and their current status</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-left text-sm font-semibold text-slate-700">Course</th>
                  <th className="pb-4 text-left text-sm font-semibold text-slate-700">Code</th>
                  <th className="pb-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  {!isStudentView && (
                    <>
                      <th className="pb-4 text-left text-sm font-semibold text-slate-700">Time</th>
                      <th className="pb-4 text-left text-sm font-semibold text-slate-700">Students</th>
                    </>
                  )}
                  {!isStudentView && <th className="pb-4 text-left text-sm font-semibold text-slate-700">Registered</th>}
                </tr>
              </thead>
              <tbody>
                {registeredCourses.map((course, index) => {
                  const displayStudentCount = normalizeStatus(course.status) === 'cancelled' ? 0 : (course.studentCount || 0);
                  
                  return (
                    <tr
                      key={course.id}
                      className={`border-b border-slate-50 transition hover:bg-slate-50 ${
                        index === registeredCourses.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="py-4">
                        <p className="font-medium text-ink">{course.title}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-slate-600">{course.code}</p>
                      </td>
                      <td className="py-4">
                        {(() => {
                          const normalized = normalizeStatus(course.status);
                          const statusConfigs = {
                            'in-progress': { label: 'In Progress', class: 'bg-blue-50 text-blue-700' },
                            'completed': { label: 'Completed', class: 'bg-emerald-50 text-emerald-700' },
                            'cancelled': { label: 'Cancelled', class: 'bg-red-50 text-red-700' },
                            'waiting': { label: 'Waiting', class: 'bg-amber-50 text-amber-700' },
                          };
                          const config = statusConfigs[normalized as keyof typeof statusConfigs] || { label: normalized, class: 'bg-slate-50 text-slate-700' };
                          return (
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${config.class}`}>
                              {config.label}
                            </span>
                          );
                        })()}
                      </td>
                      {!isStudentView && (
                        <>
                          <td className="py-4">
                            <p className="text-sm text-slate-600">{(course as any).timeStudy || 'N/A'}</p>
                          </td>
                          <td className="py-4">
                            <p className="text-sm text-slate-600">{displayStudentCount} students</p>
                          </td>
                        </>
                      )}
                      {!isStudentView && (
                        <td className="py-4">
                          <p className="text-sm text-slate-600">{course.registeredDate || 'N/A'}</p>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {modalCourse &&
        modalTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-slate-900/80 p-6">
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[32px] bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-start justify-between bg-white rounded-t-[32px] p-8 pb-0">
                <div />
                <button
                  type="button"
                  onClick={() => {
                    clearTimers();
                    setAiAnalyzing(false);
                    setAiStepIndex(0);
                    setAiBarActive(0);
                    setModalCourse(null);
                  }}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 transition"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-8 pb-8">
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

              {isStudentView && (
                <>
                  <p className="mt-8 text-sm font-semibold text-slate-500">Or manually select a section</p>
                  <div className="mt-4 space-y-3">
                    {(data.modal?.slots ?? []).map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-primary/40 hover:bg-primary/5"
                      >
                        <div className="flex-1 space-y-1">
                          <p className="font-semibold text-ink">{slot.section}</p>
                          <p className="text-sm text-slate-600">{slot.tutor}</p>
                          <p className="text-xs text-slate-500">
                            {slot.format} • {slot.days} • {slot.capacity}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleManualRegister(modalCourse, slot)}
                          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-dark"
                        >
                          {slot.cta || 'Register'}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {!isStudentView && (
                <>
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
                </>
              )}
              </div>
            </div>
          </div>,
          modalTarget,
        )}

      <div aria-live="polite" className="pointer-events-none fixed top-6 left-1/2 -translate-x-1/2 z-40 flex w-full max-w-sm flex-col gap-2">
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

      {/* Right Sidebar - Collapsible Course Search */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'w-80' : 'w-16'}`}>
        {/* Toggle Button */}
        <div className="sticky top-0 z-30 mb-4 flex items-center justify-between rounded-[32px] bg-white p-4 shadow-soft">
          <h2 className={`text-lg font-semibold text-ink transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
            Find Course
          </h2>
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronRight className="h-5 w-5 rotate-180" />}
          </button>
        </div>

        {/* Sidebar Content */}
        {sidebarOpen && (
          <div className="sticky top-20 space-y-4">
            {/* Search Input */}
            <div className="rounded-[28px] bg-white p-4 shadow-soft">
              <label className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500">
                <Search className="mr-2 h-4 w-4 text-slate-400 flex-shrink-0" />
                <input
                  type="search"
                  placeholder="Search courses..."
                  value={sidebarSearch}
                  onChange={(event) => setSidebarSearch(event.target.value)}
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </label>
            </div>

            {/* Course Results */}
            <div className="rounded-[28px] bg-white shadow-soft overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-[0.2em]">
                  Results ({sidebarFilteredCourses.length})
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {sidebarFilteredCourses.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {sidebarFilteredCourses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => setModalCourse(course)}
                        className="w-full px-4 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100"
                      >
                        <p className="font-semibold text-sm text-ink line-clamp-2">{course.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{course.code}</p>
                        {course.capacity && (
                          <p className="text-xs text-slate-400 mt-1">Capacity: {course.capacity}</p>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-slate-500">
                      {sidebarSearch ? 'No courses found' : 'Search to find courses'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Text */}
            <div className="rounded-[28px] bg-blue-50 p-4 border border-blue-100">
              <p className="text-xs text-blue-700">
                Click any course to see details and register. Use the search bar above to find specific courses.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseMatchingPage;
