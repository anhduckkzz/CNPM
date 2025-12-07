import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toCourseSlug } from '../../utils/courseSlug';
import CourseArtwork from '../../components/CourseArtwork';
import { CheckCircle2, XCircle, Clock, Trash2, X, AlertCircle } from 'lucide-react';
import { useStackedToasts } from '../../hooks/useStackedToasts';

// Normalize status to handle both 'in-progress' and 'In progress' formats
const normalizeStatus = (status?: string): string => {
  if (!status) return 'in-progress';
  const lower = status.toLowerCase().trim();
  if (lower === 'in progress' || lower === 'in-progress') return 'in-progress';
  return lower;
};

const CoursesPage = () => {
  const { portal, role, updatePortal } = useAuth();
  const navigate = useNavigate();
  const registered = portal?.courses;
  const { toasts, showToast } = useStackedToasts(3000);
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelEmail, setCancelEmail] = useState('');
  const [cancelPhone, setCancelPhone] = useState('');
  const [cancelAcknowledge, setCancelAcknowledge] = useState(false);

  if (!registered) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">No registered courses found.</div>;
  }

  const getStatusBadge = (status?: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </div>
        );
      case 'waiting':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Waiting
          </div>
        );
      case 'in-progress':
      default:
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Clock className="h-3.5 w-3.5" />
            In Progress
          </div>
        );
    }
  };

  // Filter to show only in-progress courses that have a status tag
  const visibleCourses = registered.courses.filter((course) => {
    const status = (course as any).status;
    // Only show courses that have a status AND it's 'in-progress'
    return status && normalizeStatus(status) === 'in-progress';
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleCourses.length > 0 ? (
            visibleCourses.map((course) => {
              // Override studentCount to 0 for cancelled courses
              const displayStudentCount = normalizeStatus((course as any).status) === 'cancelled' ? 0 : (course as any).studentCount;
              
              return (
            <article key={course.id} className="flex flex-col rounded-[28px] border border-slate-100 p-5 shadow-soft">
              <CourseArtwork identifier={course.id} title={course.title} code={course.code} />
              <div className="mt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-lg font-semibold text-ink">{course.title}</p>
                  {(course as any).status && getStatusBadge((course as any).status)}
                </div>
                <p className="text-sm text-slate-500">Course ID: {course.code}</p>
                {(course as any).instructor && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Instructor:</span> {(course as any).instructor}
                  </p>
                )}
                {role === 'tutor' && (
                  <>
                    {(course as any).timeStudy && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Time:</span> {(course as any).timeStudy}
                      </p>
                    )}
                    {displayStudentCount !== undefined && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Students:</span> {displayStudentCount} registered
                      </p>
                    )}
                    {(course as any).registeredDate && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Registered:</span> {(course as any).registeredDate}
                      </p>
                    )}
                  </>
                )}
                {role === 'student' && (course as any).tutor && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Instructor:</span> {(course as any).tutor}
                  </p>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={normalizeStatus((course as any).status) === 'cancelled'}
                  onClick={() => {
                    if (!role) return;
                    const slug = toCourseSlug(course.id) ?? course.id;
                    navigate(`/portal/${role}/course-detail/${slug}`);
                  }}
                >
                  {normalizeStatus((course as any).status) === 'cancelled' ? 'Unavailable' : 'Access Course'}
                </button>
                {role === 'tutor' && (
                  <>
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
                    <button
                      type="button"
                      className="rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50"
                      onClick={() => setDeleteCourseId(course.id)}
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
              );
            })
          ) : (
            <div className="col-span-full rounded-[28px] border border-slate-100 p-8 text-center">
              <p className="text-slate-600">No active courses at this moment. Register for a course to get started.</p>
            </div>
          )}
        </div>
      </section>

      {deleteCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-6">
          <div className="relative w-full max-w-lg rounded-[32px] bg-white p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setDeleteCourseId(null);
                setCancelReason('');
                setCancelEmail('');
                setCancelPhone('');
                setCancelAcknowledge(false);
              }}
              className="absolute right-6 top-6 rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-2xl font-semibold text-ink">Course Cancellation Request</h2>
            <p className="mt-2 text-sm text-slate-600">
              We understand that circumstances change. Please provide the following information to help us process your cancellation request professionally.
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Detailed Reason for Cancellation <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full h-32 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Please provide a detailed explanation for the cancellation. This will help us improve our services and inform students appropriately."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
                <p className="mt-1 text-xs text-slate-500">Minimum 20 characters required</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contact Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="your.email@hcmut.edu.vn"
                  value={cancelEmail}
                  onChange={(e) => setCancelEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contact Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="+84 XXX XXX XXX"
                  value={cancelPhone}
                  onChange={(e) => setCancelPhone(e.target.value)}
                />
              </div>
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cancelAcknowledge}
                    onChange={(e) => setCancelAcknowledge(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-amber-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-slate-700">
                    I understand that cancelling this course may affect enrolled students and I will be available for follow-up communications if needed. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                onClick={() => {
                  setDeleteCourseId(null);
                  setCancelReason('');
                  setCancelEmail('');
                  setCancelPhone('');
                  setCancelAcknowledge(false);
                }}
              >
                Keep Course
              </button>
              <button
                type="button"
                className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !cancelReason.trim() || 
                  cancelReason.trim().length < 20 || 
                  !cancelEmail.trim() || 
                  !cancelPhone.trim() || 
                  !cancelAcknowledge
                }
                onClick={() => {
                  // Find the course being deleted
                  const courseToDelete = registered.courses.find(c => c.id === deleteCourseId);
                  
                  if (courseToDelete && portal) {
                    // Remove from registered courses
                    const updatedCourses = registered.courses.filter(c => c.id !== deleteCourseId);
                    
                    // Add back to course registration recommended list
                    const courseCard = {
                      id: courseToDelete.id,
                      title: courseToDelete.title,
                      code: courseToDelete.code,
                      thumbnail: courseToDelete.thumbnail,
                      format: (courseToDelete as any).format || 'Blended',
                      capacity: '0/100',
                      actionLabel: 'Register Tutor'
                    };
                    
                    const updatedRecommended = [
                      ...(portal.courseMatching?.recommended || []),
                      courseCard
                    ];
                    
                    // Update portal state
                    updatePortal({
                      ...portal,
                      courses: {
                        ...registered,
                        courses: updatedCourses
                      },
                      courseMatching: {
                        ...portal.courseMatching!,
                        recommended: updatedRecommended
                      }
                    });
                    
                    // Show notification
                    showToast(`${courseToDelete.title} cancellation pending confirmation`);
                  }
                  
                  // Close modal and reset form
                  setDeleteCourseId(null);
                  setCancelReason('');
                  setCancelEmail('');
                  setCancelPhone('');
                  setCancelAcknowledge(false);
                }}
              >
                Submit Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      <div aria-live="polite" className="pointer-events-none fixed top-6 left-1/2 -translate-x-1/2 z-40 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Cancellation Pending</p>
                <p className="text-xs text-amber-600">{toast.message || 'Your cancellation request is being processed.'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesPage;
