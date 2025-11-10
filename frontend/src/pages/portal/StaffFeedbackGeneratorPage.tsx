import { useAuth } from '../../context/AuthContext';

const StaffFeedbackGeneratorPage = () => {
  const { portal, role } = useAuth();
  const feedbackReport = portal?.reports?.feedback;

  if (role !== 'staff' || !feedbackReport) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Feedback generator available for staff only.</div>;
  }

  return (
    <div className="space-y-6 rounded-[32px] bg-white p-8 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-400">Feedback Generation</p>
          <h1 className="text-3xl font-semibold text-ink">Manage and generate comprehensive feedback reports</h1>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-500">
          Select Session for Report Generation
          <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
            {feedbackReport.filters.map((filter) => (
              <option key={filter.value}>{filter.value}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-500">
          Output Format
          <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
            <option>PDF</option>
            <option>CSV</option>
            <option>Dashboard</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {feedbackReport.options.map((option) => (
          <div key={option} className="rounded-3xl border border-slate-100 p-6 text-center">
            <p className="text-lg font-semibold text-ink">{option}</p>
            <p className="mt-2 text-sm text-slate-500">Generate detailed report focusing on {option.toLowerCase()}.</p>
            <button className="mt-4 w-full rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white" type="button">
              {option}
            </button>
          </div>
        ))}
      </div>
      <div className="rounded-[28px] border border-dashed border-primary/30 bg-primary/5 p-8 text-center text-primary">
        <p className="text-2xl font-semibold">Your PDF report has been downloaded successfully!</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <button className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-soft" type="button">
            Open Report
          </button>
          <button className="rounded-2xl border border-primary px-5 py-3 font-semibold text-primary" type="button">
            Save As…
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffFeedbackGeneratorPage;
