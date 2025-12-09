import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BellRing, CheckCircle2, ChevronDown, FileText, GraduationCap, Sparkles, UserRound, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { AcademicRecordSection, StaffRecordsSection } from '../../types/portal';
import { useStackedToasts } from '../../hooks/useStackedToasts';

type DropdownSection = {
  id: 'scholarship' | 'training' | 'academic';
  title: string;
  description: string;
  columns: Array<{ key: string; label: string; align?: 'left' | 'right'; isStatus?: boolean; isAction?: boolean }>;
  rows: Array<Record<string, string>>;
};

type HistoryTab = 'scholarship' | 'training';

type StaffStudentProfile = StaffRecordsSection['table'][number] & {
  numericGpa: number;
  totalCredits: string;
  semesterCredits: string;
  overallGpa: string;
  eligibility: string;
};

const SCORE_SCAN_STAGES = [
  { threshold: 15, label: 'Initializing AI scan...' },
  { threshold: 35, label: 'Mapping performance bands' },
  { threshold: 60, label: 'Scanning GPA anomalies' },
  { threshold: 85, label: 'Detecting red-flag courses' },
  { threshold: 101, label: 'Finalizing insights' },
];

const AcademicRecordsPage = () => {
  const { portal, role } = useAuth();

  if (role === 'staff') {
    if (!portal?.staffRecords) {
      return <div className="rounded-3xl bg-white p-8 shadow-soft">Academic records unavailable.</div>;
    }

    return <StaffAcademicRecords records={portal.staffRecords} />;
  }

  if (!portal?.academicRecords) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Student record missing.</div>;
  }

  return <StudentAcademicRecords records={portal.academicRecords} />;
};

const StaffAcademicRecords = ({ records }: { records: StaffRecordsSection }) => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Record<DropdownSection['id'], boolean>>({
    scholarship: true,
    training: false,
    academic: false,
  });
  const [activeHistoryTab, setActiveHistoryTab] = useState<HistoryTab>('scholarship');
  const { toasts, showToast } = useStackedToasts();
  const [detailModal, setDetailModal] = useState<{ open: boolean; studentId: string | null }>({
    open: false,
    studentId: null,
  });

  const baseRows = useMemo<StaffStudentProfile[]>(
    () =>
      records.table.map((row, index) => {
        const numericGpa = Number(row.gpa);
        return {
          ...row,
          numericGpa,
          totalCredits: (120 - index * 4).toString(),
          semesterCredits: (18 - index * 2).toString(),
          overallGpa: Math.min(4, numericGpa + 0.07).toFixed(2),
          eligibility: numericGpa >= 3.7 ? 'High Priority' : numericGpa >= 3.5 ? 'Eligible' : 'Review',
        };
      }),
    [records.table],
  );

  const dropdownSections: DropdownSection[] = [
    {
      id: 'scholarship',
      title: 'Scholarship Management',
      description: 'Monitor current scholarship nominees, GPA, and award readiness.',
      columns: [
        { key: 'studentId', label: 'Student ID' },
        { key: 'name', label: 'Name' },
        { key: 'major', label: 'Major' },
        { key: 'gpa', label: 'Current GPA' },
        { key: 'status', label: 'Status', isStatus: true },
        { key: 'action', label: 'Actions', align: 'right', isAction: true },
      ],
      rows: baseRows.map((row) => ({
        studentId: row.studentId,
        name: row.name,
        major: row.major,
        gpa: row.gpa,
        status: row.status === 'Active' ? 'Ready for Review' : row.status,
        action: 'View Details',
      })),
    },
    {
      id: 'training',
      title: 'Training Credit Management',
      description: 'Review mandatory training progress before releasing scholarships.',
      columns: [
        { key: 'studentId', label: 'Student ID' },
        { key: 'name', label: 'Name' },
        { key: 'major', label: 'Major' },
        { key: 'totalCredits', label: 'Total Training Credits' },
        { key: 'semesterCredits', label: 'Credits This Semester' },
      ],
      rows: baseRows.map((row) => ({
        studentId: row.studentId,
        name: row.name,
        major: row.major,
        totalCredits: `${Math.abs(Number(row.totalCredits))} hrs`,
        semesterCredits: `${Math.abs(Number(row.semesterCredits))} hrs`,
      })),
    },
    {
      id: 'academic',
      title: 'Student Academic Record Table',
      description: 'Validate cumulative performance and eligibility indicators.',
      columns: [
        { key: 'studentId', label: 'Student ID' },
        { key: 'name', label: 'Name' },
        { key: 'major', label: 'Major' },
        { key: 'gpa', label: 'Current GPA' },
        { key: 'overallGpa', label: 'Overall GPA' },
        { key: 'eligibility', label: 'Scholarship Eligibility', isStatus: true },
      ],
      rows: baseRows.map((row) => ({
        studentId: row.studentId,
        name: row.name,
        major: row.major,
        gpa: row.gpa,
        overallGpa: row.overallGpa,
        eligibility: row.eligibility,
      })),
    },
  ];

  const historyData: Record<HistoryTab, Array<{ id: string; name: string; major: string; amount: string; date: string }>> = {
    scholarship: [
      { id: 'GR-2354', name: 'Nguy\u1ec5n Th\u1ecb An', major: 'Computer Science', amount: '$3,500 Academic Excellence Grant', date: 'Mar 12, 2024' },
      { id: 'GR-2410', name: 'Tran Van Binh', major: 'Electrical Eng.', amount: '$2,000 Leadership Scholarship', date: 'Feb 09, 2024' },
      { id: 'GR-2468', name: 'Le Thi Cuc', major: 'Chemical Eng.', amount: '$4,200 Research Fellowship', date: 'Jan 30, 2024' },
    ],
    training: [
      { id: 'TC-8842', name: 'Pham Minh Duy', major: 'Civil Eng.', amount: '18 hrs Safety Compliance', date: 'Mar 01, 2024' },
      { id: 'TC-8891', name: 'Nguy\u1ec5n Th\u1ecb An', major: 'Computer Science', amount: '16 hrs Lab Conduct Certification', date: 'Feb 14, 2024' },
      { id: 'TC-8899', name: 'Le Thi Cuc', major: 'Chemical Eng.', amount: '20 hrs Research Lab Readiness', date: 'Feb 02, 2024' },
    ],
  };

  const quickActions = records.quickActions.map((action, index) => {
    const intents: Array<{ icon: typeof FileText; className: string }> = [
      { icon: FileText, className: 'bg-primary text-white shadow-soft shadow-primary/40' },
      { icon: GraduationCap, className: 'bg-slate-900 text-white shadow-soft shadow-slate-400/60' },
      { icon: BellRing, className: 'border border-slate-200 text-ink hover:border-primary/40' },
    ];
    const intent = intents[index] ?? intents[intents.length - 1];
    return {
      ...action,
      icon: intent.icon,
      className: intent.className,
    };
  });

  const notifications = records.notifications.map((notification, index) => ({
    ...notification,
    status: index % 2 === 0 ? 'Notified' : 'Pending',
  }));

  const studentProfiles = useMemo(
    () =>
      baseRows.reduce<Record<string, StaffStudentProfile>>((acc, entry) => {
        acc[entry.studentId] = entry;
        return acc;
      }, {}),
    [baseRows],
  );
  const selectedStudent = detailModal.studentId ? studentProfiles[detailModal.studentId] : undefined;
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  const toggleSection = (id: DropdownSection['id']) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleViewDetails = (studentId: string) => {
    if (!studentProfiles[studentId]) {
      showToast('Student record unavailable. Please refresh and try again.');
      return;
    }
    setDetailModal({ open: true, studentId });
  };

  const closeDetailModal = () => {
    setDetailModal({ open: false, studentId: null });
  };

  useEffect(() => {
    if (!detailModal.open) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDetailModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [detailModal.open]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        {records.metrics.map((metric) => (
          <div key={metric.label} className="rounded-[28px] bg-white p-6 text-center shadow-soft">
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-400">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{metric.value}</p>
            <p className="mt-1 text-sm text-slate-500">{metric.caption}</p>
          </div>
        ))}
      </section>

      {detailModal.open && selectedStudent && portalTarget &&
        createPortal(
          <div className="fixed inset-0 z-50 flex min-h-screen w-screen items-center justify-center bg-slate-900/60 px-4 py-8">
            <div className="w-full max-w-3xl rounded-[32px] bg-white shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <UserRound size={28} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Student profile</p>
                    <h3 className="text-2xl font-semibold text-ink">{selectedStudent.name}</h3>
                    <p className="text-sm text-slate-500">{selectedStudent.major}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                >
                  ×
                </button>
              </div>
              <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { label: 'Current GPA', value: selectedStudent.gpa },
                    { label: 'Overall GPA', value: selectedStudent.overallGpa },
                    { label: 'Scholarship status', value: selectedStudent.eligibility },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-100 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                      <p className="mt-2 text-xl font-semibold text-ink">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-sm font-semibold text-ink">Identity & Status</p>
                    <dl className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-400">Student ID</dt>
                        <dd className="font-semibold text-ink">{selectedStudent.studentId}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-400">Standing</dt>
                        <dd className="font-semibold text-ink">{selectedStudent.status}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-400">Credits (total)</dt>
                        <dd className="font-semibold text-ink">{selectedStudent.totalCredits}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-slate-400">Credits (semester)</dt>
                        <dd className="font-semibold text-ink">{selectedStudent.semesterCredits}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-sm font-semibold text-ink">Advisor Notes</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Maintain ≥3.5 GPA to keep current awards.
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Training credits up to date ({selectedStudent.semesterCredits} hrs this term).
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Eligible for next round of scholarship review.
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-ink">Upcoming checkpoints</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {[
                      { label: 'Midterm audit', value: 'Mar 18, 2024' },
                      { label: 'Training refresh', value: 'Apr 05, 2024' },
                      { label: 'Scholarship meeting', value: 'Apr 22, 2024' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-slate-50 p-3 text-sm">
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                        <p className="mt-1 font-semibold text-ink">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          portalTarget,
        )}

      <section className="grid gap-6 lg:grid-cols-[3fr,1fr]">
        <div className="space-y-6">
          {dropdownSections.map((section) => (
            <div key={section.id} className="rounded-[32px] bg-white shadow-soft">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <div>
                  <p className="text-base font-semibold text-ink">{section.title}</p>
                  <p className="text-sm text-slate-500">{section.description}</p>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${expandedSections[section.id] ? '' : '-rotate-90'}`} />
              </button>
              {expandedSections[section.id] && (
                <div className="border-t border-slate-100 px-6 pb-6 pt-4">
                  <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead className="text-slate-500">
                        <tr>
                          {section.columns.map((column) => (
                            <th key={column.key} className={`px-3 py-2 ${column.align === 'right' ? 'text-right' : ''}`}>
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.rows.map((row) => (
                          <tr key={`${section.id}-${row.studentId}`} className="border-t border-slate-100 text-slate-600">
                            {section.columns.map((column) => {
                              const value = row[column.key];
                              if (column.isAction) {
                                return (
                                  <td key={column.key} className="px-3 py-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => handleViewDetails(row.studentId)}
                                      className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-ink hover:border-primary/40 hover:text-primary"
                                    >
                                      {value}
                                    </button>
                                  </td>
                                );
                              }
                              if (column.isStatus) {
                                const isPositive = value === 'Notified' || value === 'High Priority' || value === 'Eligible' || value === 'Ready for Review';
                                return (
                                  <td key={column.key} className="px-3 py-3">
                                    <span
                                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                      }`}
                                    >
                                      {value}
                                    </span>
                                  </td>
                                );
                              }
                              return (
                                <td key={column.key} className={`px-3 py-3 ${column.align === 'right' ? 'text-right font-semibold text-ink' : ''}`}>
                                  {value}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="rounded-[32px] bg-white shadow-soft">
            <div className="flex flex-wrap items-center gap-3 px-6 py-5">
              <div className="flex-1">
                <p className="text-base font-semibold text-ink">Award & Training History</p>
                <p className="text-sm text-slate-500">Toggle between granted scholarships and completed training credit logs.</p>
              </div>
              <div className="flex gap-2 rounded-full bg-slate-100 p-1">
                {(['scholarship', 'training'] as HistoryTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveHistoryTab(tab);
                    }}
                    className={`rounded-full px-4 py-1 text-sm font-semibold ${
                      activeHistoryTab === tab ? 'bg-white text-ink shadow-soft' : 'text-slate-500'
                    }`}
                  >
                    {tab === 'scholarship' ? 'Granted Scholarship Records' : 'Training Credit Records'}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-100 px-6 pb-6 pt-4">
              <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Record ID</th>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Major</th>
                      <th className="px-3 py-2">{activeHistoryTab === 'scholarship' ? 'Scholarship Amount' : 'Training Credits'}</th>
                      <th className="px-3 py-2">Date Awarded</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600">
                    {historyData[activeHistoryTab].map((entry) => (
                      <tr key={entry.id} className="border-t border-slate-100">
                        <td className="px-3 py-3 font-semibold text-ink">{entry.id}</td>
                        <td className="px-3 py-3">{entry.name}</td>
                        <td className="px-3 py-3 text-slate-500">{entry.major}</td>
                        <td className="px-3 py-3 text-ink">{entry.amount}</td>
                        <td className="px-3 py-3 text-slate-500">{entry.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[32px] bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Quick Actions</h3>
            <p className="mt-1 text-sm text-slate-500">Generate the latest reports, then notify students once approvals are finalized.</p>
            <div className="mt-4 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => {
                      navigate(action.path);
                      showToast(`${action.label} opened`);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition hover:opacity-90 ${action.className}`}
                  >
                    <span>{action.label}</span>
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-ink">Recent Notifications</h3>
            <div className="mt-4 space-y-3 text-sm">
              {notifications.map((notification) => (
                <div key={notification.title} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-ink">{notification.title}</p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        notification.status === 'Notified' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}
                    >
                      {notification.status}
                    </span>
                  </div>
                  <p className="text-slate-500">{notification.body}</p>
                  <p className="text-xs text-slate-400">{notification.timeAgo}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

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
    </div>
  );
};

const StudentAcademicRecords = ({ records }: { records: AcademicRecordSection }) => {
  const { portal } = useAuth();
  const defaultGradePoints: Record<string, number> = {
    A: 4,
    B: 3,
    C: 2,
    D: 1,
    F: 0,
  };

  const [scanning, setScanning] = useState(false);
  const [scanHighlights, setScanHighlights] = useState<Set<string>>(new Set());
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalizeRef = useRef(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState(SCORE_SCAN_STAGES[0].label);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  // Generate tutor lessons dynamically from registered courses
  const tutorLessons = useMemo(() => {
    if (!portal?.courses?.courses) return [];
    
    return portal.courses.courses
      .filter((course) => course.status === 'in-progress' && course.instructor)
      .map((course) => ({
        title: course.title,
        tutor: course.instructor!,
      }));
  }, [portal?.courses?.courses]);

  const normalizeGrade = (value: string) => value.replace('+', '').trim().toUpperCase();
  const resolveScale4 = (gradeEntry: AcademicRecordSection['grades'][number]) => {
    if (typeof gradeEntry.scale4 === 'number') return gradeEntry.scale4;
    const normalized = normalizeGrade(gradeEntry.grade);
    return defaultGradePoints[normalized] ?? 0;
  };

  const gradeBands: Array<{ min10: number; letter: string; scale4: number }> = [
    { min10: 9.5, letter: 'A+', scale4: 4.0 },
    { min10: 8.5, letter: 'A', scale4: 4.0 },
    { min10: 8.0, letter: 'B+', scale4: 3.5 },
    { min10: 7.0, letter: 'B', scale4: 3.0 },
    { min10: 6.5, letter: 'C+', scale4: 2.5 },
    { min10: 6.0, letter: 'C', scale4: 2.0 },
    { min10: 5.5, letter: 'D+', scale4: 1.5 },
    { min10: 5.0, letter: 'D', scale4: 1.0 },
  ];

  const deriveGradeMetrics = (gradeEntry: AcademicRecordSection['grades'][number]) => {
    const rawScale4 = resolveScale4(gradeEntry);
    const rawScale10 = rawScale4 * 2.5;
    const matchedBand = gradeBands.find((band) => rawScale10 >= band.min10);
    return {
      letter: matchedBand?.letter ?? 'F',
      scale4Display: matchedBand?.scale4 ?? 0,
      scale10Display: Math.min(10, Math.max(0, rawScale10)),
    };
  };

  const updateStageFromProgress = (value: number) => {
    const stage = SCORE_SCAN_STAGES.find((entry) => value < entry.threshold)?.label ?? 'Polishing insights...';
    setScanStage(stage);
  };

  const finalizeScan = () => {
    if (finalizeRef.current) return;
    finalizeRef.current = true;
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
    if (scanTimer.current) {
      clearTimeout(scanTimer.current);
      scanTimer.current = null;
    }

    const flaggedCourses = records.grades
      .filter((grade) => {
        const { scale10Display } = deriveGradeMetrics(grade);
        return scale10Display < 7;
      })
      .map((grade) => grade.course);

    setScanProgress(100);
    setScanStage(flaggedCourses.length ? 'Risks detected' : 'Insights ready');
    setScanHighlights(new Set(flaggedCourses));
    setScanning(false);
    setAnalysisComplete(true);
  };

  const handleScoreAnalysis = () => {
    if (scanning) return;
    finalizeRef.current = false;
    setScanning(true);
    setAnalysisComplete(false);
    setScanHighlights(new Set());
    setScanProgress(0);
    setScanStage(SCORE_SCAN_STAGES[0].label);

    if (progressTimer.current) clearInterval(progressTimer.current);
    if (scanTimer.current) clearTimeout(scanTimer.current);

    progressTimer.current = setInterval(() => {
      setScanProgress((prev) => {
        const increment = Math.random() * 2 + 0.8;
        const nextValue = Math.min(prev + increment, 98);
        updateStageFromProgress(nextValue);
        return nextValue;
      });
    }, 120);

    scanTimer.current = setTimeout(finalizeScan, 4200);
  };

  useEffect(() => {
    return () => {
      if (scanTimer.current) {
        clearTimeout(scanTimer.current);
        scanTimer.current = null;
      }
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!showSyllabus) return;
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowSyllabus(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showSyllabus]);

  const { computedGpa, totalCredits } = useMemo(() => {
    if (!records.grades.length) {
      return { computedGpa: '0.0', totalCredits: 0 };
    }

    const totals = records.grades.reduce(
      (acc, gradeEntry) => {
        const { scale4Display } = deriveGradeMetrics(gradeEntry);
        return {
          credits: acc.credits + gradeEntry.credits,
          totalPoints: acc.totalPoints + scale4Display * gradeEntry.credits,
        };
      },
      { credits: 0, totalPoints: 0 },
    );

    return {
      computedGpa: totals.credits ? (totals.totalPoints / totals.credits).toFixed(1) : '0.0',
      totalCredits: totals.credits,
    };
  }, [records.grades]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <section className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Student Information</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">{records.studentInfo.name}</h1>
          </div>
          <dl className="mt-6 space-y-3 text-sm">
            {[
              { label: 'Name', value: records.studentInfo.name },
              { label: 'Student ID', value: records.studentInfo.studentId },
              { label: 'Semester', value: records.studentInfo.semester },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                <dt className="font-medium text-slate-500">{label}:</dt>
                <dd className="text-base font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowSyllabus(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary/30 hover:text-primary"
          >
            <FileText className="h-4 w-4" />
            Syllabus
          </button>
        </div>

        <div className="rounded-3xl bg-primary/5 p-6 text-center shadow-soft">
          <p className="text-sm font-semibold text-slate-500">Cumulative GPA</p>
          <p className="mt-4 text-5xl font-bold text-primary">{computedGpa}</p>
          <p className="mt-2 text-sm text-slate-500">{records.standing}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">{totalCredits} CS credits tracked</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600">Course Grades</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">Current semester overview</p>
            </div>
            <button
              type="button"
              onClick={handleScoreAnalysis}
              disabled={scanning}
              className={`group inline-flex items-center gap-2 rounded-full border border-primary/40 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary transition hover:border-primary hover:from-primary/20 hover:to-primary/20 hover:shadow-[0_0_18px_rgba(79,70,229,0.35)] ${
                scanning ? 'cursor-not-allowed opacity-70' : ''
              }`}
            >
              <Sparkles
                className={`h-3.5 w-3.5 text-primary transition group-hover:scale-110 group-hover:text-primary ${
                  scanning ? 'animate-spin' : ''
                }`}
              />
              {scanning ? 'Scanning...' : 'Score Analysis'}
            </button>
          </div>
          {scanning && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3 w-3 text-primary" />
              AI is scanning all course scores...
            </div>
          )}
          {!scanning && analysisComplete && (
            <p
              className={`mt-3 text-xs font-semibold ${
                scanHighlights.size ? 'text-rose-500' : 'text-emerald-600'
              }`}
            >
              {scanHighlights.size
                ? `AI flagged ${scanHighlights.size} course${scanHighlights.size > 1 ? 's' : ''} under 7.0`
                : 'Great! All courses meet the 7.0 threshold.'}
            </p>
          )}
          <div
            className={`relative mt-4 overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-soft transition ${
              scanning ? 'ring-2 ring-primary/20 shadow-[0_0_35px_rgba(79,70,229,0.25)]' : ''
            }`}
          >
      {scanning && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[28px] bg-slate-900/55 text-white backdrop-blur-md">
                <div className="ai-scan-grid relative w-[90%] max-w-lg space-y-4 rounded-[32px] border border-primary/40 bg-white/10 p-6 text-center shadow-2xl">
                  <div className="ai-scan-beam" />
                  <div className="relative flex items-center justify-between text-[10px] uppercase tracking-[0.5em] text-white">
                    <span>AI score scan</span>
                    <span>{Math.round(scanProgress)}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/50 via-emerald-300 to-primary/80 transition-all duration-200"
                      style={{ width: `${Math.min(scanProgress, 100)}%` }}
                    />
                  </div>
                  <p className="relative text-sm font-semibold text-white">{scanStage}</p>
                  <p className="relative text-xs text-white/85">Scanning course grade records for anomalies...</p>
                </div>
              </div>
      )}

      {showSyllabus && portalTarget &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex min-h-screen w-screen items-center justify-center bg-slate-900/50 px-4 py-8"
            onClick={() => setShowSyllabus(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="w-full max-w-4xl rounded-[32px] bg-white p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Course Reference</p>
                  <h3 className="text-2xl font-semibold text-ink">Syllabus</h3>
                  <p className="text-sm text-slate-500">Review the complete syllabus document for this academic cycle.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSyllabus(false)}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-primary/30 hover:text-primary"
                  aria-label="Close syllabus"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <iframe
                title="Course syllabus"
                src="/syllabus.pdf#toolbar=0&zoom=100"
                className="mt-6 h-[72vh] w-full rounded-2xl border border-slate-100"
              />
            </div>
          </div>,
          portalTarget,
        )}
            <div className="grid grid-cols-[1fr,120px,110px,110px,80px] gap-4 rounded-t-2xl bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <p>Course Name</p>
              <p className="text-center">Grade</p>
              <p className="text-center">GPA (4.0)</p>
              <p className="text-center">GPA (10.0)</p>
              <p className="text-center">Credits</p>
            </div>
            <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {records.grades.map((grade) => {
                const { letter, scale4Display, scale10Display } = deriveGradeMetrics(grade);
                const flagged = scanHighlights.has(grade.course);
                return (
                  <div
                    key={grade.course}
                    className={`grid grid-cols-[1fr,120px,110px,110px,80px] gap-4 px-4 py-3 text-sm text-slate-600 transition ${
                      flagged
                        ? 'border-l-4 border-primary/30 bg-gradient-to-r from-primary/5 via-primary/5 to-transparent text-primary shadow-[inset_0_0_0_1px_rgba(79,70,229,0.12)]'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <p className={`font-medium ${flagged ? 'text-primary' : 'text-ink'}`}>{grade.course}</p>
                    <span
                      className={`mx-auto inline-flex h-8 w-20 items-center justify-center rounded-full text-sm font-semibold ${
                        flagged
                          ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {letter}
                    </span>
                    <div
                      className={`flex h-full items-center justify-center text-center text-base font-semibold tabular-nums ${
                        flagged ? 'text-primary' : 'text-ink'
                      }`}
                    >
                      {scale4Display.toFixed(1)}
                    </div>
                    <div
                      className={`flex h-full items-center justify-center text-center text-base font-semibold tabular-nums ${
                        flagged ? 'text-primary' : 'text-ink'
                      }`}
                    >
                      {scale10Display.toFixed(1)}
                    </div>
                    <div
                      className={`flex h-full items-center justify-center text-center text-base font-semibold ${
                        flagged ? 'text-primary' : 'text-ink'
                      }`}
                    >
                      {grade.credits}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-ink">Scholarship Eligibility</h3>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">{records.eligibility.status}</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-600">Criteria Assessment</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            {records.eligibility.criteria.map((criterion) => (
              <li key={criterion} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2 text-primary">
            <GraduationCap className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-ink">Eligible Scholarships</h3>
          </div>
          <div className="mt-4 space-y-4">
            {records.scholarships.map((scholarship) => (
              <div key={scholarship.title} className="flex items-start justify-between border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                <div className="pr-4">
                  <p className="font-semibold text-ink">{scholarship.title}</p>
                  <p className="text-sm text-slate-500">{scholarship.description}</p>
                </div>
                <p className="text-sm font-semibold text-primary">{scholarship.amount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2 text-primary">
            <UserRound className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-ink">Tutor Program Lessons</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {tutorLessons.length > 0 ? (
              tutorLessons.map((lesson) => (
                <li key={lesson.title} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
                  <span className="font-medium text-ink">{lesson.title}</span>
                  <span className="text-primary">{lesson.tutor}</span>
                </li>
              ))
            ) : (
              <li className="text-center text-slate-400 py-2">No active courses with instructors</li>
            )}
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default AcademicRecordsPage;
