import { useAuth } from '../../context/AuthContext';

const ReportSection = ({
  title,
  report,
}: {
  title: string;
  report: { reportName: string; academicYear: string; semester?: string; filters: { label: string; value: string }[]; options: string[] };
}) => (
  <section className="rounded-[32px] bg-white p-8 shadow-soft">
    <p className="text-sm uppercase tracking-widest text-slate-400">{title}</p>
    <h2 className="text-2xl font-semibold text-ink">{report.reportName}</h2>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <label className="text-sm font-semibold text-slate-500">
        Academic Year
        <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" defaultValue={report.academicYear} />
      </label>
      {report.semester && (
        <label className="text-sm font-semibold text-slate-500">
          Semester
          <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" defaultValue={report.semester}>
            <option>{report.semester}</option>
            <option>Fall</option>
            <option>Spring</option>
            <option>Summer</option>
          </select>
        </label>
      )}
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {report.filters.map((filter) => (
        <label key={filter.label} className="text-sm font-semibold text-slate-500">
          {filter.label}
          <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" defaultValue={filter.value} />
        </label>
      ))}
    </div>
    <div className="mt-6">
      <p className="text-sm font-semibold text-slate-500">Options</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {report.options.map((option) => (
          <label key={option} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm">
            <input type="checkbox" className="accent-primary" defaultChecked />
            {option}
          </label>
        ))}
      </div>
    </div>
    <div className="mt-6 flex flex-wrap gap-4">
      <button className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft" type="button">
        Generate Report
      </button>
      <button className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500" type="button">
        Send Report to Office of Student Affairs
      </button>
      <button className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500" type="button">
        Send Report to Academic Department
      </button>
    </div>
  </section>
);

const ReportBuilderPage = () => {
  const { portal, role } = useAuth();
  const reports = portal?.reports;

  if (role !== 'staff' || !reports) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Report builder available for staff only.</div>;
  }

  return (
    <div className="space-y-8">
      <ReportSection title="Academic Report" report={reports.academic} />
      <ReportSection title="Scholarship Report" report={reports.scholarship} />
      <ReportSection title="Feedback Generation" report={reports.feedback} />
    </div>
  );
};

export default ReportBuilderPage;
