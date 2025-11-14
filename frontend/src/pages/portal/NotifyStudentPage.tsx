import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStackedToasts } from '../../hooks/useStackedToasts';

const NotifyStudentPage = () => {
  const { portal, role } = useAuth();
  const notifications = portal?.notifications;
  const { toasts, showToast } = useStackedToasts();

  const handleSendNotification = (channel: string) => {
    showToast(`Notification sent via ${channel}`);
  };

  if (role !== 'staff' || !notifications) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Notification composer available for staff only.</div>;
  }

  return (
    <>
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">Notify Student</h1>
        <p className="mt-2 text-slate-500">Compose and send notifications to targeted recipients.</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-500">
              Select Template
              <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
                {notifications.templates.map((template) => (
                  <option key={template}>{template}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-500">
              Subject
              <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Enter subject for the notification" />
            </label>
            <label className="block text-sm font-semibold text-slate-500">
              Message
              <textarea className="mt-2 h-40 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Write your message here..." />
            </label>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-500">
              Select Recipients
              <div className="mt-2 flex gap-3">
                <select className="flex-1 rounded-2xl border border-slate-200 px-4 py-3">
                  <option>Select Course</option>
                </select>
                <select className="flex-1 rounded-2xl border border-slate-200 px-4 py-3">
                  <option>Select Major</option>
                </select>
                <select className="flex-1 rounded-2xl border border-slate-200 px-4 py-3">
                  <option>Select Status</option>
                </select>
              </div>
            </label>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Selected Students</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {notifications.selectedStudents.map((student) => (
                  <span key={student} className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {student}
                  </span>
                ))}
                <span className="rounded-full border border-dashed border-slate-200 px-3 py-1 text-sm text-slate-400">Search and add students...</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Notification Dispatch</p>
              <div className="mt-3 grid gap-3">
                {notifications.channels.map((channel) => (
                  <button
                    key={channel}
                    className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary/90"
                    type="button"
                    onClick={() => handleSendNotification(channel)}
                  >
                    Send via {channel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div aria-live="assertive" className="pointer-events-none fixed left-6 top-6 z-[60] flex w-full max-w-xs flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Success</p>
                <p className="text-xs text-emerald-800/80">{toast.message || 'Action completed successfully.'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotifyStudentPage;
