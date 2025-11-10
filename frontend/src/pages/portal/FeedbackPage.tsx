import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FeedbackPage = () => {
  const { portal } = useAuth();
  const feedback = portal?.feedback;
  const [rating, setRating] = useState(4);
  const [experience, setExperience] = useState(4);

  if (!feedback) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Feedback data unavailable.</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <p className="text-sm uppercase tracking-widest text-slate-400">{feedback.title}</p>
        <h1 className="text-3xl font-semibold text-ink">{feedback.instructions}</h1>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-500">
            Select Session
            <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3">
              {feedback.sessions.map((session) => (
                <option key={session}>{session}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-500">
            Session Comments
            <textarea
              className="mt-2 h-28 w-full rounded-2xl border border-slate-200 px-4 py-3"
              defaultValue="The session was very insightful and promoted active learning."
            />
          </label>
          <div>
            <p className="text-sm font-semibold text-slate-500">Session Rating</p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRating(index)}
                  className="text-primary"
                >
                  <Star
                    size={28}
                    className={index <= rating ? 'fill-primary text-primary' : 'text-slate-200'}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">Overall System Experience</p>
            <input
              type="range"
              min={1}
              max={feedback.ratingScale.length}
              value={experience}
              onChange={(e) => setExperience(Number(e.target.value))}
              className="mt-4 w-full accent-primary"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              {feedback.ratingScale.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          </div>
          <label className="block text-sm font-semibold text-slate-500">
            System Feedback
            <textarea
              className="mt-2 h-24 w-full rounded-2xl border border-slate-200 px-4 py-3"
              defaultValue="Please improve system performance and navigation clarity."
            />
          </label>
          <button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft" type="button">
            Submit Student Feedback
          </button>
        </div>
      </section>

      <aside className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">Feedback History</h2>
        <div className="mt-4 space-y-4">
          {feedback.history.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-ink">{item.course}</p>
              <p className="text-xs text-slate-400">Submitted on {item.submittedOn}</p>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                  {item.status}
                </span>
                <span className="text-slate-400">{'★'.repeat(item.rating)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{item.summary}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default FeedbackPage;
