import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStackedToasts } from '../../hooks/useStackedToasts';

const StaffFeedbackGeneratorPage = () => {
  const { portal, role } = useAuth();
  const feedbackReport = portal?.reports?.feedback;
  const { toasts, showToast } = useStackedToasts();

  const handleGenerate = (option: string) => {
    showToast(`${option} is being prepared. Your PDF report will download shortly.`);
  };

  if (role !== 'staff' || !feedbackReport) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Feedback generator available for staff only.</div>;
  }

  return (
    <>
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
              <button
                className="mt-4 w-full rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                type="button"
                onClick={() => handleGenerate(option)}
              >
                {option}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed left-1/2 top-16 z-[60] flex w-full max-w-md -translate-x-1/2 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-3xl border border-primary/20 bg-white/95 p-5 text-sm text-primary shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-semibold text-ink">Report generation queued</p>
                <p className="text-xs text-slate-600">{toast.message || 'Your PDF report has been downloaded successfully!'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StaffFeedbackGeneratorPage;
