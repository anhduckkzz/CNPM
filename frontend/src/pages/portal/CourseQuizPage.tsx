import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Timer, Trophy, Target, BarChart3, Activity, X, ClipboardList, History } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { courseIdFromSlug, toCourseSlug } from '../../utils/courseSlug';
import type { CourseDetailSection } from '../../types/portal';

type QuizOption = { id: string; label: string; value: string };

type QuizHistoryEntry = {
  attemptLabel: string;
  timestamp: string;
  duration: string;
  scorePercent: number;
  status: 'Completed' | 'Expired' | 'Missed';
};

type QuizGradeStats = {
  best: number;
  latest: number;
  average: number;
};

interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  correctOptionId: string;
}

interface QuizContent {
  quizId: string;
  title: string;
  category: string;
  date: string;
  description: string;
  timeLimitMinutes: number;
  durationLabel: string;
  weight: string;
  focusAreas: string[];
  maxAttempts: number;
  gradeStats: QuizGradeStats;
  history: QuizHistoryEntry[];
  questions: QuizQuestion[];
}

interface QuizResultSummary {
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  answeredCount: number;
  timeSpentMinutes: number;
  summaryStats: Array<{ label: string; value: string }>;
  focusAreas: string[];
}

interface QuestionTemplate {
  text: string;
  options: string[];
  answerIndex: number;
}

interface CourseMeta {
  timeLimitMinutes: number;
  durationLabel: string;
  weight: string;
  focusAreas: string[];
  description: (courseTitle: string) => string;
  maxAttempts: number;
  gradeStats: QuizGradeStats;
  history: QuizHistoryEntry[];
}

const formatCountdown = (totalSeconds: number) => {
  const safeSeconds = Math.max(totalSeconds, 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const COURSE_META: Record<string, CourseMeta> = {
  'c-data-structures': {
    timeLimitMinutes: 25,
    durationLabel: '25 minutes',
    weight: '20% of module grade',
    focusAreas: [
      'Stability vs. performance trade-offs in hybrid sorting',
      'Queue discipline for BFS and task schedulers',
      'Refreshing amortized analysis for stacks & deques',
    ],
    description: (title) =>
      `Checkpoint for ${title} focusing on translating theory into clear implementation decisions.`,
    maxAttempts: 3,
    gradeStats: { best: 94, latest: 88, average: 86 },
    history: [
      {
        attemptLabel: 'Attempt 1',
        timestamp: 'Sep 08, 2025 - 08:05 AM',
        duration: '23m',
        scorePercent: 82,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 2',
        timestamp: 'Sep 15, 2025 - 08:12 AM',
        duration: '24m',
        scorePercent: 88,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 3',
        timestamp: 'Sep 22, 2025 - 08:01 AM',
        duration: '25m',
        scorePercent: 94,
        status: 'Completed',
      },
    ],
  },
  'c-intro-programming': {
    timeLimitMinutes: 20,
    durationLabel: '20 minutes',
    weight: '10% of course grade',
    focusAreas: [
      'Solidifying block scope and declaration keywords',
      'Practicing pure functions & predictable returns',
      'Choosing the right iteration helper per scenario',
    ],
    description: (title) =>
      `A friendly pulse-check on ${title} fundamentals before moving into larger projects.`,
    maxAttempts: 4,
    gradeStats: { best: 91, latest: 84, average: 87 },
    history: [
      {
        attemptLabel: 'Practice run',
        timestamp: 'Sep 05, 2025 - 07:55 AM',
        duration: '18m',
        scorePercent: 78,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 1',
        timestamp: 'Sep 12, 2025 - 08:02 AM',
        duration: '19m',
        scorePercent: 91,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 2',
        timestamp: 'Sep 19, 2025 - 08:06 AM',
        duration: '20m',
        scorePercent: 84,
        status: 'Completed',
      },
    ],
  },
  'c-advanced-calculus': {
    timeLimitMinutes: 30,
    durationLabel: '30 minutes',
    weight: '25% of module grade',
    focusAreas: [
      'Exact differentiation of trigonometric families',
      'Integral interpretations that rely on limits',
      'Series convergence criteria and Jacobians',
    ],
    description: (title) =>
      `Evaluate how confidently you can move between symbolic and geometric thinking in ${title}.`,
    maxAttempts: 2,
    gradeStats: { best: 89, latest: 76, average: 82 },
    history: [
      {
        attemptLabel: 'Midterm warm-up',
        timestamp: 'Sep 03, 2025 - 09:10 AM',
        duration: '27m',
        scorePercent: 89,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 1',
        timestamp: 'Sep 17, 2025 - 09:00 AM',
        duration: '30m',
        scorePercent: 76,
        status: 'Completed',
      },
    ],
  },
  'c-quantum-physics': {
    timeLimitMinutes: 35,
    durationLabel: '35 minutes',
    weight: '15% of course grade',
    focusAreas: [
      'Translating superposition into measurement predictions',
      'Remembering governing equations for state evolution',
      'Connecting Bloch sphere intuition to qubit math',
    ],
    description: (title) =>
      `Scenario-based assessment for ${title} with emphasis on interpretation and notation discipline.`,
    maxAttempts: 3,
    gradeStats: { best: 93, latest: 90, average: 88 },
    history: [
      {
        attemptLabel: 'Calibration',
        timestamp: 'Sep 04, 2025 - 10:15 AM',
        duration: '32m',
        scorePercent: 85,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 1',
        timestamp: 'Sep 11, 2025 - 10:05 AM',
        duration: '34m',
        scorePercent: 93,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 2',
        timestamp: 'Sep 18, 2025 - 10:01 AM',
        duration: '35m',
        scorePercent: 90,
        status: 'Completed',
      },
    ],
  },
  'c-literary-analysis': {
    timeLimitMinutes: 25,
    durationLabel: '25 minutes',
    weight: '15% of seminar grade',
    focusAreas: [
      'Keeping narrator reliability in focus',
      'Pulling textual evidence for motifs',
      'Describing devices without plot summary',
    ],
    description: (title) =>
      `Structured reflection on ${title} techniques to prep for in-class workshop critiques.`,
    maxAttempts: 5,
    gradeStats: { best: 96, latest: 90, average: 92 },
    history: [
      {
        attemptLabel: 'Prompt rehearsal',
        timestamp: 'Sep 06, 2025 - 02:00 PM',
        duration: '21m',
        scorePercent: 90,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 1',
        timestamp: 'Sep 13, 2025 - 02:05 PM',
        duration: '24m',
        scorePercent: 96,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 2',
        timestamp: 'Sep 20, 2025 - 02:04 PM',
        duration: '25m',
        scorePercent: 90,
        status: 'Completed',
      },
    ],
  },
  'c-cellular-biology': {
    timeLimitMinutes: 30,
    durationLabel: '30 minutes',
    weight: '20% of lab grade',
    focusAreas: [
      'Linking organelle structure to energy yield',
      'Sequencing mitosis & meiosis checkpoints',
      'Tracking transcription enzymes and outcomes',
    ],
    description: (title) =>
      `Hands-on readiness quiz for ${title} before entering the next wet-lab block.`,
    maxAttempts: 3,
    gradeStats: { best: 88, latest: 80, average: 82 },
    history: [
      {
        attemptLabel: 'Lab readiness',
        timestamp: 'Sep 07, 2025 - 01:30 PM',
        duration: '28m',
        scorePercent: 88,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 1',
        timestamp: 'Sep 14, 2025 - 01:35 PM',
        duration: '29m',
        scorePercent: 80,
        status: 'Completed',
      },
      {
        attemptLabel: 'Attempt 2',
        timestamp: 'Sep 21, 2025 - 01:33 PM',
        duration: '30m',
        scorePercent: 78,
        status: 'Expired',
      },
    ],
  },
};

const QUESTION_LIBRARY: Record<string, QuestionTemplate[]> = {
  'c-data-structures': [
    {
      text: 'Which sorting algorithm guarantees stability and O(n log n) worst-case performance?',
      options: ['Merge sort', 'Quick sort', 'Heap sort', 'Shell sort'],
      answerIndex: 0,
    },
    {
      text: 'What data structure keeps breadth-first search traversal in the correct order?',
      options: ['Queue', 'Stack', 'Priority queue', 'Binary tree'],
      answerIndex: 0,
    },
    {
      text: "Prim's algorithm relies on which structure to pick the next lightest edge efficiently?",
      options: ['Priority queue', 'Hash table', 'Max heap', 'Linked list'],
      answerIndex: 0,
    },
    {
      text: 'In amortized analysis, which structure offers O(1) insert/remove at both ends?',
      options: ['Deque', 'Array list', 'Binary search tree', 'Min heap'],
      answerIndex: 0,
    },
  ],
  'c-intro-programming': [
    {
      text: 'Which keyword declares a block-scoped constant in modern JavaScript?',
      options: ['var', 'let', 'const', 'static'],
      answerIndex: 2,
    },
    {
      text: 'Calling return inside a function will...',
      options: [
        'Exit the function and send back a value',
        'Log the current scope automatically',
        'Store the value in global scope',
        'Pause execution until resumed manually',
      ],
      answerIndex: 0,
    },
    {
      text: 'Which array helper creates a new array based on transformed elements?',
      options: ['forEach', 'map', 'reduce', 'filter'],
      answerIndex: 1,
    },
    {
      text: 'Which of the following values is considered falsy?',
      options: ['[]', '1', 'null', '"false"'],
      answerIndex: 2,
    },
  ],
  'c-advanced-calculus': [
    {
      text: 'What is the derivative of sin(x)?',
      options: ['cos(x)', '-cos(x)', '-sin(x)', 'sec(x)tan(x)'],
      answerIndex: 0,
    },
    {
      text: 'The integral of (1/x) dx evaluates to...',
      options: ['x^2 / 2 + C', 'ln|x| + C', '1 / (x^2) + C', 'e^x + C'],
      answerIndex: 1,
    },
    {
      text: 'The series sum (1 / n^2) from n = 1 to infinity...',
      options: [
        'Diverges by harmonic test',
        'Converges by p-series',
        'Is conditionally convergent',
        'Is undefined',
      ],
      answerIndex: 1,
    },
    {
      text: 'A Jacobian determinant captures which geometric idea?',
      options: [
        'Local volume or area scaling',
        'Instantaneous slope of a curve',
        'Average value across an interval',
        'Absolute error bound',
      ],
      answerIndex: 0,
    },
  ],
  'c-quantum-physics': [
    {
      text: 'Which principle states that some pairs of observables cannot be measured simultaneously with arbitrary precision?',
      options: [
        'Correspondence principle',
        'Pauli exclusion principle',
        'Heisenberg uncertainty principle',
        'Fermi-Dirac statistics',
      ],
      answerIndex: 2,
    },
    {
      text: 'Which equation governs the time evolution of a quantum state?',
      options: [
        "Maxwell's equations",
        'Schrodinger equation',
        'Dirac delta function',
        'Planck radiation law',
      ],
      answerIndex: 1,
    },
    {
      text: 'The surface used to visualize qubit states is called the...',
      options: ['Poincare disk', 'Bloch sphere', 'Einstein field', 'Hilbert cone'],
      answerIndex: 1,
    },
    {
      text: 'Squaring the magnitude of a wavefunction yields...',
      options: [
        'An energy eigenvalue',
        'A probability density',
        'A normalization constant',
        'The system entropy',
      ],
      answerIndex: 1,
    },
  ],
  'c-literary-analysis': [
    {
      text: "A narrator who knows every character's thoughts is described as...",
      options: ['Objective', 'Limited first-person', 'Omniscient third-person', 'Unreliable'],
      answerIndex: 2,
    },
    {
      text: 'Synecdoche is a device where...',
      options: [
        'A part stands in for the whole',
        'Human traits are given to objects',
        'An idea is repeated for emphasis',
        'Two unlike things are compared using "like"',
      ],
      answerIndex: 0,
    },
    {
      text: 'A recurring image or phrase that reinforces the central idea is called a...',
      options: ['Allusion', 'Motif', 'Metonymy', 'Juxtaposition'],
      answerIndex: 1,
    },
    {
      text: 'Close reading primarily asks you to...',
      options: [
        'Summarize plot beats quickly',
        'Memorize author biography',
        'Analyze textual evidence line-by-line',
        'Compare the novel to its film version',
      ],
      answerIndex: 2,
    },
  ],
  'c-cellular-biology': [
    {
      text: 'Which organelle is the primary site of ATP production?',
      options: ['Golgi apparatus', 'Mitochondrion', 'Lysosome', 'Peroxisome'],
      answerIndex: 1,
    },
    {
      text: 'During which mitosis phase do sister chromatids separate?',
      options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'],
      answerIndex: 2,
    },
    {
      text: 'RNA polymerase is responsible for...',
      options: [
        'Translating mRNA at the ribosome',
        'Synthesizing mRNA from a DNA template',
        'Transporting lipids in the cytosol',
        'Packaging proteins for export',
      ],
      answerIndex: 1,
    },
    {
      text: 'The fluid mosaic model describes the structure of the...',
      options: ['Nucleus', 'Plasma membrane', 'Mitochondrial matrix', 'Endoplasmic reticulum'],
      answerIndex: 1,
    },
  ],
};

const FALLBACK_META: CourseMeta = {
  timeLimitMinutes: 20,
  durationLabel: '20 minutes',
  weight: 'Quiz weight varies',
  focusAreas: ['Review core definitions', 'Summarize two lecture highlights', 'Prepare one follow-up question'],
  description: (title) => `Quick knowledge pulse-check for ${title}.`,
  maxAttempts: 3,
  gradeStats: { best: 85, latest: 80, average: 82 },
  history: [
    {
      attemptLabel: 'Attempt 1',
      timestamp: 'Sep 01, 2025 - 08:00 AM',
      duration: '18m',
      scorePercent: 80,
      status: 'Completed',
    },
  ],
};

const FALLBACK_QUESTIONS: QuestionTemplate[] = [
  {
    text: 'What is the main learning objective of this module?',
    options: ['Concept recall', 'Exam logistics', 'Team introductions', 'Lab safety'],
    answerIndex: 0,
  },
  {
    text: 'How should you prepare before attempting the graded quiz?',
    options: ['Skim notes only', 'Review slides and practice problems', 'Read unrelated articles', 'Skip preparation'],
    answerIndex: 1,
  },
  {
    text: 'When is the recommended time to review solutions?',
    options: [
      'Immediately after submitting',
      'Only before the final exam',
      'Never review',
      'Only if you fail',
    ],
    answerIndex: 0,
  },
];

const createQuestions = (templates: QuestionTemplate[], quizId: string): QuizQuestion[] =>
  templates.map((template, index) => {
    const baseId = `${quizId}-q${index + 1}`;
    const normalizedAnswerIndex = Math.min(
      Math.max(template.answerIndex, 0),
      Math.max(template.options.length - 1, 0),
    );
    return {
      id: baseId,
      text: template.text,
      options: template.options.map((option, optionIndex) => ({
        id: `${baseId}-opt-${optionIndex}`,
        label: String.fromCharCode(65 + optionIndex),
        value: option,
      })),
      correctOptionId: `${baseId}-opt-${normalizedAnswerIndex}`,
    };
  });

const buildQuizContent = (
  course: CourseDetailSection,
  quiz: CourseDetailSection['quizzes'][number],
): QuizContent => {
  const meta = COURSE_META[course.courseId] ?? FALLBACK_META;
  const templates = QUESTION_LIBRARY[course.courseId] ?? FALLBACK_QUESTIONS;
  
  // Check if there's saved quiz history in courseDetails
  const savedQuizData = (course as any).quizHistory?.[quiz.id];
  const history = savedQuizData?.history ?? meta.history;
  const gradeStats = savedQuizData?.gradeStats ?? meta.gradeStats;
  
  return {
    quizId: quiz.id,
    title: quiz.title,
    category: quiz.category,
    date: quiz.date,
    description: meta.description(course.title),
    timeLimitMinutes: meta.timeLimitMinutes,
    durationLabel: meta.durationLabel,
    weight: meta.weight,
    focusAreas: meta.focusAreas,
    maxAttempts: meta.maxAttempts,
    gradeStats,
    history,
    questions: createQuestions(templates, quiz.id),
  };
};

const CourseQuizPage = () => {
  const { portal, role, updatePortal } = useAuth();
  const navigate = useNavigate();
  const { courseId: courseSlugParam, quizId } = useParams();
  const normalizedCourseId = courseIdFromSlug(courseSlugParam);
  const course = normalizedCourseId ? portal?.courseDetails?.[normalizedCourseId] : undefined;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResultSummary | null>(null);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [hasAttemptStarted, setHasAttemptStarted] = useState(false);
  const autoSubmitTriggeredRef = useRef(false);

  const activeQuiz = useMemo(() => {
    if (!course || !quizId) return null;
    const quiz = course.quizzes.find((item) => item.id === quizId);
    if (!quiz) return null;
    return buildQuizContent(course, quiz);
  }, [course, quizId]);

  useEffect(() => {
    if (!activeQuiz) return;
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResult(null);
    setQuizStartTime(null);
    setRemainingSeconds(null);
    setHasAttemptStarted(false);
    autoSubmitTriggeredRef.current = false;
  }, [activeQuiz?.quizId]);

  if (!course) {
    return <div className="rounded-3xl bg-white p-8 text-center text-slate-600 shadow-soft">Course details not available.</div>;
  }

  if (!activeQuiz) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-slate-600 shadow-soft">
        Quiz details not available for this course.{' '}
        <button
          type="button"
          className="font-semibold text-primary underline-offset-2 hover:underline"
        onClick={() => {
          if (!role) {
            navigate(-1);
            return;
          }
          const slug = courseSlugParam ?? toCourseSlug(course.courseId) ?? normalizedCourseId;
          navigate(`/portal/${role}/course-detail/${slug}`);
        }}
        >
          Return to course
        </button>
      </div>
    );
  }

  const questions = activeQuiz.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = questions.filter((question) => selectedAnswers[question.id]).length;
  const remainingCount = Math.max(questions.length - answeredCount, 0);
  const minutesBudget = activeQuiz.timeLimitMinutes;
  const timerDisplay =
    remainingSeconds !== null
      ? formatCountdown(remainingSeconds)
      : minutesBudget
        ? formatCountdown(minutesBudget * 60)
        : 'No timer set';

  const progressStats = [
    { label: 'Answered', value: `${answeredCount}/${questions.length}` },
    { label: 'Remaining', value: String(remainingCount) },
    { label: 'Current', value: questions.length ? `Q${currentQuestionIndex + 1}` : '--' },
    { label: 'Allocation', value: activeQuiz.durationLabel },
  ];

  const overviewRows = [
    { label: 'Content', value: activeQuiz.description },
    { label: 'Time', value: activeQuiz.durationLabel },
    { label: 'Max attempts', value: `${activeQuiz.maxAttempts} per availability window` },
    {
      label: 'Grades',
      value: `Best ${activeQuiz.gradeStats.best}% · Latest ${activeQuiz.gradeStats.latest}% · Avg ${activeQuiz.gradeStats.average}%`,
    },
    { label: 'Weight', value: activeQuiz.weight },
  ];

  const handleBeginAttempt = () => {
    setHasAttemptStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResult(null);
    const startedAt = Date.now();
    setQuizStartTime(startedAt);
    setRemainingSeconds(minutesBudget > 0 ? minutesBudget * 60 : null);
    autoSubmitTriggeredRef.current = false;
  };

  const handleSelect = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const goToQuestion = (index: number) => {
    if (!questions.length) return;
    const clamped = Math.min(Math.max(index, 0), questions.length - 1);
    setCurrentQuestionIndex(clamped);
  };

  const handleSubmitQuiz = useCallback(
    async (autoSubmit = false) => {
      if (!questions.length || quizResult) return;
      const correctCount = questions.reduce(
        (total, question) => (selectedAnswers[question.id] === question.correctOptionId ? total + 1 : total),
        0,
      );
      const elapsedMinutes =
        quizStartTime !== null ? Math.max(1, Math.round((Date.now() - quizStartTime) / 60000)) : Math.max(minutesBudget, 1);
      const scorePercent = Math.round((correctCount / questions.length) * 100);
      const completionPercent = Math.round((answeredCount / questions.length) * 100);

      setQuizResult({
        scorePercent,
        correctCount,
        totalQuestions: questions.length,
        answeredCount,
        timeSpentMinutes: elapsedMinutes,
        summaryStats: [
          { label: 'Correct', value: `${correctCount}/${questions.length}` },
          { label: 'Accuracy', value: `${scorePercent}%` },
          { label: 'Completion', value: `${completionPercent}%` },
          { label: 'Time Spent', value: `${elapsedMinutes} min` },
        ],
        focusAreas: activeQuiz.focusAreas,
      });
      if (autoSubmit) {
        setRemainingSeconds(0);
      }

      // Save quiz history
      try {
        if (!normalizedCourseId || !updatePortal) return;

        const now = new Date();
        const timestamp = now.toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        }) + ' - ' + now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });

        const attemptNumber = activeQuiz.history.length + 1;
        const newHistoryEntry: QuizHistoryEntry = {
          attemptLabel: `Attempt ${attemptNumber}`,
          timestamp,
          duration: `${elapsedMinutes}m`,
          scorePercent,
          status: autoSubmit && completionPercent < 100 ? 'Expired' : 'Completed',
        };

        // Update history and grade stats
        const updatedHistory = [...activeQuiz.history, newHistoryEntry];
        const allScores = updatedHistory.map(h => h.scorePercent);
        const updatedGradeStats: QuizGradeStats = {
          best: Math.max(...allScores),
          latest: scorePercent,
          average: Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length),
        };

        // Update COURSE_META with new history and stats
        if (COURSE_META[normalizedCourseId]) {
          COURSE_META[normalizedCourseId].history = updatedHistory;
          COURSE_META[normalizedCourseId].gradeStats = updatedGradeStats;
        }

        // Also persist to backend via updatePortal
        await updatePortal((prev) => {
          if (!prev.courseDetails) return prev;
          const courseDetail = prev.courseDetails[normalizedCourseId];
          if (!courseDetail) return prev;

          // Store quiz history in course metadata
          const updatedCourseDetail = {
            ...courseDetail,
            quizHistory: {
              ...(courseDetail as any).quizHistory,
              [activeQuiz.quizId]: {
                history: updatedHistory,
                gradeStats: updatedGradeStats,
              },
            },
          };

          return {
            ...prev,
            courseDetails: {
              ...prev.courseDetails,
              [normalizedCourseId]: updatedCourseDetail,
            },
          };
        });
      } catch (error) {
        console.error('Failed to save quiz history:', error);
      }
    },
    [questions, quizResult, selectedAnswers, quizStartTime, minutesBudget, answeredCount, activeQuiz, normalizedCourseId, updatePortal],
  );

  const handleRestartQuiz = () => {
    const restartedAt = Date.now();
    setHasAttemptStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResult(null);
    setQuizStartTime(restartedAt);
    setRemainingSeconds(minutesBudget > 0 ? minutesBudget * 60 : null);
    autoSubmitTriggeredRef.current = false;
  };

  useEffect(() => {
    if (!hasAttemptStarted || !quizStartTime || !minutesBudget || quizResult) return;
    const totalSeconds = minutesBudget * 60;

    const tick = () => {
      const elapsedSeconds = Math.floor((Date.now() - quizStartTime) / 1000);
      const nextRemaining = Math.max(totalSeconds - elapsedSeconds, 0);
      setRemainingSeconds(nextRemaining);

      if (nextRemaining <= 0 && !autoSubmitTriggeredRef.current) {
        autoSubmitTriggeredRef.current = true;
        handleSubmitQuiz(true);
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [hasAttemptStarted, quizStartTime, minutesBudget, quizResult, handleSubmitQuiz]);

  const handleReturnToCourse = () => {
    if (!role) {
      navigate(-1);
      return;
    }
    const slug = courseSlugParam ?? toCourseSlug(course.courseId) ?? normalizedCourseId;
    navigate(`/portal/${role}/course-detail/${slug}`);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Course quiz</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">{activeQuiz.title}</h1>
            <p className="mt-1 text-slate-500">Course: {course.title}</p>
            <p className="mt-3 text-sm text-slate-500">{activeQuiz.description}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-right text-sm text-slate-500">
              <p className="font-semibold text-ink">{activeQuiz.date}</p>
              <p>Scheduled date</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <span className="rounded-full border border-slate-200 px-4 py-1">{activeQuiz.category}</span>
              <span className="rounded-full border border-slate-200 px-4 py-1">{activeQuiz.durationLabel}</span>
              <span className="rounded-full border border-slate-200 px-4 py-1">{activeQuiz.weight}</span>
            </div>
            <button
              type="button"
              onClick={handleReturnToCourse}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Back to course
            </button>
          </div>
        </div>

        <div className="my-8 border-t border-slate-100" />
        {hasAttemptStarted ? (
          quizResult ? (
          <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
            <div className="rounded-3xl bg-slate-50 p-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold text-primary">
                <Trophy className="h-4 w-4" />
                <span>{quizResult.scorePercent >= 80 ? 'Excellent progress' : quizResult.scorePercent >= 60 ? 'Keep practicing' : 'Schedule review'}</span>
              </div>
              <div className="relative mx-auto mt-6 h-48 w-48">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#2563eb ${quizResult.scorePercent * 3.6}deg, #e2e8f0 ${quizResult.scorePercent * 3.6}deg)`,
                  }}
                />
                <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <p className="text-4xl font-semibold text-ink">{quizResult.scorePercent}%</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Score</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                {quizResult.correctCount} out of {quizResult.totalQuestions} questions were correct.
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">Time spent</p>
              <p className="text-lg font-semibold text-ink">{quizResult.timeSpentMinutes} minutes</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Performance breakdown</p>
                    <p className="text-xs text-slate-500">Generated automatically after submission</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {quizResult.summaryStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-slate-100 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Focus for next review</p>
                    <p className="text-xs text-slate-500">Tailored to this attempt</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {quizResult.focusAreas.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary"
                  onClick={() => setQuizResult(null)}
                >
                  Review answers
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={handleRestartQuiz}
                >
                  Retake quiz
                </button>
                <button
                  type="button"
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft"
                  onClick={handleReturnToCourse}
                >
                  Return to course
                </button>
              </div>
            </div>
          </div>
          ) : (
          <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-100 p-6">
                {currentQuestion ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-ink">{currentQuestion.text}</h3>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {answeredCount}/{questions.length} answered
                      </span>
                    </div>
                    <div className="mt-5 space-y-3">
                      {currentQuestion.options.map((option) => {
                        const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelect(currentQuestion.id, option.id)}
                            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                              isSelected
                                ? 'border-primary bg-primary text-white shadow-soft'
                                : 'border-slate-200 bg-white text-ink hover:border-primary/40'
                            }`}
                          >
                            <span className="text-xs font-bold">{option.label}</span>
                            <span>{option.value}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-6 flex flex-wrap justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => goToQuestion(currentQuestionIndex - 1)}
                        disabled={currentQuestionIndex === 0}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <div className="flex flex-wrap gap-3">
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
                          onClick={() => handleSubmitQuiz()}
                          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-soft"
                        >
                          Submit quiz
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">No questions available for this quiz yet.</p>
                )}
              </div>
              <div className="rounded-3xl border border-slate-100 p-6">
                <p className="text-sm font-semibold text-slate-500">Question navigator</p>
                <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {questions.map((question, index) => {
                    const isActive = index === currentQuestionIndex;
                    const isAnswered = Boolean(selectedAnswers[question.id]);
                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => goToQuestion(index)}
                        className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? 'border-primary bg-primary text-white'
                            : isAnswered
                              ? 'border-primary/40 bg-primary/5 text-primary'
                              : 'border-slate-200 bg-white text-ink hover:border-primary/40'
                        }`}
                      >
                        Q{index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-100 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Time limit</p>
                    <p className="mt-1 text-3xl font-semibold text-ink">{timerDisplay}</p>
                  </div>
                  <Timer className="h-10 w-10 text-primary" />
                </div>
                <p className="mt-3 text-sm text-slate-500">Keep this window open so the timer remains in sync.</p>
                {minutesBudget > 0 ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-primary">Auto-submits when the timer expires.</p>
                ) : null}
              </div>
              <div className="rounded-3xl border border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Attempt status</p>
                    <p className="text-xs text-slate-500">Updates as soon as you lock an answer</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {progressStats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-slate-100 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-ink">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Focus for this quiz</p>
                    <p className="text-xs text-slate-500">Based on the module outline</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {activeQuiz.focusAreas.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          )
        ) : (
          <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Quiz readiness</p>
                    <p className="text-xs text-slate-500">Review stats before starting</p>
                  </div>
                </div>
                <dl className="mt-6 space-y-3 text-sm text-slate-600">
                  {overviewRows.map((row) => (
                    <div key={row.label} className="flex flex-col rounded-2xl bg-slate-50 px-4 py-3">
                      <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">{row.label}</dt>
                      <dd className="mt-2 font-semibold text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <button
                  type="button"
                  onClick={handleBeginAttempt}
                  className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-soft"
                >
                  Go to quiz
                </button>
                <p className="mt-3 text-sm text-slate-500">Timer starts once you enter the quiz environment.</p>
              </div>
              <div className="rounded-3xl border border-slate-100 p-6">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Focus areas</p>
                    <p className="text-xs text-slate-500">Suggested review topics</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {activeQuiz.focusAreas.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-100 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-ink">Quiz history</p>
                    <p className="text-xs text-slate-500">Latest attempts recorded for this quiz</p>
                  </div>
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {activeQuiz.history.length ? `${activeQuiz.history.length} entries` : 'No attempts yet'}
                </span>
              </div>
              {activeQuiz.history.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="pb-2 font-medium">Attempt</th>
                        <th className="pb-2 font-medium">Time</th>
                        <th className="pb-2 font-medium">Duration</th>
                        <th className="pb-2 font-medium">Score</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeQuiz.history.map((entry) => (
                        <tr key={`${entry.attemptLabel}-${entry.timestamp}`} className="text-slate-600">
                          <td className="py-3 font-semibold text-ink">{entry.attemptLabel}</td>
                          <td className="py-3">{entry.timestamp}</td>
                          <td className="py-3">{entry.duration}</td>
                          <td className="py-3 font-semibold text-ink">{entry.scorePercent}%</td>
                          <td className="py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                entry.status === 'Completed'
                                  ? 'bg-green-50 text-green-700'
                                  : entry.status === 'Expired'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-6 text-sm text-slate-500">No attempts recorded yet. Be the first one!</p>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CourseQuizPage;
