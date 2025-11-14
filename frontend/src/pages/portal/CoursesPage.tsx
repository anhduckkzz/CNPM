import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toCourseSlug } from '../../utils/courseSlug';
import CourseArtwork from '../../components/CourseArtwork';

const CoursesPage = () => {
  const { portal, role } = useAuth();
  const navigate = useNavigate();
  const registered = portal?.courses;

  if (!registered) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">No registered courses found.</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {registered.courses.map((course) => (
            <article key={course.id} className="rounded-[28px] border border-slate-100 p-5 shadow-soft">
              <CourseArtwork identifier={course.id} title={course.title} code={course.code} />
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
