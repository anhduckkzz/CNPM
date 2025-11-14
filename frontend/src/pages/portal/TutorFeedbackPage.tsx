import { useAuth } from '../../context/AuthContext';

const TutorFeedbackPage = () => {
  const { portal, role } = useAuth();
  const data = portal?.tutorFeedback;

  if (role !== 'tutor') {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Tutor feedback is only available for tutors.</div>;
  }

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Tutor feedback data unavailable.</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">Tutor Feedback and Evaluation</h1>
        <p className="mt-2 text-slate-500">Monitor attendance, capture reflections, and submit system feedback.</p>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-100">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">In-class Score</th>
              </tr>
            </thead>
            <tbody>
              {data.attendance.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-ink">{entry.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs ${entry.attended ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {entry.attended ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{entry.inClassScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-500">
            Session Reflection
            <textarea className="mt-2 h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" defaultValue="Session was insightful and promoted active learning." />
          </label>
          <label className="block text-sm font-semibold text-slate-500">
            System Feedback
            <textarea className="mt-2 h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" defaultValue="Improve performance and navigation clarity." />
          </label>
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Overall System Experience</p>
          <input type="range" min={1} max={7} defaultValue={data.sessionRating} className="mt-4 w-full accent-primary" />
        </div>
        <button className="mt-6 w-full rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft" type="button">
          Submit Tutor Feedback
        </button>
      </section>

      <aside className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">History</h2>
        <div className="mt-4 space-y-4">
          {data.history.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-ink">{item.course}</p>
              <p className="text-xs text-slate-400">Submitted on {item.submittedOn}</p>
              <p className="mt-2 text-sm text-slate-500">{item.summary}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default TutorFeedbackPage;
