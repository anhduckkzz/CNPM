import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown, X } from 'lucide-react';

type ReportType = 'scholarship' | 'academic' | 'feedback';

const StaffRecordsPage = () => {
  const { portal, role } = useAuth();
  const records = portal?.staffRecords;
  const [activeReportType, setActiveReportType] = useState<ReportType>('scholarship');
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const generatePDF = (reportType: ReportType): Blob => {
    if (!records) return new Blob();

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add header with branding
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('HCMUT Portal', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    
    const reportTitles = {
      scholarship: 'Scholarship & Training Credit Report',
      academic: 'Academic Performance Report',
      feedback: 'Feedback Generation Report'
    };
    doc.text(reportTitles[reportType], pageWidth / 2, 30, { align: 'center' });

    // Add report metadata
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Generated: ${currentDate}`, 14, 50);
    doc.text(`Report Type: ${reportTitles[reportType]}`, 14, 56);

    // Add title section
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    
    let tableHeaders: string[];
    let tableData: any[][];
    
    if (reportType === 'scholarship') {
      doc.text('Scholarship & Training Credit Management', 14, 68);
      tableHeaders = ['#', 'Student ID', 'Student Name', 'Major', 'GPA', 'Status', 'Decision'];
      tableData = records.table.map((row) => [
        row.order.toString(),
        row.studentId || 'N/A',
        row.name || 'Unknown',
        row.major || 'N/A',
        row.gpa || 'N/A',
        row.status === 'Active' ? '✓ Active' : '✗ Inactive',
        row.status === 'Active' ? '☑' : '☐'
      ]);
    } else if (reportType === 'academic') {
      doc.text('Academic Performance Analysis', 14, 68);
      tableHeaders = ['#', 'Student ID', 'Name', 'Major', 'GPA', 'Conduct Score', 'Standing'];
      tableData = records.table.map((row) => [
        row.order.toString(),
        row.studentId || 'N/A',
        row.name || 'Unknown',
        row.major || 'N/A',
        row.gpa || 'N/A',
        Math.round(Number(row.gpa || 0) * 25).toString(),
        Number(row.gpa || 0) >= 3.5 ? 'Excellent' : Number(row.gpa || 0) >= 3.0 ? 'Good' : 'Fair'
      ]);
    } else {
      doc.text('Student Feedback Summary', 14, 68);
      tableHeaders = ['#', 'Student ID', 'Name', 'Major', 'GPA', 'Status', 'Attendance'];
      tableData = records.table.map((row) => [
        row.order.toString(),
        row.studentId || 'N/A',
        row.name || 'Unknown',
        row.major || 'N/A',
        row.gpa || 'N/A',
        row.status === 'Active' ? 'Active' : 'Inactive',
        row.status === 'Active' ? '85%' : '60%'
      ]);
    }

    // Add table with custom styling
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 76,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 5
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: [51, 65, 85]
      },
      columnStyles: reportType === 'scholarship' ? {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 45, fontStyle: 'bold' },
        3: { cellWidth: 35 },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
        6: { cellWidth: 20, halign: 'center' }
      } : {},
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data: any) => {
        const pageCount = (doc as any).internal.pages.length - 1;
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          'HCMUT - Ho Chi Minh City University of Technology',
          pageWidth / 2,
          pageHeight - 6,
          { align: 'center' }
        );
      }
    });

    // Add summary section
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 14, finalY);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Students: ${records.table.length}`, 14, finalY + 7);
    const activeCount = records.table.filter(row => row.status === 'Active').length;
    doc.text(`Active Students: ${activeCount}`, 14, finalY + 14);
    const averageGPA = (
      records.table.reduce((sum, row) => sum + Number(row.gpa || 0), 0) / records.table.length
    ).toFixed(2);
    doc.text(`Average GPA: ${averageGPA}`, 14, finalY + 21);

    return doc.output('blob');
  };

  const handleExportPDF = () => {
    const pdfBlob = generatePDF(activeReportType);
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
            <input className="flex-1 rounded-2xl border border-slate-200 px-4 py-3" placeholder="Search students by name or ID…" />
            <select className="rounded-2xl border border-slate-200 px-4 py-3">
              <option>Filter</option>
            </select>
            <button className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft" type="button">
              Grant Scholarship
            </button>
            <button 
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-emerald-700" 
              type="button"
              onClick={handleExportPDF}
            >
              <FileDown className="h-5 w-5" />
              Export & Preview Report
            </button>
          </div>
        </header>
        
        <section className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] table-auto text-left text-sm">
              <thead className="text-slate-500">
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
