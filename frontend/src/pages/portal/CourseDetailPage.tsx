import { CalendarDays, Clock3, FileText, FileSpreadsheet, FileVideo, Code, FileText as FileDoc } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseIdFromSlug, toCourseSlug } from '../../utils/courseSlug';
import type { CourseDetailSection } from '../../types/portal';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

const materialIconMap: Record<string, typeof FileText> = {
  pdf: FileDoc,
  slides: FileText,
  sheet: FileSpreadsheet,
  video: FileVideo,
  code: Code,
};

const resolveMaterialUrl = (rawUrl: string | undefined) => {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('http')) return rawUrl;
  try {
    return new URL(rawUrl, BACKEND_BASE_URL).toString();
  } catch {
    const normalizedPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    return `${BACKEND_BASE_URL}${encodeURI(normalizedPath)}`;
  }
};

const CourseDetailPage = () => {
  const { portal, role } = useAuth();
  const navigate = useNavigate();
  const { courseId: courseSlugParam } = useParams();
  const normalizedCourseId = courseIdFromSlug(courseSlugParam);
  const course = normalizedCourseId ? portal?.courseDetails?.[normalizedCourseId] : undefined;
  const resolvedCourseSlug = courseSlugParam ?? toCourseSlug(course?.courseId ?? '') ?? normalizedCourseId ?? course?.courseId ?? '';

  if (!course) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course details not available.</div>;
  }

  const handleAttemptQuiz = (quizId: string) => {
    if (!role) return;
    const slug = courseSlugParam ?? toCourseSlug(course?.courseId) ?? normalizedCourseId;
    if (!slug) return;
    navigate(`/portal/${role}/course-detail/${slug}/quiz/${quizId}`);
  };

  const handleJoinSession = (sessionId: string) => {
    if (!role) return;
    const slug = courseSlugParam ?? toCourseSlug(course?.courseId) ?? normalizedCourseId;
    if (!slug) return;
    navigate(`/portal/${role}/course-detail/${slug}/session/${sessionId}`);
  };

  const handleMaterialClick = (url: string | undefined) => {
    const absoluteUrl = resolveMaterialUrl(url);
    if (!absoluteUrl) return;
    window.open(absoluteUrl, '_blank', 'noopener');
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Course dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{course.title}</h1>
        <p className="mt-2 text-slate-500">Upcoming sessions, materials, and quizzes curated for you.</p>
        {role === 'tutor' && resolvedCourseSlug && (
          <button
            type="button"
            onClick={() => navigate(`/portal/${role}/course-admin/${resolvedCourseSlug}`)}
            className="mt-4 rounded-full border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            Edit course
          </button>
        )}
      </header>

      <section className="space-y-6">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Upcoming sessions</p>
              <h2 className="text-xl font-semibold text-ink">What's next on your calendar</h2>
              <p className="text-sm text-slate-500">Join directly from the list below.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
              {course.upcomingSessions.length} sessions
            </span>
          </div>
          <div className="mt-6 divide-y divide-slate-100">
            {course.upcomingSessions.map((session: CourseDetailSection['upcomingSessions'][number], index: number) => (
              <div key={session.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-ink">{session.title}</p>
                    <p className="text-sm text-slate-500">
                      {session.date} - {session.time}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleJoinSession(session.id)}
                  className="rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  {session.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Course material</p>
              <h2 className="text-xl font-semibold text-ink">Slides, notes, and references</h2>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {course.materials.map((material: CourseDetailSection['materials'][number]) => {
              const type = material.type ?? 'pdf';
              const Icon = materialIconMap[type] ?? FileDoc;

              return (
                <li
                  key={material.title}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-ink cursor-pointer hover:bg-slate-100 transition"
                  onClick={() => handleMaterialClick(material.url)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p>{material.title}</p>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{type}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Upcoming quizzes</p>
              <h2 className="text-xl font-semibold text-ink">Your assessments for the next weeks</h2>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {course.quizzes.map((quiz: CourseDetailSection['quizzes'][number]) => (
              <div
                key={quiz.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-ink">{quiz.title}</p>
                    <p className="text-sm text-slate-500">{quiz.category}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{quiz.date}</p>
                  <button
                    type="button"
                    onClick={() => handleAttemptQuiz(quiz.id)}
                    className="rounded-full border border-primary/30 px-4 py-1 text-sm font-semibold text-primary transition hover:bg-primary/10"
                  >
                    {quiz.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default CourseDetailPage;





