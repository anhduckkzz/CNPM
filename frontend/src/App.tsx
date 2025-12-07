import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PortalLayout from './layouts/PortalLayout';
import SSOLanding from './pages/public/SSOLanding';
import CasLogin from './pages/public/CasLogin';
import ChangePassword from './pages/public/ChangePassword';
import AnnouncementsPage from './pages/portal/AnnouncementsPage';
import CourseMatchingPage from './pages/portal/CourseMatchingPage';
import CoursesPage from './pages/portal/CoursesPage';
import CourseDetailPage from './pages/portal/CourseDetailPage';
import CourseQuizPage from './pages/portal/CourseQuizPage';
import QuizSessionPage from './pages/portal/QuizSessionPage';
import QuizSummaryPage from './pages/portal/QuizSummaryPage';
import SchedulePage from './pages/portal/SchedulePage';
import ReschedulePage from './pages/portal/ReschedulePage';
import FeedbackPage from './pages/portal/FeedbackPage';
import TutorFeedbackPage from './pages/portal/TutorFeedbackPage';
import ProfilePage from './pages/portal/ProfilePage';
import AcademicRecordsPage from './pages/portal/AcademicRecordsPage';
import StaffRecordsPage from './pages/portal/StaffRecordsPage';
import NotifyStudentPage from './pages/portal/NotifyStudentPage';
import ReportBuilderPage from './pages/portal/ReportBuilderPage';
import StaffFeedbackGeneratorPage from './pages/portal/StaffFeedbackGeneratorPage';
import JoinSessionPage from './pages/portal/JoinSessionPage';
import CourseAdminPage from './pages/portal/CourseAdminPage';
import RegisterHistoryPage from './pages/portal/RegisterHistoryPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<SSOLanding />} />
        <Route path="/cas-login" element={<CasLogin />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/portal/:role" element={<PortalLayout />}>
            <Route path="home" element={<AnnouncementsPage />} />
            <Route path="course-matching" element={<CourseMatchingPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="register-history" element={<RegisterHistoryPage />} />
            <Route path="course-detail/:courseId" element={<CourseDetailPage />} />
            <Route path="course-detail/:courseId/quiz/:quizId" element={<CourseQuizPage />} />
            <Route path="course-detail/:courseId/session/:sessionId" element={<JoinSessionPage />} />
            <Route path="course-admin/:courseId" element={<CourseAdminPage />} />
            <Route path="quiz/:courseId" element={<QuizSessionPage />} />
            <Route path="quiz/:courseId/completed" element={<QuizSummaryPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="reschedule" element={<ReschedulePage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="tutor-feedback" element={<TutorFeedbackPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="academic-records" element={<AcademicRecordsPage />} />

            <Route path="records" element={<StaffRecordsPage />} />
            <Route path="notify-students" element={<NotifyStudentPage />} />
            <Route path="reports" element={<ReportBuilderPage />} />
            <Route path="feedback-generation" element={<StaffFeedbackGeneratorPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
