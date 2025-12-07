export type Role = 'student' | 'tutor' | 'staff';

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  address?: string;
  avatar: string;
  role: Role;
}

export interface NavigationLink {
  label: string;
  path: string;
  badge?: string;
}

export interface NavigationConfig {
  topLinks: string[];
  sidebar: Array<{
    title: string;
    links: NavigationLink[];
  }>;
  quickActions?: NavigationLink[];
}

export interface Announcement {
  id: string;
  title: string;
  author: string;
  role: string;
  timestamp: string;
  body: string;
  repliesLabel?: string;
}

export interface AnnouncementSection {
  heroImage: string;
  title: string;
  subtitle: string;
  items: Announcement[];
}

export interface CourseCard {
  id: string;
  title: string;
  code: string;
  tutor?: string;
  format: string;
  capacity: string;
  thumbnail: string;
  badge?: string;
  actionLabel: string;
  accent?: string;
  tags?: string[];
  status?: string;
}

export interface CourseMatchingSection {
  title: string;
  description: string;
  filters: string[];
  recommended: CourseCard[];
  history: CourseCard[];
  registrationResults?: Array<{
    id: string;
    title: string;
    code: string;
    format: string;
    thumbnail: string;
    status: 'cancelled' | 'failed' | 'processing';
    reason?: string;
    registeredDate?: string;
  }>;
  modal: {
    focusCourseId: string;
    slots: Array<{
      id: string;
      section: string;
      tutor: string;
      format: string;
      capacity: string;
      days: string;
      cta: string;
    }>;
  };
}

export interface CourseDetailSection {
  courseId: string;
  title: string;
  upcomingSessions: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    cta: string;
    link?: string;
    description?: string;
  }>;
  materials: Array<{
    title: string;
    type?: string;
    url?: string;
  }>;
  quizzes: Array<{
    id: string;
    title: string;
    category: string;
    date: string;
    status: string;
    startDate?: string;
    endDate?: string;
    duration?: string;
    questions?: Array<{
      id: string;
      prompt: string;
      choices: string[];
      correctAnswer: number;
    }>;
  }>;
}

export interface RegisteredCourse {
  id: string;
  title: string;
  code: string;
  thumbnail: string;
  status?: string;
  studentCount?: number;
  timeStudy?: string;
  registeredDate?: string;
  tutor?: string;
  tags?: string[];
}

export interface RegisteredCoursesSection {
  title: string;
  description: string;
  courses: RegisteredCourse[];
}

export interface QuizSessionSection {
  courseId: string;
  title: string;
  timeLeftMinutes: number;
  questions: Array<{
    id: string;
    text: string;
    options: Array<{ id: string; label: string; value: string }>;
  }>;
}

export interface QuizSummarySection {
  courseId: string;
  title: string;
  score: string;
  duration: string;
  stats: Array<{ label: string; value: string }>;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  day: string;
  start: string;
  end: string;
  type: 'free' | 'busy';
  location?: string;
}

export interface ScheduleSection {
  month: string;
  events: ScheduleEvent[];
  upcoming: Array<{
    id: string;
    courseId: string;
    sessionId: string;
    title: string;
    date: string;
    time: string;
    cta: string;
  }>;
}

export interface RescheduleSection {
  grid: Array<{
    day: string;
    blocks: Array<'free' | 'busy' | 'open'>;
  }>;
  instructions: string[];
}

export interface FeedbackFormSection {
  title: string;
  instructions: string;
  sessions: string[];
  ratingScale: string[];
  history: Array<{
    id: string;
    course: string;
    submittedOn: string;
    rating: number;
    status: string;
    summary: string;
  }>;
}

export interface TutorFeedbackSection {
  attendance: Array<{
    id: string;
    name: string;
    attended: boolean;
    inClassScore: number;
  }>;
  sessionRating: number;
  history: FeedbackFormSection['history'];
}

export interface ProfileSection {
  header: {
    about: string;
    role: string;
  };
  contact: Array<{
    label: string;
    value: string;
    icon: string;
    editable?: boolean;
  }>;
  academics: Array<{
    label: string;
    value: string | string[];
    type?: 'tags';
  }>;
}

export interface AcademicRecordSection {
  studentInfo: {
    name: string;
    studentId: string;
    semester: string;
  };
  gpa: string;
  standing: string;
  grades: Array<{ course: string; grade: string; credits: number; scale4?: number }>;
  scholarships: Array<{ title: string; amount: string; description: string }>;
  tutorLessons: Array<{ title: string; tutor: string }>;
  eligibility: {
    status: string;
    criteria: string[];
  };
}

export interface StaffRecordsSection {
  metrics: Array<{ label: string; value: string; caption: string }>;
  table: Array<{
    order: number;
    studentId: string;
    name: string;
    major: string;
    gpa: string;
    status: string;
  }>;
  notifications: Array<{ title: string; body: string; timeAgo: string }>;
  quickActions: NavigationLink[];
  tabs: string[];
}

export interface NotificationSection {
  recipients: string[];
  templates: string[];
  channels: string[];
  selectedStudents: string[];
}

export interface ReportSection {
  reportName: string;
  academicYear: string;
  semester?: string;
  filters: Array<{ label: string; value: string }>;
  options: string[];
}

export interface PortalBundle {
  navigation: NavigationConfig;
  user: UserProfile;
  announcements: AnnouncementSection;
  courseMatching?: CourseMatchingSection;
  courseDetail?: CourseDetailSection;
  courseDetails?: Record<string, CourseDetailSection>;
  courses?: RegisteredCoursesSection;
  courseSupport?: {
    upload: { title: string; maxSize: string; description: string };
    quiz: { title: string; placeholders: { quizTitle: string; availability: string[] } };
    meeting: { title: string; platformHint: string };
  };
  quizSession?: QuizSessionSection;
  quizSummary?: QuizSummarySection;
  schedule?: ScheduleSection;
  reschedule?: RescheduleSection;
  feedback?: FeedbackFormSection;
  tutorFeedback?: TutorFeedbackSection;
  profile: ProfileSection;
  academicRecords?: AcademicRecordSection;
  staffRecords?: StaffRecordsSection;
  notifications?: NotificationSection;
  reports?: {
    academic: ReportSection;
    scholarship: ReportSection;
    feedback: ReportSection;
  };
}
