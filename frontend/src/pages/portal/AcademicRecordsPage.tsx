import { useAuth } from '../../context/AuthContext';

const AcademicRecordsPage = () => {
  const { portal, role } = useAuth();
  const records = role === 'staff' ? portal?.staffRecords : portal?.academicRecords;

  if (!records) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Academic records unavailable.</div>;
  }

  if (role === 'staff' && 'metrics' in records) {
    return (
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-4">
          {records.metrics.map((metric) => (
            <div key={metric.label} className="rounded-[28px] bg-white p-6 text-center shadow-soft">
              <p className="text-sm uppercase tracking-widest text-slate-400">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold text-ink">{metric.value}</p>
              <p className="mt-1 text-sm text-slate-500">{metric.caption}</p>
            </div>
          ))}
        </section>
        <section className="grid gap-6 lg:grid-cols-[3fr_1fr]">
          <div className="rounded-[32px] bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">{records.tabs[0]}</h2>
              <button className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500" type="button">
                Filter
              </button>
            </div>
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="px-4 py-2">Order</th>
                  <th className="px-4 py-2">Student ID</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Major</th>
                  <th className="px-4 py-2">Current GPA</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.table.map((row) => (
                  <tr key={row.order} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-500">{row.order}</td>
                    <td className="px-4 py-2 font-semibold text-ink">{row.studentId}</td>
                    <td className="px-4 py-2 text-slate-600">{row.name}</td>
                    <td className="px-4 py-2 text-slate-500">{row.major}</td>
                    <td className="px-4 py-2 font-semibold text-ink">{row.gpa}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="space-y-4">
            <div className="rounded-[32px] bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-ink">Quick Actions</h3>
              <div className="mt-4 space-y-3">
                {records.quickActions.map((action) => (
                  <button key={action.label} type="button" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-[32px] bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-ink">Recent Notifications</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-500">
                {records.notifications.map((notification) => (
                  <div key={notification.title} className="rounded-2xl border border-slate-100 px-4 py-3">
                    <p className="font-semibold text-ink">{notification.title}</p>
                    <p>{notification.body}</p>
                    <p className="text-xs text-slate-400">{notification.timeAgo}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    );
  }

  const studentRecords = portal?.academicRecords;
  if (!studentRecords) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Student record missing.</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <p className="text-sm uppercase tracking-widest text-slate-400">Student Information</p>
        <h1 className="text-3xl font-semibold text-ink">{studentRecords.studentInfo.name}</h1>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            <p className="font-semibold text-ink">Student ID</p>
            <p>{studentRecords.studentInfo.studentId}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            <p className="font-semibold text-ink">Semester</p>
            <p>{studentRecords.studentInfo.semester}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl bg-primary/10 p-6 text-center">
            <p className="text-sm uppercase tracking-widest text-primary">Cumulative GPA</p>
            <p className="mt-2 text-4xl font-semibold text-primary">{studentRecords.gpa}</p>
            <p className="mt-1 text-sm text-primary">{studentRecords.standing}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-500">Scholarship Eligibility</p>
            <p className="mt-2 rounded-full bg-emerald-100 px-4 py-1 text-center text-sm font-semibold text-emerald-600">
              {studentRecords.eligibility.status}
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-500">
              {studentRecords.eligibility.criteria.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-500">Tutor Program Lessons</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {studentRecords.tutorLessons.map((lesson) => (
                <li key={lesson.title} className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2">
                  <span>{lesson.title}</span>
                  <span className="text-xs text-slate-400">{lesson.tutor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-ink">Course Grades</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="px-4 py-2">Course Name</th>
                <th className="px-4 py-2">Grade</th>
                <th className="px-4 py-2">Credits</th>
              </tr>
            </thead>
            <tbody>
              {studentRecords.grades.map((grade) => (
                <tr key={grade.course} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-600">{grade.course}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{grade.grade}</td>
                  <td className="px-4 py-3 text-slate-500">{grade.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <h3 className="text-lg font-semibold text-ink">Eligible Scholarships</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            {studentRecords.scholarships.map((scholarship) => (
              <div key={scholarship.title} className="rounded-2xl border border-slate-100 px-4 py-3">
                <p className="font-semibold text-ink">{scholarship.title}</p>
                <p>{scholarship.description}</p>
                <p className="text-primary">{scholarship.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default AcademicRecordsPage;
