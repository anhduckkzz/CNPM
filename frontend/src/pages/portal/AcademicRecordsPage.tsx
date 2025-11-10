import { useMemo, useState } from 'react';
import { BellRing, CheckCircle2, ChevronDown, FileText, GraduationCap, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AcademicRecordSection, StaffRecordsSection } from '../../types/portal';

type DropdownSection = {
  id: 'scholarship' | 'training' | 'academic';
  title: string;
  description: string;
  columns: Array<{ key: string; label: string; align?: 'left' | 'right'; isStatus?: boolean; isAction?: boolean }>;
  rows: Array<Record<string, string>>;
};

type HistoryTab = 'scholarship' | 'training';

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
  const [expandedSections, setExpandedSections] = useState<Record<DropdownSection['id'], boolean>>({
    scholarship: true,
    training: false,
    academic: false,
  });
  const [activeHistoryTab, setActiveHistoryTab] = useState<HistoryTab>('scholarship');

  const baseRows = useMemo(
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
        totalCredits: `${row.totalCredits} hrs`,
        semesterCredits: `${row.semesterCredits} hrs`,
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

  const toggleSection = (id: DropdownSection['id']) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
                  <div className="overflow-x-auto">
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
                                    <button type="button" className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-ink">
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
                    onClick={() => setActiveHistoryTab(tab)}
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
              <div className="overflow-x-auto">
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
    </div>
  );
};

const StudentAcademicRecords = ({ records }: { records: AcademicRecordSection }) => (
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

      <div className="rounded-3xl bg-primary/5 p-6 text-center shadow-soft">
        <p className="text-sm font-semibold text-slate-500">Cumulative GPA</p>
        <p className="mt-4 text-5xl font-bold text-primary">{records.gpa}</p>
        <p className="mt-2 text-sm text-slate-500">{records.standing}</p>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600">Course Grades</p>
            <p className="text-xs uppercase tracking-wide text-slate-400">Current semester overview</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Credits</span>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-100">
          <div className="grid grid-cols-[1fr,120px,80px] gap-4 rounded-t-2xl bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <p>Course Name</p>
            <p className="text-center">Grade</p>
            <p className="text-right">Credits</p>
          </div>
          <div>
            {records.grades.map((grade) => (
              <div key={grade.course} className="grid grid-cols-[1fr,120px,80px] gap-4 px-4 py-3 text-sm text-slate-600">
                <p className="font-medium text-ink">{grade.course}</p>
                <span className="mx-auto w-fit rounded-full bg-slate-100 px-4 py-1 text-center text-sm font-semibold text-slate-600">{grade.grade}</span>
                <span className="text-right font-semibold text-ink">{grade.credits}</span>
              </div>
            ))}
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
          {records.tutorLessons.map((lesson) => (
            <li key={lesson.title} className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3">
              <span className="font-medium text-ink">{lesson.title}</span>
              <span className="text-primary">{lesson.tutor}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  </div>
);

export default AcademicRecordsPage;
