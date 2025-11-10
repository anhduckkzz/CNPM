import { useState } from 'react';
import {
  CalendarDays,
  Clock3,
  FileText,
  FileSpreadsheet,
  FileVideo,
  Code,
  FileText as FileDoc,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type MaterialEntry = string | { title: string; type?: string };

const materialIconMap: Record<string, typeof FileText> = {
  pdf: FileDoc,
  slides: FileText,
  sheet: FileSpreadsheet,
  video: FileVideo,
  code: Code,
};

const CourseDetailPage = () => {
  const { portal } = useAuth();
  const { courseId } = useParams();
  const course = courseId ? portal?.courseDetails?.[courseId] : undefined;
  const quizSession = portal?.quizSession;
  const quizSummary = portal?.quizSummary;

  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSummaryVisible, setSummaryVisible] = useState(false);

  if (!course) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course details not available.</div>;
  }

  const canStartQuiz = quizSession && quizSession.courseId === course.id;
  const showQuizModal = Boolean(activeQuizId && canStartQuiz);
  const questions = quizSession?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];
  const minutesLeft = quizSession ? quizSession.timeLeftMinutes % 60 : 0;
  const hoursLeft = quizSession ? Math.floor(quizSession.timeLeftMinutes / 60) : 0;
  const summaryForCourse = quizSummary && quizSummary.courseId === course.id ? quizSummary : null;

  const normalizedMaterials = course.materials.map<NonNullable<MaterialEntry>>((entry) =>
    typeof entry === 'string' ? { title: entry, type: 'pdf' } : entry,
  );

  const resetQuiz = () => {
    setActiveQuizId(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSummaryVisible(false);
  };

  const openQuiz = (quizId: string) => {
    if (!canStartQuiz) return;
    setActiveQuizId(quizId);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSummaryVisible(false);
  };

  const handleSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const goToQuestion = (index: number) => {
    if (!questions.length) return;
    const clamped = Math.min(Math.max(index, 0), questions.length - 1);
    setCurrentQuestionIndex(clamped);
  };

  const handleSubmitQuiz = () => {
    setSummaryVisible(true);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Course dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{course.title}</h1>
        <p className="mt-2 text-slate-500">Upcoming sessions, materials, and quizzes curated for you.</p>
      </header>

      <section className="space-y-6">
        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Upcoming sessions</p>
              <h2 className="text-xl font-semibold text-ink">Whatâ€™s next on your calendar</h2>
              <p className="text-sm text-slate-500">Join directly from the list below.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
              {course.upcomingSessions.length} sessions
            </span>
          </div>
          <div className="mt-6 divide-y divide-slate-100">
            {course.upcomingSessions.map((session, index) => (
              <div key={session.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="flex flex-1 items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-ink">{session.title}</p>
                    <p className="text-sm text-slate-500">
                      {session.date} Â- {session.time}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
                >
                  {session.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Course material</p>
              <h2 className="text-xl font-semibold text-ink">Slides, notes, and references</h2>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {normalizedMaterials.map((material) => {
              const title = typeof material === 'string' ? material : material.title;
              const type = typeof material === 'string' ? 'pdf' : material.type ?? 'pdf';
              const Icon = materialIconMap[type] ?? FileDoc;
              return (
                <li
                  key={title}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-ink"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p>{title}</p>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{type}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Upcoming quizzes</p>
              <h2 className="text-xl font-semibold text-ink">Your assessments for the next weeks</h2>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {course.quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-ink">{quiz.title}</p>
                    <p className="text-sm text-slate-500">{quiz.category}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{quiz.date}</p>
                  <button
                    type="button"
                    disabled={!canStartQuiz}
                    onClick={() => openQuiz(quiz.id)}
                    className="text-sm font-semibold text-primary disabled:text-slate-300"
                  >
                    {quiz.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showQuizModal && quizSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
          <div className="relative flex w-full max-w-5xl flex-col rounded-[32px] bg-white p-8 shadow-2xl">
            <button
              type="button"
              onClick={resetQuiz}
              className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            >
              <X size={16} />
              <span className="sr-only">Close quiz</span>
            </button>

            {isSummaryVisible && summaryForCourse ? (
              <div className="flex flex-col items-center gap-6 py-8 text-center">
                <div className="flex items-center gap-3 text-primary">
                  <CheckCircle2 size={40} />
                  <h2 className="text-3xl font-semibold">Quiz Completed</h2>
                </div>
                <p className="text-xl font-semibold text-ink">Your Score: {summaryForCourse.score}</p>
                <div className="w-full max-w-md space-y-2 rounded-3xl bg-slate-50 p-4 text-slate-600">
                  {summaryForCourse.stats.map((item) => (
                    <p key={item.label}>
                      <span className="font-semibold text-ink">{item.label}:</span> {item.value}
                    </p>
                  ))}
                  <p>
                    <span className="font-semibold text-ink">Duration:</span> {summaryForCourse.duration}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    className="rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary"
                    onClick={() => setSummaryVisible(false)}
                  >
                    Review answers
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-soft"
                    onClick={resetQuiz}
                  >
                    Return to course
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[3fr_1fr]">
                <div className="space-y-6">
                  <div className="rounded-3xl bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{quizSession.title}</p>
                    <div className="mt-4 flex items-center gap-6 text-center">
                      <div>
                        <p className="text-4xl font-semibold text-ink">{String(hoursLeft).padStart(2, '0')}</p>
                        <p className="text-xs uppercase tracking-widest text-slate-400">Hours</p>
                      </div>
                      <div>
                        <p className="text-4xl font-semibold text-ink">{String(minutesLeft).padStart(2, '0')}</p>
                        <p className="text-xs uppercase tracking-widest text-slate-400">Minutes</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-3xl border border-slate-100 p-6">
                    {currentQuestion ? (
                      <>
                        <div>
                          <p className="text-sm font-semibold text-slate-500">
                            Question {currentQuestionIndex + 1} of {questions.length}
                          </p>
                          <p className="mt-2 text-lg font-semibold text-ink">{currentQuestion.text}</p>
                        </div>
                        <div className="space-y-2">
                          {currentQuestion.options.map((option) => {
                            const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(currentQuestion.id, option.id)}
                                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                                  isSelected
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-slate-200 bg-white text-ink hover:border-primary/40'
                                }`}
                              >
                                <span className="text-xs font-bold">{option.label}</span>
                                <span>{option.value}</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex flex-wrap justify-between gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => goToQuestion(currentQuestionIndex - 1)}
                            disabled={currentQuestionIndex === 0}
                            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 disabled:opacity-40"
                          >
                            Previous
                          </button>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => goToQuestion(currentQuestionIndex + 1)}
                              disabled={currentQuestionIndex === questions.length - 1}
                              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 disabled:opacity-40"
                            >
                              Next
                            </button>
                            <button
                              type="button"
                              onClick={handleSubmitQuiz}
                              className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-soft"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">No questions available.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-slate-100 p-6">
                  <p className="text-sm font-semibold text-slate-500">Questions</p>
                  <div className="grid grid-cols-2 gap-3">
                    {questions.map((question, index) => (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => goToQuestion(index)}
                        className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                          index === currentQuestionIndex
                            ? 'border-primary bg-primary text-white'
                            : 'border-slate-200 bg-white text-ink hover:border-primary/40'
                        }`}
                      >
                        Q{index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;


