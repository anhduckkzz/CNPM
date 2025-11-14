import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { CourseCard } from '../../types/portal';
import { toCourseSlug } from '../../utils/courseSlug';
import { useStackedToasts } from '../../hooks/useStackedToasts';
import CourseArtwork from '../../components/CourseArtwork';

const FORMAT_CHOICES = ['In-person', 'Blended', 'Online'];
const CATEGORY_RULES = [
  { match: /calculus|math|algebra|statistics|probability/i, label: 'Mathematics' },
  { match: /programming|systems|data|software|algorithm|computer/i, label: 'Computer Science' },
  { match: /physics|engineering/i, label: 'Engineering' },
  { match: /design|creative|communication/i, label: 'Creative Practice' },
  { match: /business|economics|finance/i, label: 'Business & Management' },
];

const getCourseCategory = (course: CourseCard) => {
  const haystack = `${course.title} ${course.code}`.toLowerCase();
  const rule = CATEGORY_RULES.find((entry) => entry.match.test(haystack));
  return rule?.label ?? 'Interdisciplinary';
};

const getCourseStatus = (course: CourseCard) => {
  if (!course.capacity) return { label: 'Open Seats', capacity: null };
  const [current, total] = course.capacity.split('/').map((value) => Number(value.replace(/\D/g, '')));
  if (!Number.isFinite(current) || !Number.isFinite(total) || total === 0) {
    return { label: 'Open Seats', capacity: null };
  }
  const ratio = current / total;
  if (ratio <= 0.6) return { label: 'Open Seats', capacity: { current, total } };
  if (ratio <= 0.85) return { label: 'Limited Seats', capacity: { current, total } };
  return { label: 'Waitlist Risk', capacity: { current, total } };
};

const CourseMatchingPage = () => {
  const { portal, role } = useAuth();
  const navigate = useNavigate();
  const data = portal?.courseMatching;
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('All Formats');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [modalCourse, setModalCourse] = useState<CourseCard | null>(null);
  const [courseHistory, setCourseHistory] = useState<CourseCard[]>(data?.history ?? []);
  const { toasts, showToast } = useStackedToasts(2400);
  const modalTarget = typeof document !== 'undefined' ? document.body : null;

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course matching data unavailable.</div>;
  }

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

  const handleRegisterClick = (course: CourseCard) => {
    setModalCourse(course);
  };

  const handleFormatChoice = (format: string) => {
    if (!modalCourse) return;
    const alreadyRegistered = courseHistory.some((entry) => entry.id === modalCourse.id);
    if (!alreadyRegistered) {
      setCourseHistory((prev) => [
        ...prev,
        { ...modalCourse, actionLabel: 'Manage Your Course', tutor: 'You', format },
      ]);
    }
    setModalCourse(null);
    showToast(`Registered ${modalCourse.title} in ${format}`);
  };

  const handleManageCourse = (courseId: string) => {
    if (!role) return;
    const slug = toCourseSlug(courseId) ?? courseId;
    navigate(`/portal/${role}/course-admin/${slug}`);
  };

  const handleCancelCourse = (courseId: string) => {
    setCourseHistory((prev) => prev.filter((course) => course.id !== courseId));
  };

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Tutor-Student Course Matching</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Discover and manage tutoring assignments</h1>
            <p className="mt-3 max-w-3xl text-slate-500">
              Explore open courses that align with your expertise. Register for a teaching format and keep track of the
              cohorts you&apos;re already coaching.
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
            <h2 className="text-xl font-semibold text-ink">Open cohorts you can register to tutor</h2>
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
                    Course ID: {course.code} • Format: {course.format ?? 'Hybrid'}
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
                  <p className="text-lg font-semibold text-ink">{course.title}</p>
                  <p className="text-sm text-slate-500">
                    Format: {course.format ?? 'Hybrid'} • Capacity: {course.capacity ?? 'TBD'}
                  </p>
                  <p className="text-xs text-slate-400">Tutor: You</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleManageCourse(course.id)}
                    className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-dark"
                  >
                    Manage Your Course
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancelCourse(course.id)}
                    className="rounded-full border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                  >
                    Cancel Course
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            You haven&apos;t registered to tutor any courses yet. Once you confirm a teaching format, they will appear here.
          </div>
        )}
      </section>

      {modalCourse &&
        modalTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-slate-900/50 p-6">
            <div className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
              <button
                type="button"
                onClick={() => setModalCourse(null)}
                className="absolute right-6 top-6 rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
              <CourseArtwork identifier={modalCourse.id} title={modalCourse.title} code={modalCourse.code} size="modal" />
              <div className="mt-6 space-y-1">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{modalCourse.code}</p>
                <h3 className="text-2xl font-semibold text-ink">{modalCourse.title}</h3>
                <p className="text-sm text-slate-500">Capacity {modalCourse.capacity ?? 'TBD'} • Tutor credits: 4</p>
              </div>
              <p className="mt-6 text-sm font-semibold text-slate-500">Choose your teaching format</p>
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
