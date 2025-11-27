import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  Loader2,
  Play,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { uploadMaterialFile } from '../../lib/api';
import { useStackedToasts } from '../../hooks/useStackedToasts';
import type { CourseDetailSection } from '../../types/portal';
import { courseIdFromSlug } from '../../utils/courseSlug';

type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  correctAnswer: number;
};

const createBlankQuestion = (): QuizQuestion => ({
  id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  prompt: '',
  choices: ['', '', '', ''],
  correctAnswer: 0,
});

const normalizeQuestions = (questions?: QuizQuestion[]) => {
  return (questions ?? []).map((q, index) => {
    const choices = Array.isArray(q.choices) ? [...q.choices] : [];
    while (choices.length < 4) choices.push('');
    if (choices.length > 4) choices.length = 4;
    const correctAnswer = Number.isFinite(q.correctAnswer) ? Math.min(Math.max(q.correctAnswer, 0), 3) : 0;
    return {
      id: q.id || `q-${Date.now()}-${index}`,
      prompt: q.prompt ?? '',
      choices,
      correctAnswer,
    };
  });
};

const materialIconMap: Record<string, ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  slides: <FileText className="h-4 w-4" />,
  video: <Play className="h-4 w-4" />,
  sheet: <FileText className="h-4 w-4" />,
  default: <FileText className="h-4 w-4" />,
};

const detectMaterialType = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext.includes('pdf')) return 'pdf';
  if (['ppt', 'pptx', 'slides', 'ppsx', 'key'].includes(ext)) return 'slides';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  return 'default';
};

const formatDateTimeLabel = (start: string, end: string) => {
  if (!start && !end) return 'Date to be announced';
  const formatter = (value: string) =>
    new Date(value).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

  if (start && end) return `${formatter(start)} - ${formatter(end)}`;
  if (start) return formatter(start);
  return formatter(end);
};

const formatMeetingDate = (date: string) => {
  if (!date) return 'Date TBA';
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

const formatMeetingTime = (time: string, duration?: string) => {
  if (!time) return duration ? `Duration: ${duration}` : 'Time TBA';
  const [hourString, minuteString = '00'] = time.split(':');
  let hour = Number(hourString);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  const base = `${hour}:${minuteString.padStart(2, '0')} ${suffix}`;
  return duration ? `${base} (${duration})` : base;
};

const CourseAdminPage = () => {
  const { portal, role, updatePortal } = useAuth();
  const navigate = useNavigate();
  const { courseId: courseSlugParam } = useParams();
  const { toasts, showToast } = useStackedToasts();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedCourseId = courseIdFromSlug(courseSlugParam);
  const course = normalizedCourseId ? portal?.courseDetails?.[normalizedCourseId] : undefined;
  const courseSupport = portal?.courseSupport;
  const courseKey = normalizedCourseId ?? course?.courseId;
  const resolvedCourseSlug =
    courseSlugParam ?? (courseKey?.startsWith('c-') ? courseKey.slice(2) : courseKey) ?? '';

  const [materials, setMaterials] = useState<CourseDetailSection['materials']>(course?.materials ?? []);
  const [quizzes, setQuizzes] = useState<CourseDetailSection['quizzes']>(course?.quizzes ?? []);
  const [sessions, setSessions] = useState<CourseDetailSection['upcomingSessions']>(course?.upcomingSessions ?? []);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quizForm, setQuizForm] = useState({
    title: '',
    duration: '',
    startDate: '',
    endDate: '',
    category: course ? `Course: ${course.title}` : '',
    status: 'Attempt Quiz',
    questions: [] as QuizQuestion[],
  });
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    link: '',
    date: '',
    time: '',
    duration: '',
    description: '',
  });
  const quizFormRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!course) return;
    setMaterials(course.materials ?? []);
    setQuizzes(course.quizzes ?? []);
    setSessions(course.upcomingSessions ?? []);
    setQuizForm((prev) => ({
      ...prev,
      category: `Course: ${course.title}`,
      questions: [],
    }));
  }, [course]);

  const persistCourseUpdate = useCallback(
    async (mutator: (current: CourseDetailSection) => CourseDetailSection) => {
      if (!updatePortal || !courseKey) return;
      await updatePortal((prev) => {
        if (!prev.courseDetails) return prev;
        const existing = prev.courseDetails[courseKey];
        if (!existing) return prev;
        const updatedCourse = mutator(existing);
        return {
          ...prev,
          courseDetails: {
            ...prev.courseDetails,
            [courseKey]: updatedCourse,
          },
        };
      });
    },
    [courseKey, updatePortal],
  );

  if (!course || !role || !courseKey) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Course admin tools unavailable.</div>;
  }

  const supportUpload = courseSupport?.upload;
  const supportQuiz = courseSupport?.quiz;
  const supportMeeting = courseSupport?.meeting;

  const coursePrefix = useMemo(() => course.title.split(' ')[0] ?? 'Course', [course.title]);

  const handleMaterialInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setSelectedFileName(file.name);
  };

  const handleMaterialUpload = async () => {
    if (!selectedFile) {
      showToast('Choose a file before uploading.');
      return;
    }
    setUploadingMaterial(true);
    try {
      const response = await uploadMaterialFile(selectedFile);
      const newMaterial = {
        title: selectedFile.name,
        type: detectMaterialType(selectedFile.name),
        url: response.url,
      };
      const nextMaterials = [...materials, newMaterial];
      setMaterials(nextMaterials);
      await persistCourseUpdate((current) => ({
        ...current,
        materials: nextMaterials,
      }));
      showToast('Material uploaded and published to students.');
      setSelectedFile(null);
      setSelectedFileName('');
    } catch (error) {
      console.error('Upload failed', error);
      showToast('Upload failed. Please try again.');
    } finally {
      setUploadingMaterial(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMaterialDelete = async (material: CourseDetailSection['materials'][number]) => {
    const confirmed = window.confirm(`Delete "${material.title}" for this course?`);
    if (!confirmed) return;
    const materialKey = material.url ?? material.title;
    const nextMaterials = materials.filter((item) => (item.url ?? item.title) !== materialKey);
    setMaterials(nextMaterials);
    await persistCourseUpdate((current) => ({
      ...current,
      materials: nextMaterials,
    }));
    showToast('Material removed for all students.');
  };

  const handleMaterialEdit = async (material: CourseDetailSection['materials'][number]) => {
    const nextTitle = window.prompt('Update material title', material.title);
    if (!nextTitle || !nextTitle.trim()) return;
    const materialKey = material.url ?? material.title;
    const nextMaterials = materials.map((item) =>
      (item.url ?? item.title) === materialKey ? { ...item, title: nextTitle.trim() } : item,
    );
    setMaterials(nextMaterials);
    await persistCourseUpdate((current) => ({
      ...current,
      materials: nextMaterials,
    }));
    showToast('Material updated.');
  };

  const handleQuizSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!quizForm.title.trim()) {
      showToast('Quiz title is required.');
      return;
    }
    if (quizForm.questions.length === 0) {
      showToast('Add at least one question.');
      return;
    }

    const cleanedQuestions: QuizQuestion[] = [];
    for (const question of quizForm.questions) {
      const prompt = question.prompt.trim();
      const choices = question.choices.map((c) => c.trim());
      const hasEmptyChoice = choices.some((c) => !c);
      if (!prompt) {
        showToast('Each question needs content.');
        return;
      }
      if (choices.length !== 4 || hasEmptyChoice) {
        showToast('Each question needs 4 answer choices.');
        return;
      }
      if (question.correctAnswer < 0 || question.correctAnswer > 3) {
        showToast('Pick a correct answer for every question.');
        return;
      }
      cleanedQuestions.push({ ...question, prompt, choices, correctAnswer: question.correctAnswer });
    }

    const quizId = editingQuizId ?? `quiz-${Date.now()}`;
    const quizPayload: CourseDetailSection['quizzes'][number] = {
      id: quizId,
      title: quizForm.title.trim(),
      category: quizForm.category || `Course: ${course.title}`,
      date: formatDateTimeLabel(quizForm.startDate, quizForm.endDate),
      status: quizForm.status || 'Attempt Quiz',
      startDate: quizForm.startDate || undefined,
      endDate: quizForm.endDate || undefined,
      duration: quizForm.duration || undefined,
      questions: cleanedQuestions,
    };

    const nextQuizzes = editingQuizId
      ? quizzes.map((quiz) => (quiz.id === editingQuizId ? quizPayload : quiz))
      : [...quizzes, quizPayload];

    setQuizzes(nextQuizzes);
    await persistCourseUpdate((current) => ({
      ...current,
      quizzes: nextQuizzes,
    }));
    setEditingQuizId(null);
    setQuizForm({
      title: '',
      duration: '',
      startDate: '',
      endDate: '',
      category: `Course: ${course.title}`,
      status: 'Attempt Quiz',
      questions: [],
    });
    showToast(editingQuizId ? 'Quiz updated.' : 'Quiz created and published.');
  };

  const handleQuizDelete = async (quizId: string) => {
    const confirmed = window.confirm('Delete this quiz for all students?');
    if (!confirmed) return;
    const nextQuizzes = quizzes.filter((quiz) => quiz.id !== quizId);
    setQuizzes(nextQuizzes);
    await persistCourseUpdate((current) => ({
      ...current,
      quizzes: nextQuizzes,
    }));
    showToast('Quiz deleted.');
  };

  const handleQuizEdit = (quiz: CourseDetailSection['quizzes'][number]) => {
    const normalizedQuestions = normalizeQuestions(quiz.questions as QuizQuestion[] | undefined);
    setEditingQuizId(quiz.id);
    setQuizForm({
      title: quiz.title,
      duration: quiz.duration ?? '',
      startDate: quiz.startDate ?? '',
      endDate: quiz.endDate ?? '',
      category: quiz.category,
      status: quiz.status,
      questions: normalizedQuestions.length ? normalizedQuestions : [createBlankQuestion()],
    });
    if (quizFormRef.current) {
      quizFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMeetingSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!meetingForm.link.trim() || !meetingForm.date || !meetingForm.time) {
      showToast('Meeting link, date, and time are required.');
      return;
    }

    const sessionPayload: CourseDetailSection['upcomingSessions'][number] = {
      id: `session-${Date.now()}`,
      title: meetingForm.title || `${coursePrefix} live session`,
      date: formatMeetingDate(meetingForm.date),
      time: formatMeetingTime(meetingForm.time, meetingForm.duration),
      cta: 'Join Session',
      link: meetingForm.link.trim(),
      description: meetingForm.description || undefined,
    };

    const nextSessions = [...sessions, sessionPayload];
    setSessions(nextSessions);
    await persistCourseUpdate((current) => ({
      ...current,
      upcomingSessions: nextSessions,
    }));
    setMeetingForm({
      title: '',
      link: '',
      date: '',
      time: '',
      duration: '',
      description: '',
    });
    showToast('Meeting scheduled and shared with students.');
  };

  const handleQuestionChange = (index: number, value: string) => {
    setQuizForm((prev) => {
      const next = prev.questions.map((item, idx) =>
        idx === index ? { ...item, prompt: value } : item,
      );
      return { ...prev, questions: next };
    });
  };

  const handleAddQuestion = () => {
    setQuizForm((prev) => ({ ...prev, questions: [...prev.questions, createBlankQuestion()] }));
  };

  const handleDeleteQuestion = (index: number) => {
    setQuizForm((prev) => {
      const next = prev.questions.filter((_, idx) => idx !== index);
      return { ...prev, questions: next };
    });
  };

  const handleChoiceChange = (questionIndex: number, choiceIndex: number, value: string) => {
    setQuizForm((prev) => {
      const next = prev.questions.map((q, idx) => {
        if (idx !== questionIndex) return q;
        const choices = [...q.choices];
        choices[choiceIndex] = value;
        return { ...q, choices };
      });
      return { ...prev, questions: next };
    });
  };

  const handleCorrectAnswerChange = (questionIndex: number, choiceIndex: number) => {
    setQuizForm((prev) => {
      const next = prev.questions.map((q, idx) =>
        idx === questionIndex ? { ...q, correctAnswer: choiceIndex } : q,
      );
      return { ...prev, questions: next };
    });
  };

  const handleJoinSession = (sessionId: string) => {
    if (!role || !resolvedCourseSlug) return;
    navigate(`/portal/${role}/course-detail/${resolvedCourseSlug}/session/${sessionId}`);
  };

  return (
    <div className="space-y-8">
      <header className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Course Admin Panel</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">{course.title}</h1>
            <p className="mt-2 text-slate-500">Manage sessions, materials, quizzes, and meetings for this cohort.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => showToast('Course updates saved to the portal.')}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft"
            >
              Publish Update
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Upcoming Sessions</p>
              <h2 className="text-xl font-semibold text-ink">Next {coursePrefix} meetings</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4"
              >
                <div>
                  <p className="font-semibold text-ink">{session.title}</p>
                  <p className="text-sm text-slate-500">
                    {session.date} - {session.time}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleJoinSession(session.id)}
                  className="rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
                >
                  Join session
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Course Support</p>
              <h2 className="text-xl font-semibold text-ink">Material, Quiz & Meeting tools</h2>
            </div>
          </div>
          <div className="mt-6 space-y-6">
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center">
              <p className="text-sm font-semibold text-ink">{supportUpload?.title ?? 'Upload Course Materials'}</p>
              <p className="mt-2 text-sm text-slate-500">{supportUpload?.description}</p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleMaterialInputChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center"
                  disabled={uploadingMaterial}
                >
                  <UploadCloud className="h-10 w-10 text-primary" />
                  <p className="mt-3 text-sm text-slate-500">Drag & drop or click to browse</p>
                  <p className="text-xs text-slate-400">Max file size {supportUpload?.maxSize ?? '50MB'}</p>
                  {selectedFileName ? (
                    <p className="mt-2 text-xs font-semibold text-primary">Selected: {selectedFileName}</p>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">No file selected</p>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 shadow-soft"
              >
                Choose file
              </button>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleMaterialUpload}
                  disabled={uploadingMaterial || !selectedFile}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft disabled:opacity-60"
                >
                  {uploadingMaterial ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {uploadingMaterial ? 'Uploading...' : 'Upload material'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setSelectedFileName('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  Clear
                </button>
              </div>
            </div>

            <form
              ref={quizFormRef}
              className="space-y-3 rounded-2xl border border-slate-100 p-5"
              onSubmit={handleQuizSubmit}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">
                  {editingQuizId ? 'Edit quiz' : supportQuiz?.title ?? 'Create New Quiz'}
                </p>
                {editingQuizId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuizId(null);
                      setQuizForm({
                        title: '',
                        duration: '',
                        startDate: '',
                        endDate: '',
                        category: `Course: ${course.title}`,
                        status: 'Attempt Quiz',
                        questions: [],
                      });
                    }}
                    className="text-xs font-semibold text-primary underline"
                  >
                    Cancel edit
                  </button>
                ) : null}
              </div>
              <input
                type="text"
                placeholder={supportQuiz?.placeholders.quizTitle ?? 'Quiz title'}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                value={quizForm.title}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  type="text"
                  placeholder="Duration"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                  value={quizForm.duration}
                  onChange={(e) => setQuizForm((prev) => ({ ...prev, duration: e.target.value }))}
                />
                <input
                  type="datetime-local"
                  placeholder="Start date"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                  value={quizForm.startDate}
                  onChange={(e) => setQuizForm((prev) => ({ ...prev, startDate: e.target.value }))}
                />
                <input
                  type="datetime-local"
                  placeholder="End date"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                  value={quizForm.endDate}
                  onChange={(e) => setQuizForm((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <input
                type="text"
                placeholder="Quiz category"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                value={quizForm.category}
                onChange={(e) => setQuizForm((prev) => ({ ...prev, category: e.target.value }))}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex-1 rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary"
                >
                  Add Question
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
                >
                  {editingQuizId ? 'Update Quiz' : 'Save Quiz'}
                </button>
              </div>
              <div className="space-y-2">
                {quizForm.questions.map((question, index) => (
                  <div
                    key={question.id || `question-${index}`}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3"
                  >
                    <span className="mt-2 h-6 w-6 rounded-full bg-primary/10 text-center text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={question.prompt}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        placeholder="Question prompt"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        {question.choices.map((choice, choiceIndex) => {
                          const isCorrect = question.correctAnswer === choiceIndex;
                          const letter = String.fromCharCode(65 + choiceIndex);
                          return (
                            <div
                              key={`choice-${index}-${choiceIndex}`}
                              className={`space-y-1 rounded-xl border px-3 py-2 ${
                                isCorrect ? 'border-primary/70 bg-primary/5' : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                  <span className={isCorrect ? 'text-primary' : 'text-slate-500'}>Choice {letter}</span>
                                  {isCorrect ? (
                                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                      Correct answer
                                    </span>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCorrectAnswerChange(index, choiceIndex)}
                                  className="text-[11px] font-semibold text-primary underline"
                                >
                                  Mark correct
                                </button>
                              </div>
                              <input
                                type="text"
                                value={choice}
                                onChange={(e) => handleChoiceChange(index, choiceIndex, e.target.value)}
                                placeholder={`Answer choice ${choiceIndex + 1}`}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(index)}
                        className="text-xs font-semibold text-rose-500 underline"
                      >
                        Delete question
                      </button>
                    </div>
                  </div>
                ))}
                {quizForm.questions.length === 0 ? (
                  <p className="text-xs text-slate-500">No questions yet. Add one to proceed.</p>
                ) : null}
              </div>
            </form>

            {editingQuizId ? (
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-semibold">Editing quiz preview</p>
                <p className="mt-2 text-ink">Title: {quizForm.title || 'Untitled quiz'}</p>
                <p>Category: {quizForm.category || 'Not set'}</p>
                <p>Duration: {quizForm.duration || 'Not set'}</p>
                <p>
                  Availability: {quizForm.startDate ? new Date(quizForm.startDate).toLocaleString() : 'Start not set'}{' '}
                  to {quizForm.endDate ? new Date(quizForm.endDate).toLocaleString() : 'End not set'}
                </p>
                <p className="mt-2 font-semibold">Questions ({quizForm.questions.length})</p>
                <div className="space-y-2">
                  {quizForm.questions.map((q, idx) => (
                    <div key={q.id || `preview-${idx}`} className="rounded-xl border border-amber-100 bg-white/60 p-2">
                      <p className="text-amber-900 font-semibold">
                        Q{idx + 1}: {q.prompt || 'Untitled question'}
                      </p>
                      <ul className="mt-1 space-y-1 text-amber-900 text-xs">
                        {q.choices.map((choice, cIdx) => (
                          <li key={`${q.id}-choice-${cIdx}`}>
                            <span className="font-semibold">{String.fromCharCode(65 + cIdx)}.</span>{' '}
                            {choice || 'Not set'}
                            {q.correctAnswer === cIdx ? ' (Correct)' : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <p className="mt-1 text-xs text-amber-700">
                  Save to publish changes or cancel to discard.
                </p>
              </div>
            ) : null}

            <form className="space-y-3 rounded-2xl border border-slate-100 p-5" onSubmit={handleMeetingSubmit}>
              <p className="text-sm font-semibold text-ink">{supportMeeting?.title ?? 'Schedule Meeting'}</p>
              <input
                type="text"
                placeholder={supportMeeting?.platformHint ?? 'Paste your video link'}
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                value={meetingForm.link}
                onChange={(e) => setMeetingForm((prev) => ({ ...prev, link: e.target.value }))}
              />
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  type="date"
                  placeholder="Date"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                  value={meetingForm.date}
                  onChange={(e) => setMeetingForm((prev) => ({ ...prev, date: e.target.value }))}
                />
                <input
                  type="time"
                  placeholder="Time"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                  value={meetingForm.time}
                  onChange={(e) => setMeetingForm((prev) => ({ ...prev, time: e.target.value }))}
                />
                <input
                  type="text"
                  placeholder="Duration"
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                  value={meetingForm.duration}
                  onChange={(e) => setMeetingForm((prev) => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              <input
                type="text"
                placeholder="Meeting title"
                className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                value={meetingForm.title}
                onChange={(e) => setMeetingForm((prev) => ({ ...prev, title: e.target.value }))}
              />
              <textarea
                placeholder="Description or agenda"
                className="h-24 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
                value={meetingForm.description}
                onChange={(e) => setMeetingForm((prev) => ({ ...prev, description: e.target.value }))}
              />
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-soft"
              >
                Schedule Meeting
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Course material</p>
              <h2 className="text-xl font-semibold text-ink">Manage slides, notes, and videos</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {materials.map((material) => {
              const icon = materialIconMap[material.type ?? 'default'] ?? materialIconMap.default;
              const key = material.url ?? material.title;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-primary">
                      {icon}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{material.title}</p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{material.type ?? 'PDF'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleMaterialEdit(material)}
                      className="rounded-full border border-slate-200 p-2 hover:text-primary"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMaterialDelete(material)}
                      className="rounded-full border border-slate-200 p-2 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Upcoming quizzes</p>
              <h2 className="text-xl font-semibold text-ink">Track in-progress assessments</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-ink">{quiz.title}</p>
                  <p className="text-sm text-slate-500">{quiz.category}</p>
                  <p className="text-xs text-slate-400">{quiz.date}</p>
                </div>
                <div className="flex gap-2 text-slate-400">
                  <button
                    type="button"
                    onClick={() => handleQuizEdit(quiz)}
                    className="rounded-full border border-slate-200 p-2 hover:text-primary"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuizDelete(quiz.id)}
                    className="rounded-full border border-slate-200 p-2 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div
        aria-live="assertive"
        className="pointer-events-none fixed left-6 top-6 z-[60] flex w-full max-w-xs flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Success</p>
                <p className="text-xs text-emerald-800/80">
                  {toast.message || 'Action completed successfully.'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseAdminPage;
