import { CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStackedToasts } from '../../hooks/useStackedToasts';
import { generatePerformanceAnalysisSpreadsheet, generateScholarshipReportSpreadsheet, generateFeedbackReportSpreadsheet } from '../../utils/excelGenerator';

const ReportSection = ({
  title,
  report,
  onAction,
  onGenerateExcel,
}: {
  title: string;
  report: { reportName: string; academicYear: string; semester?: string; filters: { label: string; value: string }[]; options: string[] };
  onAction: (message: string) => void;
  onGenerateExcel: () => void;
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
      <button
        className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-primary/90"
        type="button"
        onClick={() => onAction(`Generated ${report.reportName}`)}
      >
        Generate Report
      </button>
      <button
        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-emerald-700"
        type="button"
        onClick={onGenerateExcel}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export to Excel
      </button>
      <button
        className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary"
        type="button"
        onClick={() => onAction(`Sent ${report.reportName} to Office of Student Affairs`)}
      >
        Send Report to Office of Student Affairs
      </button>
      <button
        className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary"
        type="button"
        onClick={() => onAction(`Sent ${report.reportName} to Academic Department`)}
      >
        Send Report to Academic Department
      </button>
    </div>
  </section>
);

const ReportBuilderPage = () => {
  const { portal, role } = useAuth();
  const reports = portal?.reports;
  const staffRecords = portal?.staffRecords;
  const { toasts, showToast } = useStackedToasts();

  if (role !== 'staff' || !reports) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Report builder available for staff only.</div>;
  }

  // Prepare mock student data for Excel generation
  const mockStudentData = staffRecords?.table || [
    { studentId: 'STU-20127001', name: 'Nguyễn Văn An', major: 'Computer Science', gpa: '3.85', status: 'Active' },
    { studentId: 'STU-20127002', name: 'Trần Thị Bình', major: 'Electrical Engineering', gpa: '3.92', status: 'Active' },
    { studentId: 'STU-20127003', name: 'Lê Văn Cường', major: 'Mechanical Engineering', gpa: '3.67', status: 'Active' },
    { studentId: 'STU-20127004', name: 'Phạm Thị Dung', major: 'Civil Engineering', gpa: '3.78', status: 'Active' },
    { studentId: 'STU-20127005', name: 'Hoàng Văn Em', major: 'Chemical Engineering', gpa: '3.56', status: 'Active' },
  ];

  const handleGeneratePerformanceExcel = () => {
    generatePerformanceAnalysisSpreadsheet(mockStudentData);
    showToast('✅ Performance analysis spreadsheet downloaded successfully!');
  };

  const handleGenerateScholarshipExcel = () => {
    generateScholarshipReportSpreadsheet(mockStudentData);
    showToast('✅ Scholarship report spreadsheet downloaded successfully!');
  };

  const handleGenerateFeedbackExcel = () => {
    generateFeedbackReportSpreadsheet(mockStudentData);
    showToast('✅ Feedback report spreadsheet downloaded successfully!');
  };

  return (
    <>
      <div className="space-y-8">
        <ReportSection 
          title="Academic Report" 
          report={reports.academic} 
          onAction={showToast}
          onGenerateExcel={handleGeneratePerformanceExcel}
        />
        <ReportSection 
          title="Scholarship Report" 
          report={reports.scholarship} 
          onAction={showToast}
          onGenerateExcel={handleGenerateScholarshipExcel}
        />
        <ReportSection 
          title="Feedback Generation" 
          report={reports.feedback} 
          onAction={showToast}
          onGenerateExcel={handleGenerateFeedbackExcel}
        />
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

export default ReportBuilderPage;
