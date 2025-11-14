import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StaffFeedbackGeneratorPage = () => {
  const { portal, role } = useAuth();
  const feedbackReport = portal?.reports?.feedback;
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleGenerate = (_option: string) => {
    showToast('Your PDF report has been downloaded successfully!');
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
        <div className="rounded-[28px] border border-dashed border-primary/30 bg-primary/5 p-8 text-center text-primary">
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <button
              className="rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-soft"
              type="button"
              onClick={() => handleGenerate('Open Report')}
            >
              Open Report
            </button>
            <button
              className="rounded-2xl border border-primary px-5 py-3 font-semibold text-primary"
              type="button"
              onClick={() => handleGenerate('Save As')}
            >
              Save As...
            </button>
          </div>
        </div>
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
            <p className="text-xs text-emerald-800/80">
              {toast.message || 'Your PDF report has been downloaded successfully!'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffFeedbackGeneratorPage;
