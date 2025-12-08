import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toCourseSlug } from '../../utils/courseSlug';
import { CheckCircle2, XCircle, Clock, AlertCircle, PlayCircle, Ban } from 'lucide-react';
import { useStackedToasts } from '../../hooks/useStackedToasts';

// Normalize status to handle both 'in-progress' and 'In progress' formats
const normalizeStatus = (status?: string): string => {
  if (!status) return 'in-progress';
  const lower = status.toLowerCase().trim();
  if (lower === 'in progress' || lower === 'in-progress') return 'in-progress';
  return lower;
};

const RegisterHistoryPage = () => {
  const { portal, role, updatePortal } = useAuth();
  const navigate = useNavigate();
  const registered = portal?.courses;
  const { toasts, showToast } = useStackedToasts(3000);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [rejectCourseId, setRejectCourseId] = useState<string | null>(null);
  const [dropCourseId, setDropCourseId] = useState<string | null>(null);

  if (!registered) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">No course history found.</div>;
  }

  const getStatusBadge = (status?: string) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'completed':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Completed
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
            <XCircle className="h-3.5 w-3.5" />
            Cancelled
          </div>
        );
      case 'waiting':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Waiting
          </div>
        );
      case 'in-progress':
      default:
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <Clock className="h-3.5 w-3.5" />
            In Progress
          </div>
        );
    }
  };

  const handleOpenClass = async (courseId: string) => {
    if (!portal) return;
    
    const updatedCourses = registered.courses.map(course => {
      if (course.id === courseId) {
        return { ...course, status: 'in-progress' };
      }
      return course;
    });

    await updatePortal({
      ...portal,
      courses: {
        ...registered,
        courses: updatedCourses
      }
    });

    showToast('✅ Class opened successfully! Course is now active.', 'success');
  };

  const handleRejectClass = async (courseId: string) => {
    if (!portal) return;
    
    const updatedCourses = registered.courses.map(course => {
      if (course.id === courseId) {
        return { ...course, status: 'cancelled', studentCount: 0 };
      }
      return course;
    });

    await updatePortal({
      ...portal,
      courses: {
        ...registered,
        courses: updatedCourses
      }
    });

    setRejectCourseId(null);
    showToast('❌ Class rejected. Status changed to cancelled.', 'error');
  };

  const handleDropClass = async (courseId: string) => {
    if (!portal) return;
    
    const updatedCourses = registered.courses.map(course => {
      if (course.id === courseId) {
        return { ...course, status: 'cancelled' };
      }
      return course;
    });

    await updatePortal({
      ...portal,
      courses: {
        ...registered,
        courses: updatedCourses
      }
    });

    setDropCourseId(null);
    showToast('❌ Course dropped. Status changed to cancelled.', 'error');
  };

  // Filter courses by status
  const filteredCourses = useMemo(() => {
    let courses = registered.courses;
    
    if (statusFilter !== 'All') {
      const filterNormalized = normalizeStatus(statusFilter);
      courses = courses.filter((course) => {
        return normalizeStatus((course as any).status) === filterNormalized;
      });
    }

    // Sort courses
    return [...courses].sort((a, b) => {
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'date') {
        const dateA = (a as any).registeredDate || '';
        const dateB = (b as any).registeredDate || '';
        return dateB.localeCompare(dateA);
      } else if (sortBy === 'status') {
        const statusA = normalizeStatus((a as any).status);
        const statusB = normalizeStatus((b as any).status);
        return statusA.localeCompare(statusB);
      }
      return 0;
    });
  }, [registered.courses, statusFilter, sortBy]);

  const statusOptions = ['All', 'In Progress', 'Completed', 'Cancelled', 'Waiting'];

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Register History</h1>
            <p className="mt-1 text-sm text-slate-500">View all your course registrations and their current status</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'status')}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-left text-sm font-semibold text-slate-700">Course</th>
                  <th className="pb-4 text-left text-sm font-semibold text-slate-700">Code</th>
                  <th className="pb-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  {role === 'tutor' && (
                    <>
                      <th className="pb-4 text-left text-sm font-semibold text-slate-700">Time</th>
                      <th className="pb-4 text-left text-sm font-semibold text-slate-700">Students</th>
                    </>
                  )}
                  <th className="pb-4 text-left text-sm font-semibold text-slate-700">Registered</th>
                  <th className="pb-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course, index) => (
                  <tr
                    key={course.id}
                    className={`border-b border-slate-50 transition hover:bg-slate-50 ${
                      index === filteredCourses.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-ink">{course.title}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm text-slate-600">{course.code}</p>
                    </td>
                    <td className="py-4">
                      {getStatusBadge((course as any).status)}
                    </td>
                    {role === 'tutor' && (
                      <>
                        <td className="py-4">
                          <p className="text-sm text-slate-600">{(course as any).timeStudy || 'N/A'}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-sm text-slate-600">
                            {normalizeStatus((course as any).status) === 'cancelled' ? 0 : ((course as any).studentCount || 0)} students
                          </p>
                        </td>
                      </>
                    )}
                    <td className="py-4">
                      <p className="text-sm text-slate-600">{(course as any).registeredDate || 'N/A'}</p>
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        {role === 'tutor' && normalizeStatus((course as any).status) === 'waiting' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenClass(course.id)}
                              className="flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700"
                            >
                              <PlayCircle className="h-3.5 w-3.5" />
                              Open Class
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectCourseId(course.id)}
                              className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                            >
                              <Ban className="h-3.5 w-3.5" />
                              Reject Class
                            </button>
                          </>
                        )}
                        {role === 'student' && normalizeStatus((course as any).status) === 'waiting' && (
                          <button
                            type="button"
                            onClick={() => setDropCourseId(course.id)}
                            className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Drop Class
                          </button>
                        )}
                        {normalizeStatus((course as any).status) !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!role) return;
                              const slug = toCourseSlug(course.id) ?? course.id;
                              navigate(`/portal/${role}/course-detail/${slug}`);
                            }}
                            className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-dark"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-slate-600">No courses found matching your filters.</p>
          </div>
        )}
      </section>

      {/* Reject Class Confirmation Modal */}
      {rejectCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-ink">Reject Class</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="mb-6 text-slate-600">
              Are you sure you want to reject this class? The course status will be changed to cancelled and the student count will be set to 0.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRejectCourseId(null)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRejectClass(rejectCourseId)}
                className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Reject Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drop Class Confirmation Modal for Students */}
      {dropCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-ink">Drop Class</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="mb-6 text-slate-600">
              Are you sure you want to drop this class? The course status will be changed to cancelled.
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDropCourseId(null)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Keep Class
              </button>
              <button
                type="button"
                onClick={() => handleDropClass(dropCourseId)}
                className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Drop Class
              </button>
            </div>
          </div>
        </div>
      )}

      <div aria-live="polite" className="pointer-events-none fixed top-6 left-1/2 -translate-x-1/2 z-40 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-semibold">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegisterHistoryPage;
