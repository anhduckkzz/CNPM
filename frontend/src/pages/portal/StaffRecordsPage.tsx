import { useAuth } from '../../context/AuthContext';

const StaffRecordsPage = () => {
  const { portal, role } = useAuth();
  const records = portal?.staffRecords;

  if (role !== 'staff' || !records) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Staff controls unavailable.</div>;
  }

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <p className="text-sm uppercase tracking-widest text-slate-400">{records.tabs[1]}</p>
        <h1 className="text-3xl font-semibold text-ink">Scholarship & Training Credit Management</h1>
        <div className="mt-6 flex flex-wrap gap-4">
          <input className="flex-1 rounded-2xl border border-slate-200 px-4 py-3" placeholder="Search students by name or ID…" />
          <select className="rounded-2xl border border-slate-200 px-4 py-3">
            <option>Filter</option>
          </select>
          <button className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft" type="button">
            Grant Scholarship
          </button>
        </div>
      </header>
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="w-12 px-3 py-2">#</th>
              <th className="px-3 py-2">Student Name</th>
              <th className="px-3 py-2">Student Conduct Score</th>
              <th className="px-3 py-2">Attendance (80%)</th>
              <th className="px-3 py-2 text-center">Decision</th>
            </tr>
          </thead>
          <tbody>
            {records.table.map((row) => (
              <tr key={row.order} className="border-t border-slate-100">
                <td className="px-3 py-3 text-slate-500">{row.order}</td>
                <td className="px-3 py-3 font-semibold text-ink">{row.name}</td>
                <td className="px-3 py-3 text-slate-500">{Math.round(Number(row.gpa) * 25)}</td>
                <td className="px-3 py-3 text-slate-500">{row.status === 'Active' ? '✔' : ''}</td>
                <td className="px-3 py-3 text-center">
                  <input type="checkbox" className="h-5 w-5 rounded border-slate-300 accent-primary" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StaffRecordsPage;
