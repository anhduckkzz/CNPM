import { CalendarDays, Clock, Edit3, FileText, Play, Trash2, UploadCloud } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseIdFromSlug } from '../../utils/courseSlug';

const materialIconMap: Record<string, ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  slides: <FileText className="h-4 w-4" />,
  video: <Play className="h-4 w-4" />,
  sheet: <FileText className="h-4 w-4" />,
  default: <FileText className="h-4 w-4" />,
};

const CourseAdminPage = () => {
  const { portal, role } = useAuth();
  const navigate = useNavigate();
  const { courseId: courseSlugParam } = useParams();
  const normalizedCourseId = courseIdFromSlug(courseSlugParam);
  const course = normalizedCourseId ? portal?.courseDetails?.[normalizedCourseId] : undefined;
  const courseSupport = portal?.courseSupport;

  if (!course || !role) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course admin tools unavailable.</div>;
  }

  const sessions = course.upcomingSessions ?? [];
  const materials = course.materials ?? [];
  const quizzes = course.quizzes ?? [];
  const supportUpload = courseSupport?.upload;
  const supportQuiz = courseSupport?.quiz;
  const supportMeeting = courseSupport?.meeting;

  const coursePrefix = useMemo(() => course.title.split(' ')[0] ?? 'Course', [course.title]);

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Course Admin Panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">{course.title}</h1>
            <p className="mt-2 text-slate-500">Manage sessions, materials, quizzes, and meetings for this cohort.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
            >
              Back
            </button>
            <button
              type="button"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft"
            >
              Publish Update
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Upcoming Sessions</p>
              <h2 className="text-xl font-semibold text-ink">Next {coursePrefix} meetings</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4"
              >
                <div>
                  <p className="font-semibold text-ink">{session.title}</p>
                  <p className="text-sm text-slate-500">
                    {session.date} · {session.time}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  Join session
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Course Support</p>
              <h2 className="text-xl font-semibold text-ink">Material, Quiz & Meeting tools</h2>
            </div>
          </div>
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center">
              <p className="text-sm font-semibold text-ink">{supportUpload?.title ?? 'Upload Course Materials'}</p>
              <p className="mt-2 text-sm text-slate-500">{supportUpload?.description}</p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <UploadCloud className="mx-auto h-10 w-10 text-primary" />
                <p className="mt-3 text-sm text-slate-500">Drag & drop or click to browse</p>
                <p className="text-xs text-slate-400">Max file size {supportUpload?.maxSize ?? '50MB'}</p>
              </div>
              <button className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft">
                Upload material
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 p-5">
              <p className="text-sm font-semibold text-ink">{supportQuiz?.title ?? 'Create New Quiz'}</p>
              <input
                type="text"
                placeholder={supportQuiz?.placeholders.quizTitle ?? 'Quiz title'}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Duration"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Start date"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="End date"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="flex-1 rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary">
                  Add Questions
                </button>
                <button className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft">
                  Save Quiz
                </button>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-100 p-5">
              <p className="text-sm font-semibold text-ink">{supportMeeting?.title ?? 'Schedule Meeting'}</p>
              <input
                type="text"
                placeholder={supportMeeting?.platformHint ?? 'Paste your video link'}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Date"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Time"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <textarea
                placeholder="Description or agenda"
                className="h-24 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <button className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft">
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Course material</p>
              <h2 className="text-xl font-semibold text-ink">Manage slides, notes, and videos</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {materials.map((material) => {
              const icon = materialIconMap[material.type ?? 'default'] ?? materialIconMap.default;
              return (
                <div
                  key={material.title}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-primary">
                      {icon}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{material.title}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{material.type ?? 'PDF'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button type="button" className="rounded-full border border-slate-200 p-2 hover:text-primary">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button type="button" className="rounded-full border border-slate-200 p-2 hover:text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Upcoming quizzes</p>
              <h2 className="text-xl font-semibold text-ink">Track in-progress assessments</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-ink">{quiz.title}</p>
                  <p className="text-sm text-slate-500">{quiz.category}</p>
                </div>
                <div className="flex gap-2 text-slate-400">
                  <button type="button" className="rounded-full border border-slate-200 p-2 hover:text-primary">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button type="button" className="rounded-full border border-slate-200 p-2 hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
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

export default CourseAdminPage;
