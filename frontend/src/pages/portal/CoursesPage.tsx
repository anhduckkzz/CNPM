import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CoursesPage = () => {
  const { portal, role } = useAuth();
  const navigate = useNavigate();
  const registered = portal?.courses;

  if (!registered) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">No registered courses found.</div>;
  }

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">Courses</p>
            <h1 className="text-3xl font-semibold text-ink">{registered.title}</h1>
            <p className="mt-2 text-slate-500">{registered.description}</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-sm text-slate-500">
            <BookOpen className="h-5 w-5 text-primary" />
            <span>{registered.courses.length} total courses</span>
          </div>
        </div>
      </header>

      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {registered.courses.map((course) => (
            <article key={course.id} className="rounded-[28px] border border-slate-100 p-5 shadow-soft">
              <img src={course.thumbnail} alt={course.title} className="h-36 w-full rounded-2xl object-cover" />
              <div className="mt-4 space-y-1">
                <p className="text-lg font-semibold text-ink">{course.title}</p>
                <p className="text-sm text-slate-500">Course ID: {course.code}</p>
              </div>
              <button
                type="button"
                className="mt-5 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-dark"
                onClick={() => role && navigate(`/portal/${role}/course-detail/${course.id}`)}
              >
                Access Course
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;
