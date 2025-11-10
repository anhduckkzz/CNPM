import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CourseDetailPage = () => {
  const { portal, role } = useAuth();
  const { courseId } = useParams();
  const course = courseId ? portal?.courseDetails?.[courseId] : undefined;

  if (!course) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course details not available.</div>;
  }

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">{course.title}</h1>
        <p className="mt-2 text-slate-500">Track materials, sessions, and quizzes for the upcoming days.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">Upcoming Sessions</h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {course.upcomingSessions.length} sessions
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {course.upcomingSessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <div>
                  <p className="font-semibold text-ink">{session.title}</p>
                  <p className="text-sm text-slate-500">
                    {session.date} -+ {session.time}
                  </p>
                </div>
                <button className="text-sm font-semibold text-primary" type="button">
                  {session.cta}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-ink">Course Material</h2>
          <ul className="mt-4 space-y-3">
            {course.materials.map((material) => (
              <li key={material} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <span className="font-medium text-ink">{material}</span>
                <button type="button" className="text-sm font-semibold text-primary">
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">Upcoming Quizzes</h2>
        <div className="mt-4 space-y-3">
          {course.quizzes.map((quiz) => (
            <div key={quiz.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{quiz.title}</p>
                  <p className="text-sm text-slate-500">{quiz.category}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{quiz.date}</p>
                  <button
                    type="button"
                    className="text-sm font-semibold text-primary"
                  >
                    {quiz.status}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {role === 'tutor' && portal?.courseSupport && (
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[28px] bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold text-slate-500">Empower your teaching</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{portal.courseSupport.upload.title}</h3>
            <p className="mt-2 text-sm text-slate-500">Max file size: {portal.courseSupport.upload.maxSize}</p>
            <div className="mt-4 h-40 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-slate-500">
              {portal.courseSupport.upload.description}
            </div>
            <button className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white" type="button">
              Upload Material
            </button>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-soft">
            <h3 className="text-xl font-semibold text-ink">{portal.courseSupport.quiz.title}</h3>
            <input
              className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder={portal.courseSupport.quiz.placeholders.quizTitle}
            />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {portal.courseSupport.quiz.placeholders.availability.map((placeholder) => (
                <input
                  key={placeholder}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder={placeholder}
                />
              ))}
            </div>
            <button className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white" type="button">
              Save Quiz
            </button>
          </div>
          <div className="rounded-[28px] bg-white p-6 shadow-soft">
            <h3 className="text-xl font-semibold text-ink">{portal.courseSupport.meeting.title}</h3>
            <textarea
              className="mt-4 h-24 w-full rounded-2xl border border-slate-200 px-4 py-3"
              placeholder={portal.courseSupport.meeting.platformHint}
            />
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Date" />
              <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Time" />
              <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Duration" />
            </div>
            <button className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 font-semibold text-white" type="button">
              Schedule Meeting
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default CourseDetailPage;
