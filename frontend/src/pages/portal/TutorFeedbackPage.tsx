import { useState, useMemo, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStackedToasts } from '../../hooks/useStackedToasts';

const TutorFeedbackPage = () => {
  const { portal, role, updatePortal } = useAuth();
  const data = portal?.tutorFeedback;
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionReflection, setSessionReflection] = useState('Session was insightful and promoted active learning.');
  const [systemFeedback, setSystemFeedback] = useState('Improve performance and navigation clarity.');
  const [sessionRating, setSessionRating] = useState(data?.sessionRating || 5);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const { toasts, showToast } = useStackedToasts();

  // Helper to parse various date formats
  const parseSessionDate = useCallback((dateStr: string): Date | null => {
    try {
      // Handle "Monday, Oct 6" format
      const monthMap: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      
      const match = dateStr.match(/(\w+),\s*(\w+)\s+(\d+)/i);
      if (match) {
        const [, , month, day] = match;
        const monthNum = monthMap[month.toLowerCase().slice(0, 3)];
        if (monthNum !== undefined) {
          const year = 2025; // Current academic year
          return new Date(year, monthNum, parseInt(day));
        }
      }
      
      // Try standard date parsing
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    } catch (e) {
      // Ignore parse errors
    }
    return null;
  }, []);

  // Generate available sessions from registered in-progress courses
  const availableSessions = useMemo(() => {
    const sessions: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get in-progress courses (courses tutor is teaching)
    const inProgressCourses = portal?.courses?.courses?.filter(
      (course) => course.status === 'in-progress'
    ) || [];

    inProgressCourses.forEach((course) => {
      const courseDetails = portal?.courseDetails?.[course.id];
      if (!courseDetails?.upcomingSessions) return;

      courseDetails.upcomingSessions.forEach((session) => {
        // Parse session date
        const sessionDate = parseSessionDate(session.date);
        if (sessionDate && sessionDate < today) {
          // Only include past sessions
          const formattedSession = `${course.code || course.id.toUpperCase()} - ${session.title} - ${session.date}`;
          sessions.push(formattedSession);
        }
      });
    });

    return sessions;
  }, [portal?.courses?.courses, portal?.courseDetails, parseSessionDate]);

  if (role !== 'tutor') {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Tutor feedback is only available for tutors.</div>;
  }

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Tutor feedback data unavailable.</div>;
  }

  const handleSubmit = async () => {
    if (!selectedSession) {
      showToast('Please select a session');
      return;
    }

    if (!portal?.tutorFeedback) {
      showToast('Tutor feedback data unavailable');
      return;
    }

    const newFeedback = {
      id: Date.now().toString(),
      course: selectedSession,
      submittedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating: sessionRating,
      status: sessionRating >= 5 ? 'System: Excellent' : sessionRating >= 4 ? 'System: Good' : 'System: Neutral',
      summary: sessionReflection.slice(0, 60) + (sessionReflection.length > 60 ? '...' : '')
    };

    await updatePortal((prev) => ({
      ...prev,
      tutorFeedback: {
        ...prev.tutorFeedback!,
        history: [newFeedback, ...prev.tutorFeedback!.history]
      }
    }));
    
    // Reset form
    setSelectedSession('');
    setSessionReflection('Session was insightful and promoted active learning.');
    setSystemFeedback('Improve performance and navigation clarity.');
    setSessionRating(5);
    
    // Switch to history tab to show the new feedback
    setActiveTab('history');
    
    showToast('Feedback submitted successfully and added to history');
  };

  return (
    <>
      {toasts.length > 0 && (
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
      )}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setActiveTab('submit')}
          className={`rounded-2xl px-6 py-3 font-semibold transition ${
            activeTab === 'submit'
              ? 'bg-primary text-white shadow-soft'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Submit Feedback
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`rounded-2xl px-6 py-3 font-semibold transition ${
            activeTab === 'history'
              ? 'bg-primary text-white shadow-soft'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Feedback History
        </button>
      </div>

      {activeTab === 'submit' ? (
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">Tutor Feedback and Evaluation</h1>
        <p className="mt-2 text-slate-500">Monitor attendance, capture reflections, and submit system feedback.</p>
        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-100">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">In-class Score</th>
              </tr>
            </thead>
            <tbody>
              {data.attendance.map((entry) => {
                const scorePercent = entry.inClassScore * 10;
                const isLowScore = scorePercent < 50;
                return (
                  <tr key={entry.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-ink">{entry.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs ${entry.attended ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {entry.attended ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${isLowScore ? 'text-red-600' : 'text-green-600'}`}>
                        {scorePercent}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-500">
            Select Session
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
            >
              <option value="">Choose a session...</option>
              {availableSessions.length > 0 ? (
                availableSessions.map((session) => (
                  <option key={session} value={session}>{session}</option>
                ))
              ) : (
                <option disabled>No past sessions available</option>
              )}
            </select>
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-500">
            Session Reflection
            <textarea 
              className="mt-2 h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" 
              value={sessionReflection}
              onChange={(e) => setSessionReflection(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-500">
            System Feedback
            <textarea 
              className="mt-2 h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" 
              value={systemFeedback}
              onChange={(e) => setSystemFeedback(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Overall System Experience</p>
          <input 
            type="range" 
            min={1} 
            max={7} 
            value={sessionRating} 
            onChange={(e) => setSessionRating(Number(e.target.value))}
            className="mt-4 w-full accent-primary" 
          />
          <p className="mt-2 text-center text-sm text-slate-600">Rating: {sessionRating}/7</p>
        </div>
        <button 
          className="mt-6 w-full rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-primary/90" 
          type="button"
          onClick={handleSubmit}
        >
          Submit Tutor Feedback
        </button>
      </section>

      <aside className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">History</h2>
        <div className="mt-4 space-y-4">
          {data.history.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-ink">{item.course}</p>
              <p className="text-xs text-slate-400">Submitted on {item.submittedOn}</p>
              <p className="mt-2 text-sm text-slate-500">{item.summary}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
      ) : (
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-ink">Feedback History</h2>
          <p className="mt-2 text-sm text-slate-500">All your submitted feedback and their status</p>
          <div className="mt-6 space-y-4">
            {data.history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-semibold text-ink">{item.course}</p>
                    <p className="mt-1 text-xs text-slate-400">Submitted on {item.submittedOn}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                      {item.status}
                    </span>
                    <span className="font-semibold text-slate-600">Rating: {item.rating}/7</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TutorFeedbackPage;
