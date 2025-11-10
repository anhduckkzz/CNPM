import { useAuth } from '../../context/AuthContext';

const QuizSummaryPage = () => {
  const { portal } = useAuth();
  const summary = portal?.quizSummary;

  if (!summary) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Quiz summary is not ready.</div>;
  }

  return (
    <div className="rounded-[32px] bg-white p-12 text-center shadow-soft">
      <h1 className="text-4xl font-semibold text-primary">{summary.title}</h1>
      <p className="mt-4 text-xl font-semibold text-ink">Your Score: {summary.score}</p>
      <div className="mt-6 space-y-3 text-slate-600">
        <p>Duration {summary.duration}</p>
        {summary.stats.map((stat) => (
          <p key={stat.label}>
            <span className="font-semibold text-ink">{stat.label}:</span> {stat.value}
          </p>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-600" type="button">
          Review
        </button>
        <button className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft" type="button">
          Return to Homepage
        </button>
      </div>
    </div>
  );
};

export default QuizSummaryPage;
