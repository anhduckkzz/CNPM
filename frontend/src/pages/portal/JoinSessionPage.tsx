import { CheckCircle2, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseIdFromSlug, toCourseSlug } from '../../utils/courseSlug';

const JoinSessionPage = () => {
  const { portal, role } = useAuth();
  const navigate = useNavigate();
  const { courseId: courseSlugParam, sessionId } = useParams();
  const normalizedCourseId = courseIdFromSlug(courseSlugParam);
  const course = normalizedCourseId ? portal?.courseDetails?.[normalizedCourseId] : undefined;
  const session = course?.upcomingSessions.find((item) => item.id === sessionId);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mockZoomUrl = useMemo(() => {
    if (!session) return 'https://zoom.us';
    const numeric = session.id.replace(/\D/g, '').slice(-9) || '123456789';
    return `https://zoom.us/j/${numeric}`;
  }, [session]);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2200);
  };

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  if (!course || !session || !role) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Session details unavailable.</div>;
  }

  const handleLaunch = () => {
    showToast('Launching Zoom meeting...');
    window.open(mockZoomUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBack = () => {
    const slug = courseSlugParam ?? toCourseSlug(course.courseId) ?? course.courseId;
    navigate(`/portal/${role}/course-detail/${slug}`);
  };

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-[32px] bg-white p-8 shadow-soft">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live session</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{session.title}</h1>
          <p className="text-sm text-slate-500">Course: {course.title}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Schedule</p>
              <p className="mt-1 text-lg font-semibold text-ink">
                {session.date} • {session.time}
              </p>
              <p className="text-sm text-slate-500">Please join 5 minutes early so we can verify attendance.</p>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Platform</p>
              <p className="mt-1 text-lg font-semibold text-ink">Zoom Meetings</p>
              <p className="text-sm text-slate-500">Access provided through our simulated Zoom launch.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={handleLaunch}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-primary/90"
            >
              Launch Zoom Meeting
              <ExternalLink className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard
                  .writeText(mockZoomUrl)
                  .then(() => showToast('Copied meeting URL'))
                  .catch(() => showToast('Unable to copy link'));
              }}
              className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
            >
              Copy meeting link
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
            >
              Back to course
            </button>
          </div>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-soft">
          <h2 className="text-xl font-semibold text-ink">Connection checklist</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Ensure your Zoom desktop or mobile client is signed in before joining.</li>
            <li>Use a headset and enable a quiet environment for clearer participation.</li>
            <li>Keep the chat monitored for attendance prompts from your tutor.</li>
            <li>This mock integration forwards you to Zoom; no real API calls are made.</li>
          </ul>
        </section>
      </div>

      <div
        aria-live="assertive"
        className={`pointer-events-none fixed left-6 top-6 z-[60] w-full max-w-xs transform rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm shadow-lg transition-all duration-300 ${
          toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        }`}
      >
        <div className="pointer-events-auto flex items-start gap-3 text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Success</p>
            <p className="text-xs text-emerald-800/80">{toast.message || 'Action completed successfully.'}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default JoinSessionPage;
