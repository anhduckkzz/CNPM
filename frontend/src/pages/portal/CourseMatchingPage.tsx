import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CourseMatchingPage = () => {
  const { portal, role } = useAuth();
  const data = portal?.courseMatching;
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course matching data unavailable.</div>;
  }

  const modalCourse =
    data.recommended.find((course) => course.id === activeCourseId) ??
    data.history.find((course) => course.id === activeCourseId);
  const showModal = isModalOpen && modalCourse;
  const slots = data.modal.slots;

  const openModal = (courseId: string) => {
    setActiveCourseId(courseId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveCourseId(null);
  };

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink">{data.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-500">{data.description}</p>
          </div>
          <button className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft" type="button">
            Auto Match for {role}
          </button>
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
          {data.history.map((course) => (
            <div key={course.id} className="flex flex-col rounded-[28px] border border-slate-100 p-5 shadow-soft">
              <img src={course.thumbnail} alt={course.title} className="h-32 w-full rounded-2xl object-cover" />
              <div className="mt-4 flex-1">
                <p className="text-lg font-semibold text-ink">{course.title}</p>
                <p className="text-sm text-slate-500">Tutor: {course.tutor}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{course.format}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{course.capacity}</span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{course.badge}</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-soft" type="button" onClick={() => openModal(course.id)}>
                  {course.actionLabel}
                </button>
                <button className="rounded-2xl border border-red-200 px-4 py-3 font-semibold text-red-500" type="button">
                  Cancel Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <div className="flex items-start gap-4 border-b border-slate-100 p-6">
              <img src={modalCourse.thumbnail} alt={modalCourse.title} className="h-24 w-32 rounded-2xl object-cover" />
              <div className="flex-1">
                <p className="text-sm text-slate-500">Course ID: {modalCourse.code}</p>
                <h3 className="text-2xl font-semibold text-ink">{modalCourse.title}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Credits: 4 <span className="mx-2 text-slate-300">|</span> Prerequisite: None
                </p>
                <button className="mt-3 w-full rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white" type="button">
                  Automatching
                </button>
              </div>
              <button type="button" onClick={closeModal} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
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
                      <button type="button" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
                        {slot.cta}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseMatchingPage;
