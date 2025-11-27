# Tutor Support System – Test Execution Log

Run `npm run test:report` to capture the structured log (`reports/vitest-report.xml`) alongside the verbose console output. The table below groups every Vitest suite into the requested feature clusters, and labels each case as **Functionality (F)** or **GUI (G)**.

| Feature Group | Type | Test Case (file) |
| --- | --- | --- |
| Login / Logout | F | Auth session persists after login and is cleared on logout (`frontend/src/context/__tests__/AuthProvider.test.tsx`) |
|  | F | ProtectedRoute blocks anonymous users, routes unauthorized roles (`frontend/src/components/__tests__/ProtectedRoute.test.tsx`) |
|  | G | CAS login form: staff defaults, validation, wake notice overlay (`frontend/src/pages/public/__tests__/CasLogin.test.tsx`) |
|  | G | SSO landing buttons navigate correctly (`frontend/src/pages/public/__tests__/SSOLanding.test.tsx`) |
| Profile Management | F | ProfileModel builds cards, toggles editing, resets upload errors (`frontend/src/models/__tests__/ProfileModel.test.ts`) |
|  | G | Profile page fallback + edit-mode button swapping (`frontend/src/pages/portal/__tests__/ProfilePage.test.tsx`) |
| Tutor–Student Course Matching | F | Course category / seat status helpers (`frontend/src/utils/__tests__/courseMatching.test.ts`) |
|  | G | CourseMatchingPage search + modal registration toast (`frontend/src/pages/portal/__tests__/CourseMatchingPage.test.tsx`) |
| Feedback & Evaluation | F | Toast hook queues & dismisses notifications (`frontend/src/hooks/__tests__/useStackedToasts.test.ts`) |
|  | G | Feedback submission triggers success toast (`frontend/src/pages/portal/__tests__/FeedbackPage.test.tsx`) |
| Courses | F | Course slug helpers round-trip IDs (`frontend/src/utils/__tests__/courseSlug.test.ts`) |
|  | G | Courses page empty state + “Access Course” navigation (`frontend/src/pages/portal/__tests__/CoursesPage.test.tsx`) |
| Scheduling | F | Timeline math helpers for minutes and labels (`frontend/src/pages/portal/__tests__/ScheduleUtils.test.ts`) |
|  | G | Schedule page fallback when no data (`frontend/src/pages/portal/__tests__/SchedulePage.test.tsx`) |
| Academic Record & Scholarship | F | Staff-only guard blocks report builder for students (`frontend/src/pages/portal/__tests__/ReportBuilderPage.test.tsx` – case 1) |
|  | G | Staff can trigger report generation toast (`frontend/src/pages/portal/__tests__/ReportBuilderPage.test.tsx` – case 2) |

## Latest Run

- XML + verbose: `npm run test:report` (writes `frontend/reports/vitest-report.xml`)
- HTML dashboard: `npm run test:report:html` (writes `frontend/reports/vitest-report.html`)

Use the XML artifact in CI/reporting tools, and open the HTML file in a browser for a shareable dashboard. Need a text log? Redirect the verbose output: `npm run test:report | Tee-Object reports/vitest-verbose.log` (PowerShell) or `npm run test:report | tee reports/vitest-verbose.log` (bash).
