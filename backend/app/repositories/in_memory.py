from __future__ import annotations

from dataclasses import asdict
from typing import Dict

from app.models.user import Role, User


class PortalRepository:
    """Keeps in-memory fixtures describing each role experience."""

    def __init__(self) -> None:
        self._user_directory: Dict[Role, User] = {}
        self._bundles: Dict[Role, Dict] = {}
        self._bootstrap()

    def _bootstrap(self) -> None:
        self._user_directory = {
            'student': User(
                identifier='stu-20127001',
                name='Nguyen Van A',
                email='student@hcmut.edu.vn',
                title='Student, Computer Science',
                avatar='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
                role='student',
            ),
            'tutor': User(
                identifier='tutor-1975',
                name='Nguyen Van A',
                email='tutor@hcmut.edu.vn',
                title='Tutor, Data Structures',
                avatar='https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80',
                role='tutor',
            ),
            'staff': User(
                identifier='staff-osa',
                name='Tran Thi Minh Chau',
                email='staff@hcmut.edu.vn',
                title='Office of Student Affairs',
                avatar='https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
                role='staff',
            ),
        }

        self._bundles = {
            'student': self._build_student_bundle(),
            'tutor': self._build_tutor_bundle(),
            'staff': self._build_staff_bundle(),
        }

    def _build_student_bundle(self) -> Dict:
        return {
            'navigation': {
                'topLinks': ['courses', 'profile'],
                'sidebar': [
                    {
                        'title': 'Quick Access',
                        'links': [
                            {'label': 'Dashboard', 'path': '/portal/student/home'},
                            {'label': 'Profile', 'path': '/portal/student/profile'},
                            {'label': 'Academic Records', 'path': '/portal/student/academic-records'},
                        ],
                    },
                    {
                        'title': 'Student Hub',
                        'links': [
                            {'label': 'Tutor-Student Course Match', 'path': '/portal/student/course-matching'},
                            {'label': 'My Schedule', 'path': '/portal/student/schedule'},
                            {'label': 'Session Feedback', 'path': '/portal/student/feedback', 'badge': 'New'},
                            {'label': 'Reschedule Availability', 'path': '/portal/student/reschedule'},
                        ],
                    },
                ],
            },
            'user': asdict(self._user_directory['student']),
            'announcements': {
                'heroImage': 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1600&q=80',
                'title': 'Site Announcements',
                'subtitle': 'Latest updates for the HCMUT community.',
                'items': [
                    {
                        'id': 'ann-1',
                        'title': 'Guide to Installing Moodle Mobile',
                        'author': 'User Admin',
                        'role': 'Digital Learning',
                        'timestamp': 'Friday, December 8, 2023 · 3:27 PM',
                        'body': 'Install the Moodle application on mobile devices to follow announcements and deadlines seamlessly.',
                        'repliesLabel': 'Discuss this topic (8 replies)',
                    },
                    {
                        'id': 'ann-2',
                        'title': 'New Course Registration Period Announced',
                        'author': 'Academic Affairs',
                        'role': 'Registrar',
                        'timestamp': 'Monday, January 15, 2024 · 10:00 AM',
                        'body': 'Registration for the upcoming semester opens next week. Review prerequisites and session availability before confirming.',
                        'repliesLabel': 'Discuss this topic (6 replies)',
                    },
                    {
                        'id': 'ann-3',
                        'title': 'Important Security Update for Student Portals',
                        'author': 'IT Department',
                        'role': 'Security',
                        'timestamp': 'Wednesday, February 1, 2024 · 2:04 PM',
                        'body': 'A portal-wide security update has been applied. Reset your password on next login to keep accounts secured.',
                        'repliesLabel': 'Discuss this topic (2 replies)',
                    },
                ],
            },
            'courseMatching': {
                'title': 'Tutor-Student Course Matching',
                'description': 'Discover and manage courses that align with your learning goals.',
                'filters': ['All Categories', 'All Statuses', 'All Formats'],
                'recommended': self._recommended_courses('student'),
                'history': [
                    {
                        'id': 'c-data-structures',
                        'title': 'Data Structures & Algorithms',
                        'code': 'CO2012',
                        'format': 'Blended',
                        'capacity': '80/100',
                        'tutor': 'Prof. Alex Lee',
                        'thumbnail': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
                        'badge': 'In progress',
                        'actionLabel': 'Go To Your Course',
                        'accent': '#FFD7E2',
                    },
                    {
                        'id': 'c-uiux',
                        'title': 'UI/UX Design Principles',
                        'code': 'DS3002',
                        'format': 'Online',
                        'capacity': '60/70',
                        'tutor': 'Dr. Emily White',
                        'thumbnail': 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=600&q=80',
                        'badge': 'Upcoming',
                        'actionLabel': 'Go To Your Course',
                        'accent': '#FFEBD1',
                    },
                ],
                'modal': {
                    'focusCourseId': 'c-intro-programming',
                    'slots': [
                        {
                            'id': 'slot-a',
                            'section': 'CO1002 · CC01 · In-person',
                            'tutor': 'Nguyen Van A',
                            'format': 'Blended',
                            'capacity': '77/100',
                            'days': 'Monday (7h-9h)',
                            'cta': 'Register Course',
                        },
                        {
                            'id': 'slot-b',
                            'section': 'CO1002 · CC02 · Online',
                            'tutor': 'Nguyen Van B',
                            'format': 'Online',
                            'capacity': '68/100',
                            'days': 'Tuesday (7h-9h)',
                            'cta': 'Register Course',
                        },
                        {
                            'id': 'slot-c',
                            'section': 'CO1002 · CC03 · In-person',
                            'tutor': 'Nguyen Van C',
                            'format': 'In-person',
                            'capacity': '68/100',
                            'days': 'Wednesday (7h-9h)',
                            'cta': 'Register Course',
                        },
                        {
                            'id': 'slot-d',
                            'section': 'CO1002 · CC04 · In-person',
                            'tutor': 'Nguyen Van D',
                            'format': 'In-person',
                            'capacity': '56/100',
                            'days': 'Thursday (7h-9h)',
                            'cta': 'Register Course',
                        },
                    ],
                },
            },
            'courseDetails': {
                'c-data-structures': {
                    'courseId': 'c-data-structures',
                    'title': 'Data Structures and Algorithms',
                    'upcomingSessions': [
                        {
                            'id': 'sess-1',
                            'title': 'Sorting Algorithms (Meeting)',
                            'date': 'Friday, Oct 4',
                            'time': '7:30 AM - 9:30 AM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'sess-2',
                            'title': 'Advanced Algorithms (Lecture)',
                            'date': 'Monday, Oct 7',
                            'time': '10:00 AM - 12:00 PM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'sess-3',
                            'title': 'Linked List (Meeting)',
                            'date': 'Wednesday, Oct 9',
                            'time': '9:30 AM - 11:00 AM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'sess-4',
                            'title': 'Stack and Queues (Meeting)',
                            'date': 'Friday, Oct 11',
                            'time': '7:30 AM - 9:30 AM',
                            'cta': 'Join Session',
                        },
                    ],
                    'materials': ['Sorting Algorithms', 'Advanced Algorithms', 'Linked List', 'Stack and Queues'],
                    'quizzes': [
                        {
                            'id': 'quiz-1',
                            'title': 'Selection vs. Bubble vs. Insertion',
                            'category': 'Course: Data Structures and Algorithms',
                            'date': 'October 12, 2025 · 8:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'quiz-2',
                            'title': 'Non Comparison Sorting',
                            'category': 'Course: Data Structures and Algorithms',
                            'date': 'October 19, 2025 · 8:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'quiz-3',
                            'title': 'Hybrid Sorting Algorithms',
                            'category': 'Course: Data Structures and Algorithms',
                            'date': 'October 26, 2025 · 8:00 AM',
                            'status': 'Attempt Quiz',
                        },
                    ],
                },
            },
            'quizSession': {
                'courseId': 'c-intro-calculus',
                'title': 'Introduction to Calculus 1',
                'timeLeftMinutes': 5,
                'questions': [
                    {
                        'id': 'q1',
                        'text': '1 + 1 = ?',
                        'options': [
                            {'id': 'opt-a', 'label': 'A', 'value': '1'},
                            {'id': 'opt-b', 'label': 'B', 'value': '2'},
                            {'id': 'opt-c', 'label': 'C', 'value': '3'},
                            {'id': 'opt-d', 'label': 'D', 'value': '4'},
                        ],
                    },
                ],
            },
            'quizSummary': {
                'courseId': 'c-intro-calculus',
                'title': 'Quiz Completed',
                'score': '8/10',
                'duration': '1 min 40 secs',
                'stats': [
                    {'label': 'Correct Answers', 'value': '4/5'},
                    {'label': 'Review', 'value': 'Available'},
                ],
            },
            'schedule': {
                'month': 'September 2025',
                'events': [
                    {'id': 'ev-1', 'title': 'Calculus I Lecture', 'day': 'Mon', 'start': '09:00', 'end': '11:00', 'type': 'busy'},
                    {'id': 'ev-2', 'title': 'Database Lab', 'day': 'Wed', 'start': '11:00', 'end': '13:00', 'type': 'busy'},
                    {'id': 'ev-3', 'title': 'Student Consultation', 'day': 'Fri', 'start': '11:00', 'end': '12:00', 'type': 'busy'},
                    {'id': 'ev-4', 'title': 'AI & ML Seminar', 'day': 'Thu', 'start': '15:00', 'end': '17:00', 'type': 'busy'},
                    {'id': 'ev-5', 'title': 'Research Colloquium', 'day': 'Fri', 'start': '15:00', 'end': '17:00', 'type': 'busy'},
                ],
                'upcoming': [
                    {'id': 'up-1', 'title': 'Introduction to Data Science', 'date': 'Tue 01', 'time': '9:00 AM - 10:30 AM', 'cta': 'View Details'},
                    {'id': 'up-2', 'title': 'Advanced Algorithms', 'date': 'Wed 02', 'time': '1:00 PM - 2:30 PM', 'cta': 'View Details'},
                    {'id': 'up-3', 'title': 'Web Development Project', 'date': 'Thu 03', 'time': '11:00 AM - 12:00 PM', 'cta': 'View Details'},
                ],
            },
            'reschedule': {
                'grid': [
                    {'day': 'Monday', 'blocks': self._grid_row('busy', 'free', 'busy', 'busy')},
                    {'day': 'Tuesday', 'blocks': self._grid_row('busy', 'free', 'busy', 'busy')},
                    {'day': 'Wednesday', 'blocks': self._grid_row('free', 'free', 'busy', 'busy')},
                    {'day': 'Thursday', 'blocks': self._grid_row('free', 'busy', 'busy', 'busy')},
                    {'day': 'Friday', 'blocks': self._grid_row('free', 'busy', 'busy', 'busy')},
                    {'day': 'Saturday', 'blocks': self._grid_row('open', 'open', 'open', 'open')},
                    {'day': 'Sunday', 'blocks': self._grid_row('open', 'open', 'open', 'open')},
                ],
                'instructions': [
                    'Left-click and drag to highlight free time.',
                    'Right-click to mark busy time for tutoring.',
                    'Double-click any cell to reset it to open.',
                ],
            },
            'feedback': {
                'title': 'Feedback and Evaluation',
                'instructions': 'Provide your feedback for a tutoring session.',
                'sessions': ['CO2021 - Lecture 01 (Data Structures) · 2024-05-15'],
                'ratingScale': ['Awful', 'Poor', 'Fair', 'Neutral', 'Good', 'Very Good', 'Excellent'],
                'history': [
                    {
                        'id': 'fb-1',
                        'course': 'CS101',
                        'submittedOn': '2024-05-16',
                        'rating': 5,
                        'status': 'System: Good',
                        'summary': 'Session promoted active learning with clear explanations.',
                    },
                    {
                        'id': 'fb-2',
                        'course': 'MA201',
                        'submittedOn': '2024-05-11',
                        'rating': 4,
                        'status': 'System: Excellent',
                        'summary': 'Engaging and insightful examples.',
                    },
                    {
                        'id': 'fb-3',
                        'course': 'PH101',
                        'submittedOn': '2024-05-09',
                        'rating': 3,
                        'status': 'System: Neutral',
                        'summary': 'Could improve navigation speed.',
                    },
                ],
            },
            'profile': {
                'header': {'about': "I'm Student.", 'role': 'Student'},
                'contact': [
                    {'label': 'Email Address', 'value': 'nguyenvana@hcmut.edu.vn', 'icon': 'mail'},
                    {'label': 'Phone Number', 'value': '0901 234 567', 'icon': 'phone'},
                    {'label': 'Address', 'value': '123 Le Van Duyet Street, Binh Thanh Distr', 'icon': 'map'},
                ],
                'academics': [
                    {'label': 'Student ID', 'value': '20127001'},
                    {'label': 'Support Needs', 'value': ['Calculus 1', 'Digital System'], 'type': 'tags'},
                    {'label': 'Platform Links', 'value': ['https://facebook.com/in/nguyenvana'], 'type': 'tags'},
                ],
            },
            'academicRecords': {
                'studentInfo': {'name': 'John M. Doe', 'studentId': 'S123456789', 'semester': 'Fall 2023'},
                'gpa': '3.85',
                'standing': 'Excellent Academic Standing',
                'grades': [
                    {'course': 'Calculus I', 'grade': 'A', 'credits': 4},
                    {'course': 'Introduction to Programming', 'grade': 'A-', 'credits': 3},
                    {'course': 'Academic Writing', 'grade': 'B+', 'credits': 3},
                    {'course': 'General Chemistry', 'grade': 'A', 'credits': 4},
                    {'course': 'University Physics I', 'grade': 'A-', 'credits': 4},
                    {'course': 'Linear Algebra', 'grade': 'B+', 'credits': 3},
                ],
                'scholarships': [
                    {'title': "Dean's List Scholarship", 'amount': '$2,500', 'description': 'Awarded to students with exceptional academic performance each semester.'},
                    {'title': 'STEM Excellence Grant', 'amount': '$3,000', 'description': 'For excellence in Science, Technology, Engineering, and Mathematics.'},
                    {'title': 'TutorLink Merit Scholarship', 'amount': '$1,500', 'description': 'Merit-based scholarship for high-achieving students.'},
                ],
                'tutorLessons': [
                    {'title': 'Algebra Fundamentals', 'tutor': 'Jane Smith'},
                    {'title': 'Physics I Lab', 'tutor': 'Michael Johnson'},
                    {'title': 'Organic Chemistry', 'tutor': 'Emily White'},
                    {'title': 'Advanced Calculus', 'tutor': 'David Lee'},
                ],
                'eligibility': {
                    'status': 'Eligible',
                    'criteria': [
                        'Cumulative GPA of 3.5 or higher',
                        'Completed at least one full semester in Tutor Program',
                        'Enrolled full-time (12+ credits)',
                        'Good standing with the University',
                    ],
                },
            },
        }

    def _recommended_courses(self, role: Role):
        base_cards = [
            {
                'id': 'c-intro-programming',
                'title': 'Introduction to Programming',
                'code': 'CO1002',
                'format': 'Blended',
                'capacity': '70/100',
                'thumbnail': 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80',
                'actionLabel': 'Register Course' if role == 'student' else 'Register Tutor',
            },
            {
                'id': 'c-advanced-calculus',
                'title': 'Advanced Calculus',
                'code': 'M1T002',
                'format': 'In-person',
                'capacity': '50/60',
                'thumbnail': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80',
                'actionLabel': 'Register Course' if role == 'student' else 'Register Tutor',
            },
            {
                'id': 'c-quantum-physics',
                'title': 'Quantum Physics',
                'code': 'PH4003',
                'format': 'Online',
                'capacity': '30/40',
                'thumbnail': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
                'actionLabel': 'Register Course' if role == 'student' else 'Register Tutor',
            },
            {
                'id': 'c-literary-analysis',
                'title': 'Literary Analysis',
                'code': 'EN1002',
                'format': 'In-person',
                'capacity': '62/80',
                'thumbnail': 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
                'actionLabel': 'Register Course' if role == 'student' else 'Register Tutor',
            },
            {
                'id': 'c-digital-signal',
                'title': 'Digital Signal Processing',
                'code': 'CO3002',
                'format': 'Blended',
                'capacity': '47/70',
                'thumbnail': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
                'actionLabel': 'Register Course' if role == 'student' else 'Register Tutor',
            },
            {
                'id': 'c-cellular-biology',
                'title': 'Cellular Biology',
                'code': 'BI3002',
                'format': 'In-person',
                'capacity': '49/60',
                'thumbnail': 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
                'actionLabel': 'Register Course' if role == 'student' else 'Register Tutor',
            },
        ]
        return base_cards

    def _grid_row(self, a: str, b: str, c: str, d: str):
        return [a, b, c, d, a, b, c, d]

    def _build_tutor_bundle(self) -> Dict:
        student_bundle = self._build_student_bundle()
        tutor_bundle = {
            **student_bundle,
            'navigation': {
                'topLinks': ['courses', 'profile'],
                'sidebar': [
                    {
                        'title': 'Tutor Console',
                        'links': [
                            {'label': 'Dashboard', 'path': '/portal/tutor/home'},
                            {'label': 'Tutor-Student Course Match', 'path': '/portal/tutor/course-matching'},
                            {'label': 'Course Support', 'path': '/portal/tutor/course-detail/c-data-structures'},
                            {'label': 'My Schedule', 'path': '/portal/tutor/schedule'},
                            {'label': 'Reschedule Availability', 'path': '/portal/tutor/reschedule'},
                            {'label': 'Session Feedback', 'path': '/portal/tutor/tutor-feedback'},
                        ],
                    },
                ],
            },
            'user': asdict(self._user_directory['tutor']),
            'courseMatching': {
                **student_bundle['courseMatching'],
                'recommended': self._recommended_courses('tutor'),
                'history': [
                    {
                        'id': 'c-data-structures',
                        'title': 'Data Structures & Algorithms',
                        'code': 'CO2012',
                        'format': 'Blended',
                        'capacity': '80/100',
                        'tutor': 'You',
                        'thumbnail': 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=600&q=80',
                        'badge': 'Live',
                        'actionLabel': 'Manage Your Course',
                    },
                    {
                        'id': 'c-uiux',
                        'title': 'UI/UX Design Principles',
                        'code': 'DS3002',
                        'format': 'Online',
                        'capacity': '60/70',
                        'tutor': 'You',
                        'thumbnail': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
                        'badge': 'Starting Soon',
                        'actionLabel': 'Manage Your Course',
                    },
                ],
            },
            'courseSupport': {
                'upload': {
                    'title': 'Upload Course Materials',
                    'maxSize': '50MB',
                    'description': 'Drag & drop files here, or click to browse',
                },
                'quiz': {
                    'title': 'Create New Quiz',
                    'placeholders': {
                        'quizTitle': 'e.g., Introduction to Calculus Quiz 1',
                        'availability': ['Start Date', 'End Date'],
                    },
                },
                'meeting': {
                    'title': 'Schedule New Meeting',
                    'platformHint': 'Paste your link from Google Meet, Zoom, Teams, etc.',
                },
            },
            'tutorFeedback': {
                'attendance': [
                    {'id': 'stu-1', 'name': 'Nguyen Thi A', 'attended': True, 'inClassScore': 9},
                    {'id': 'stu-2', 'name': 'Tran Van Binh', 'attended': True, 'inClassScore': 8},
                    {'id': 'stu-3', 'name': 'Le Kim C', 'attended': True, 'inClassScore': 10},
                    {'id': 'stu-4', 'name': 'Pham Minh Duy', 'attended': False, 'inClassScore': 0},
                ],
                'sessionRating': 5,
                'history': student_bundle['feedback']['history'],
            },
            'profile': {
                'header': {'about': "I'm Tutor.", 'role': 'Tutor'},
                'contact': [
                    {'label': 'Email Address', 'value': 'nguyenvana@hcmut.edu.vn', 'icon': 'mail'},
                    {'label': 'Phone Number', 'value': '0901 234 567', 'icon': 'phone'},
                    {'label': 'Address', 'value': '123 Le Van Duyet Street, Binh Thanh Distr', 'icon': 'map'},
                ],
                'academics': [
                    {'label': 'Areas of Expertise', 'value': ['Calculus 1', 'Discrete Structure'], 'type': 'tags'},
                    {'label': 'Platform Links', 'value': ['https://linkedin.com/in/nguyenvana', 'https://github.com/nguyenvana'], 'type': 'tags'},
                ],
            },
        }
        return tutor_bundle

    def _build_staff_bundle(self) -> Dict:
        return {
            'navigation': {
                'topLinks': ['courses', 'profile'],
                'sidebar': [
                    {
                        'title': 'Staff Operations',
                        'links': [
                            {'label': 'Academic Records', 'path': '/portal/staff/academic-records'},
                            {'label': 'Scholarship Board', 'path': '/portal/staff/records'},
                            {'label': 'Feedback Generation', 'path': '/portal/staff/feedback-generation'},
                            {'label': 'Notify Students', 'path': '/portal/staff/notify-students'},
                            {'label': 'Generate Reports', 'path': '/portal/staff/reports'},
                        ],
                    },
                ],
            },
            'user': asdict(self._user_directory['staff']),
            'announcements': {
                'heroImage': 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1600&q=80',
                'title': 'Office of Student Affairs',
                'subtitle': 'Monitor scholarships, reports, and compliance from a single control room.',
                'items': [],
            },
            'profile': {
                'header': {'about': 'University staff dedicated to student success.', 'role': 'Staff'},
                'contact': [
                    {'label': 'Email Address', 'value': 'osa@hcmut.edu.vn', 'icon': 'mail'},
                    {'label': 'Phone Number', 'value': '(84-8) 3864 7256 - 7204', 'icon': 'phone'},
                    {'label': 'Office', 'value': '268 Ly Thuong Kiet, District 10, HCMC', 'icon': 'map'},
                ],
                'academics': [
                    {'label': 'Department', 'value': 'Office of Student Affairs'},
                    {'label': 'Focus', 'value': ['Scholarships', 'Academic Records'], 'type': 'tags'},
                    {'label': 'Support Links', 'value': ['support@hcmut.edu.vn'], 'type': 'tags'},
                ],
            },
            'staffRecords': {
                'metrics': [
                    {'label': 'Total Students Enrolled', 'value': '8,542', 'caption': 'Current active student count'},
                    {'label': 'Scholarships Awarded (YTD)', 'value': '$125,000', 'caption': 'Total financial aid distributed'},
                    {'label': 'Average GPA', 'value': '3.68', 'caption': 'Across all active students'},
                    {'label': 'Pending Training Credits', 'value': '15', 'caption': 'Students awaiting credit approval'},
                ],
                'table': [
                    {'order': 1, 'studentId': '2356224', 'name': 'Nguyen Thi An', 'major': 'Computer Science', 'gpa': '3.85', 'status': 'Active'},
                    {'order': 2, 'studentId': '2353154', 'name': 'Tran Van Binh', 'major': 'Electrical Eng.', 'gpa': '3.60', 'status': 'Active'},
                    {'order': 3, 'studentId': '2357160', 'name': 'Le Thi Cuc', 'major': 'Chemical Eng.', 'gpa': '3.92', 'status': 'Active'},
                    {'order': 4, 'studentId': '2357281', 'name': 'Pham Minh Duy', 'major': 'Civil Eng.', 'gpa': '3.45', 'status': 'Active'},
                ],
                'notifications': [
                    {'title': 'Scholarship Awarded', 'body': "You've been awarded the Academic Excellence Grant.", 'timeAgo': '2 hours ago'},
                    {'title': 'New Academic Report', 'body': 'A new academic performance report is ready for viewing.', 'timeAgo': 'Yesterday'},
                ],
                'quickActions': [
                    {'label': 'Generate Academic Report', 'path': '/portal/staff/reports'},
                    {'label': 'Generate Scholarship Report', 'path': '/portal/staff/reports'},
                    {'label': 'Notify Student', 'path': '/portal/staff/notify-students'},
                ],
                'tabs': ['Student Academic Records', 'Scholarship & Training Credits', 'Award Management'],
            },
            'notifications': {
                'recipients': ['Tutor Program', 'Office of Student Affairs', 'Academic Department'],
                'templates': ['Academic Alert', 'Scholarship Update', 'System Maintenance'],
                'channels': ['Send Notification', 'Send to Office of Student Affairs', 'Send to Academic Department'],
                'selectedStudents': ['Alice Smith (Math 101)', 'Bob Johnson (CS 201)', 'Charlie Brown (Lit 303)'],
            },
            'reports': {
                'academic': {
                    'reportName': 'Performance Analysis',
                    'academicYear': '2023-2024',
                    'semester': 'Full Year',
                    'filters': [
                        {'label': 'Student Group', 'value': 'All Undergraduate'},
                        {'label': 'Reporting Period', 'value': 'Jan 01, 2023 - Dec 31, 2023'},
                    ],
                    'options': [
                        'Calculus I', 'Linear Algebra', 'Operating Systems', 'Web Development', 'Physics II',
                        'Data Structures', 'Artificial Intelligence', 'Database Management',
                    ],
                },
                'scholarship': {
                    'reportName': 'Spring 2024 Scholarship Report',
                    'academicYear': '2023-2024',
                    'semester': 'Spring',
                    'filters': [
                        {'label': 'Academic Standing', 'value': 'Good Standing'},
                        {'label': 'Enrollment Status', 'value': 'Full-time'},
                        {'label': 'Minimum GPA', 'value': '3.5'},
                    ],
                    'options': ['Academic Merit', 'Financial Need', 'Specific Major Requirement'],
                },
                'feedback': {
                    'reportName': 'Feedback Generation',
                    'academicYear': '2024',
                    'filters': [
                        {'label': 'Session', 'value': 'CO2021 - Lecture 01 (Data Structures)'},
                    ],
                    'options': ['Generate Student Report', 'Generate Tutor Report', 'Generate System Report'],
                },
            },
        }

    def find_user_by_email(self, email: str) -> User:
        local_part = email.split('@')[0].lower()
        if local_part.startswith('student'):
            return self._user_directory['student']
        if local_part.startswith('tutor'):
            return self._user_directory['tutor']
        return self._user_directory['staff']

    def get_portal_bundle(self, role: Role) -> Dict:
        return self._bundles[role]
