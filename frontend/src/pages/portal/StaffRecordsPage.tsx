import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileDown, X } from 'lucide-react';

type ReportType = 'scholarship' | 'academic' | 'feedback';

const StaffRecordsPage = () => {
  const { portal, role } = useAuth();
  const records = portal?.staffRecords;
  const [activeReportType, setActiveReportType] = useState<ReportType>('scholarship');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async (reportType: ReportType): Promise<Blob | null> => {
    if (!records) return null;

    setIsGenerating(true);

    try {
      const currentDate = new Date().toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const activeCount = records.table.filter(row => row.status === 'Active').length;
      const averageGPA = (
        records.table.reduce((sum, row) => sum + Number(row.gpa || 0), 0) / records.table.length
      ).toFixed(2);

      const reportData = {
        reportType,
        records: records.table,
        metadata: {
          generatedDate: currentDate,
          totalStudents: records.table.length,
          activeStudents: activeCount,
          averageGPA
        }
      };

      const response = await fetch('http://localhost:8000/api/reports/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Make sure the backend server is running and Playwright is installed.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    const pdfBlob = await generatePDF(activeReportType);
    
    if (!pdfBlob) {
      return; // Error already handled in generatePDF
    }
    
    const url = URL.createObjectURL(pdfBlob);
    
    // Show preview
    setPdfPreviewUrl(url);
    
    // Also trigger download
    const link = document.createElement('a');
    link.href = url;
    const reportNames = {
      scholarship: 'Scholarship_Report',
      academic: 'Academic_Report',
      feedback: 'Feedback_Report'
    };
    const currentDate = new Date().toLocaleDateString('en-US').replace(/\//g, '-');
    link.download = `${reportNames[activeReportType]}_${currentDate}.pdf`;
    link.click();
  };

  const closePreview = () => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  };

  if (role !== 'staff' || !records) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Staff controls unavailable.</div>;
  }

  const getTableHeaders = () => {
    if (activeReportType === 'scholarship') {
      return ['#', 'Student ID', 'Student Name', 'Major', 'GPA', 'Status', 'Decision'];
    } else if (activeReportType === 'academic') {
      return ['#', 'Student ID', 'Name', 'Major', 'GPA', 'Conduct Score', 'Standing'];
    } else {
      return ['#', 'Student ID', 'Name', 'Major', 'GPA', 'Status', 'Attendance'];
    }
  };

  const getTableRow = (row: any) => {
    if (activeReportType === 'scholarship') {
      return (
        <>
          <td className="px-3 py-3 text-slate-500">{row.order}</td>
          <td className="px-3 py-3 text-slate-600">{row.studentId}</td>
          <td className="px-3 py-3 font-semibold text-ink">{row.name}</td>
          <td className="px-3 py-3 text-slate-600">{row.major}</td>
          <td className="px-3 py-3 text-center text-slate-600">{row.gpa}</td>
          <td className="px-3 py-3 text-slate-500">{row.status === 'Active' ? '✓' : '✗'}</td>
          <td className="px-3 py-3 text-center">
            <input type="checkbox" className="h-5 w-5 rounded border-slate-300 accent-primary" />
          </td>
        </>
      );
    } else if (activeReportType === 'academic') {
      const conductScore = Math.round(Number(row.gpa) * 25);
      const standing = Number(row.gpa) >= 3.5 ? 'Excellent' : Number(row.gpa) >= 3.0 ? 'Good' : 'Fair';
      return (
        <>
          <td className="px-3 py-3 text-slate-500">{row.order}</td>
          <td className="px-3 py-3 text-slate-600">{row.studentId}</td>
          <td className="px-3 py-3 font-semibold text-ink">{row.name}</td>
          <td className="px-3 py-3 text-slate-600">{row.major}</td>
          <td className="px-3 py-3 text-center text-slate-600">{row.gpa}</td>
          <td className="px-3 py-3 text-center text-slate-600">{conductScore}</td>
          <td className="px-3 py-3 text-center">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              standing === 'Excellent' ? 'bg-emerald-100 text-emerald-700' :
              standing === 'Good' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {standing}
            </span>
          </td>
        </>
      );
    } else {
      return (
        <>
          <td className="px-3 py-3 text-slate-500">{row.order}</td>
          <td className="px-3 py-3 text-slate-600">{row.studentId}</td>
          <td className="px-3 py-3 font-semibold text-ink">{row.name}</td>
          <td className="px-3 py-3 text-slate-600">{row.major}</td>
          <td className="px-3 py-3 text-center text-slate-600">{row.gpa}</td>
          <td className="px-3 py-3 text-slate-500">{row.status}</td>
          <td className="px-3 py-3 text-center text-slate-600">{row.status === 'Active' ? '85%' : '60%'}</td>
        </>
      );
    }
  };

  return (
    <>
      <div className="space-y-8">
        <header className="rounded-[32px] bg-white p-8 shadow-soft">
          <p className="text-sm uppercase tracking-widest text-slate-400">{records.tabs[1]}</p>
          <h1 className="text-3xl font-semibold text-ink">Staff Records & Reports</h1>
          
          {/* Report Type Tabs */}
          <div className="mt-6 flex gap-3 border-b border-slate-200">
            <button
              onClick={() => setActiveReportType('scholarship')}
              className={`px-6 py-3 font-semibold transition ${
                activeReportType === 'scholarship'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scholarship Report
            </button>
            <button
              onClick={() => setActiveReportType('academic')}
              className={`px-6 py-3 font-semibold transition ${
                activeReportType === 'academic'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Academic Report
            </button>
            <button
              onClick={() => setActiveReportType('feedback')}
              className={`px-6 py-3 font-semibold transition ${
                activeReportType === 'feedback'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Feedback Report
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <input className="flex-1 rounded-2xl border border-slate-200 px-4 py-3" placeholder="Search students by name or ID..." />
            <select className="rounded-2xl border border-slate-200 px-4 py-3">
              <option>Filter</option>
            </select>
            <button className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft" type="button">
              Grant Scholarship
            </button>
            <button 
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="button"
              onClick={handleExportPDF}
              disabled={isGenerating}
            >
              <FileDown className="h-5 w-5" />
              {isGenerating ? 'Generating...' : 'Export & Preview Report'}
            </button>
          </div>
        </header>
        
        <section className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[560px] table-auto text-left text-sm">
              <thead className="sticky top-0 bg-white text-slate-500 shadow-sm z-10">
                <tr>
                  {getTableHeaders().map((header, idx) => (
                    <th key={idx} className="px-3 py-2">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.table.map((row) => (
                  <tr key={row.order} className="border-t border-slate-100">
                    {getTableRow(row)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative h-[90vh] w-full max-w-6xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="text-2xl font-semibold text-ink">Report Preview</h2>
              <button
                onClick={closePreview}
                className="rounded-full p-2 transition hover:bg-slate-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <iframe
              src={pdfPreviewUrl}
              className="h-[calc(100%-80px)] w-full rounded-b-3xl"
              title="PDF Preview"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default StaffRecordsPage;
