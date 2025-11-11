import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CourseMatchingPage = () => {
  const { portal, role } = useAuth();
  const data = portal?.courseMatching;
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  interface CancelFormState {
    open: boolean;
    courseId: string;
    courseTitle: string;
    fullName: string;
    studentId: string;
    contact: string;
    reason: string;
    details: string;
  }

  const [cancelForm, setCancelForm] = useState<CancelFormState>({
    open: false,
    courseId: '',
    courseTitle: '',
    fullName: portal?.user?.name ?? '',
    studentId: portal?.user?.id ?? '',
    contact: portal?.user?.email ?? '',
    reason: '',
    details: '',
  });

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course matching data unavailable.</div>;
  }

  const modalCourse =
    data.recommended.find((course) => course.id === activeCourseId) ??
    data.history.find((course) => course.id === activeCourseId);
  const showModal = isModalOpen && modalCourse;
  const slots = data.modal.slots;
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    setCancelForm((prev) => ({
      ...prev,
      fullName: portal?.user?.name ?? '',
      studentId: portal?.user?.id ?? '',
      contact: portal?.user?.email ?? '',
    }));
  }, [portal?.user?.name, portal?.user?.id, portal?.user?.email]);

  const openModal = (courseId: string) => {
    setActiveCourseId(courseId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveCourseId(null);
  };

  const openCancelForm = (courseId: string, courseTitle: string) => {
    setCancelForm((prev) => ({
      ...prev,
      open: true,
      courseId,
      courseTitle,
      reason: '',
      details: '',
    }));
  };

  const closeCancelForm = () => {
    setCancelForm((prev) => ({
      ...prev,
      open: false,
      reason: '',
      details: '',
    }));
  };

  const handleCancelInput =
    (field: 'fullName' | 'studentId' | 'contact' | 'reason' | 'details') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setCancelForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleCancelSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    showToast(`Cancellation submitted for ${cancelForm.courseTitle || 'selected course'}.`);
    closeCancelForm();
  };

  const handleRegisterSlot = (sectionLabel: string) => {
    showToast(`Successfully registered for ${sectionLabel}.`);
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
                <button
                  className="rounded-2xl border border-red-200 px-4 py-3 font-semibold text-red-500"
                  type="button"
                  onClick={() => openCancelForm(course.id, course.title)}
                >
                  Cancel Course
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showModal &&
        portalTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex min-h-screen w-screen items-center justify-center bg-slate-900/40 px-4 py-8">
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
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                >
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
                        <button
                          type="button"
                          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
                          onClick={() => handleRegisterSlot(slot.section)}
                        >
                          {slot.cta}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          portalTarget,
        )}
      {cancelForm.open &&
        portalTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex min-h-screen w-screen items-center justify-center bg-slate-900/40 px-4 py-8">
            <form
              className="w-full max-w-2xl space-y-4 rounded-[28px] bg-white p-6 shadow-2xl"
              onSubmit={handleCancelSubmit}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cancellation form</p>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">Cancel {cancelForm.courseTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Tell us why you are dropping this course so we can improve future planning.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  onClick={closeCancelForm}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-600">
                  Full name
                  <input
                    required
                    type="text"
                    value={cancelForm.fullName}
                    onChange={handleCancelInput('fullName')}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-600">
                  Student ID
                  <input
                    required
                    type="text"
                    value={cancelForm.studentId}
                    onChange={handleCancelInput('studentId')}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-600">
                  HCMUT email
                  <input
                    required
                    type="email"
                    value={cancelForm.contact}
                    onChange={handleCancelInput('contact')}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
                  />
                </label>
                <label className="text-sm font-semibold text-slate-600">
                  Reason for cancellation
                  <input
                    required
                    type="text"
                    placeholder="e.g., schedule conflict, module switch..."
                    value={cancelForm.reason}
                    onChange={handleCancelInput('reason')}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
                  />
                </label>
              </div>

              <label className="text-sm font-semibold text-slate-600">
                Additional context
                <textarea
                  required
                  rows={4}
                  value={cancelForm.details}
                  onChange={handleCancelInput('details')}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
                  placeholder="Share any notes for the academic advisor..."
                />
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCancelForm}
                  className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Keep course
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-soft"
                >
                  Submit cancellation
                </button>
              </div>
            </form>
          </div>,
          portalTarget,
        )}
      <div
        className={`pointer-events-none fixed left-6 top-6 z-[60] w-full max-w-xs transform rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm shadow-lg transition-all duration-300 ${
          toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        }`}
      >
        <div className="pointer-events-auto flex items-start gap-3 text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Success</p>
            <p className="text-xs text-emerald-800/80">{toast.message || 'Your action has been recorded.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMatchingPage;
