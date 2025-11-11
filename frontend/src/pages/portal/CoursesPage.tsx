import { BookOpen } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toCourseSlug } from '../../utils/courseSlug';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1457473075527-b0db8a3cba1c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
];

const selectFallbackImage = () => {
  const index = Math.floor(Math.random() * FALLBACK_IMAGES.length);
  return FALLBACK_IMAGES[index] ?? FALLBACK_IMAGES[0];
};

const CoursesPage = () => {
  const { portal, role } = useAuth();
  const navigate = useNavigate();
  const registered = portal?.courses;

  const fallbackMap = useMemo(() => {
    if (!registered) return {};
    return Object.fromEntries(
      registered.courses.map((course) => [course.id, selectFallbackImage()]),
    ) as Record<string, string>;
  }, [registered]);

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
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-36 w-full rounded-2xl object-cover"
                onError={(event) => {
                  const fallback = fallbackMap[course.id] ?? selectFallbackImage();
                  if (event.currentTarget.src === fallback) return;
                  event.currentTarget.src = fallback;
                }}
              />
              <div className="mt-4 space-y-1">
                <p className="text-lg font-semibold text-ink">{course.title}</p>
                <p className="text-sm text-slate-500">Course ID: {course.code}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-dark"
                  onClick={() => {
                    if (!role) return;
                    const slug = toCourseSlug(course.id) ?? course.id;
                    navigate(`/portal/${role}/course-detail/${slug}`);
                  }}
                >
                  Access Course
                </button>
                {role === 'tutor' && (
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
                    onClick={() => {
                      const slug = toCourseSlug(course.id) ?? course.id;
                      navigate(`/portal/${role}/course-admin/${slug}`);
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;
