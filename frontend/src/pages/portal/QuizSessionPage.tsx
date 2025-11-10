import { useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { courseIdFromSlug } from '../../utils/courseSlug';

const QuizSessionPage = () => {
  const navigate = useNavigate();
  const { portal, role } = useAuth();
  const { courseId: courseSlug } = useParams();
  const normalizedCourseId = courseIdFromSlug(courseSlug);
  const quiz = portal?.quizSession;
  const [selectedOption, setSelectedOption] = useState<string>();

  if (!quiz || (normalizedCourseId && quiz.courseId !== normalizedCourseId)) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Quiz session not found.</div>;
  }

  const courseTitle = useMemo(() => {
    if (!portal) return quiz.title;
    return (
      portal.courseDetails?.[quiz.courseId]?.title ??
      portal.courses?.courses?.find((course) => course.id === quiz.courseId)?.title ??
      quiz.title
    );
  }, [portal, quiz.courseId, quiz.title]);

  const submit = () => {
    if (!role || !courseSlug) return;
    navigate(`/portal/${role}/quiz/${courseSlug}/completed`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-400">{courseTitle}</p>
            <h1 className="text-2xl font-semibold text-ink">{quiz.title}</h1>
          </div>
          <div className="rounded-2xl border border-slate-100 px-6 py-3 text-center">
            <p className="text-sm text-slate-500">Times Left</p>
            <p className="text-3xl font-bold text-primary">{quiz.timeLeftMinutes.toString().padStart(2, '0')}</p>
            <p className="text-xs text-slate-400">MINUTES</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-slate-50 p-6">
          {quiz.questions.map((question) => (
            <div key={question.id}>
              <p className="text-lg font-semibold text-ink">{question.text}</p>
              <div className="mt-4 space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedOption(option.id)}
                    className={[
                      'flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition',
                      selectedOption === option.id
                        ? 'border-primary bg-primary text-white shadow-soft'
                        : 'border-slate-200 bg-white text-ink',
                    ].join(' ')}
                  >
                    <span className="rounded-full border border-current px-3 py-1 text-xs">{option.label}</span>
                    {option.value}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="mt-6 flex justify-between">
            <button className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-600" type="button">
              Previous Question
            </button>
            <button className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-600" type="button">
              Next Question
            </button>
          </div>
          <button
            type="button"
            onClick={submit}
            className="mt-4 w-full rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-soft"
          >
            Submit
          </button>
        </div>
      </div>

      <aside className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">Questions</h2>
        <div className="mt-6 grid grid-cols-4 gap-3">
          {quiz.questions.map((question, index) => (
            <span
              key={question.id}
              className={[
                'flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold',
                selectedOption ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-600',
              ].join(' ')}
            >
              {index + 1}
            </span>
          ))}
        </div>
        <div className="mt-10 space-y-3 text-sm text-slate-500">
          <p>Left-click to select an answer.</p>
          <p>Use the navigation buttons to review your responses.</p>
        </div>
      </aside>
    </div>
  );
};

export default QuizSessionPage;
