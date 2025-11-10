import { useAuth } from '../../context/AuthContext';

const NotifyStudentPage = () => {
  const { portal, role } = useAuth();
  const notifications = portal?.notifications;

  if (role !== 'staff' || !notifications) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Notification composer available for staff only.</div>;
  }

  return (
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
              <span className="rounded-full border border-dashed border-slate-200 px-3 py-1 text-sm text-slate-400">
                Search and add students…
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Notification Dispatch</p>
            <div className="mt-3 grid gap-3">
              {notifications.channels.map((channel) => (
                <button key={channel} className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft" type="button">
                  {channel}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotifyStudentPage;
