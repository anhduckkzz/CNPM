from __future__ import annotations

from dataclasses import asdict
from typing import Dict

from app.models.user import Role, User

HERO_IMAGE_URL = '/images/hcmut2.png'


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
                name='Nguy\u1ec5n V\u0103n An',
                email='student@hcmut.edu.vn',
                title='Student, Computer Science',
                avatar='https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80',
                role='student',
            ),
            'tutor': User(
                identifier='tutor-1975',
                name='Nguy\u1ec5n V\u0103n An',
                email='tutor@hcmut.edu.vn',
                title='Tutor, Data Structures',
                avatar='https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80',
                role='tutor',
            ),
            'staff': User(
                identifier='staff-osa',
                name='Tr\u1ea7n Th\u1ecb Minh Ch\xe2u',
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
                            {'label': 'Courses', 'path': '/portal/student/courses'},
                            {'label': 'Academic Records', 'path': '/portal/student/academic-records'},
                        ],
                    },
                    {
                        'title': 'Student Hub',
                        'links': [
                            {'label': 'Course Registration', 'path': '/portal/student/course-matching'},
                            {'label': 'My Schedule', 'path': '/portal/student/schedule'},
                            {'label': 'Session Feedback', 'path': '/portal/student/feedback'},
                        ],
                    },
                ],
            },
            'user': asdict(self._user_directory['student']),
            'announcements': {
                'heroImage': HERO_IMAGE_URL,
                'title': 'Site Announcements',
                'subtitle': 'Latest updates for the HCMUT community.',
                'items': [
                    {
                        'id': 'ann-1',
                        'title': 'Guide to Installing Moodle Mobile',
                        'author': 'User Admin',
                        'role': 'Digital Learning',
                        'timestamp': 'Friday, December 8, 2023 at 3:27 PM',
                        'body': 'Install the Moodle application on mobile devices to follow announcements and deadlines seamlessly.',
                        'repliesLabel': 'Discuss this topic (8 replies)',
                    },
                    {
                        'id': 'ann-2',
                        'title': 'New Course Registration Period Announced',
                        'author': 'Academic Affairs',
                        'role': 'Registrar',
                        'timestamp': 'Monday, January 15, 2024 at 10:00 AM',
                        'body': 'Registration for the upcoming semester opens next week. Review prerequisites and session availability before confirming.',
                        'repliesLabel': 'Discuss this topic (6 replies)',
                    },
                    {
                        'id': 'ann-3',
                        'title': 'Important Security Update for Student Portals',
                        'author': 'IT Department',
                        'role': 'Security',
                        'timestamp': 'Wednesday, February 1, 2024 at 2:04 PM',
                        'body': 'A portal-wide security update has been applied. Reset your password on next login to keep accounts secured.',
                        'repliesLabel': 'Discuss this topic (2 replies)',
                    },
                ],
            },
            'courseMatching': {
                'title': 'Course Registration',
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
                            'section': 'CO1002 at CC01 at In-person',
                            'tutor': 'Nguy\u1ec5n V\u0103n An',
                            'format': 'Blended',
                            'capacity': '77/100',
                            'days': 'Monday (7h-9h)',
                            'cta': 'Register Course',
                        },
                        {
                            'id': 'slot-b',
                            'section': 'CO1002 at CC02 at Online',
                            'tutor': 'Nguy\u1ec5n V\u0103n B\xecnh',
                            'format': 'Online',
                            'capacity': '68/100',
                            'days': 'Tuesday (7h-9h)',
                            'cta': 'Register Course',
                        },
                        {
                            'id': 'slot-c',
                            'section': 'CO1002 at CC03 at In-person',
                            'tutor': 'Nguy\u1ec5n V\u0103n C\u01b0\u1eddng',
                            'format': 'In-person',
                            'capacity': '68/100',
                            'days': 'Wednesday (7h-9h)',
                            'cta': 'Register Course',
                        },
                        {
                            'id': 'slot-d',
                            'section': 'CO1002 at CC04 at In-person',
                            'tutor': 'Nguy\u1ec5n V\u0103n D\u0169ng',
                            'format': 'In-person',
                            'capacity': '56/100',
                            'days': 'Thursday (7h-9h)',
                            'cta': 'Register Course',
                        },
                    ],
                },
            },
            'courses': {
                'title': 'Courses',
                'description': 'Your registered classes for this semester.',
                'courses': [
                    {
                        'id': 'c-intro-programming',
                        'title': 'Introduction to Programming',
                        'code': 'CO1002',
                        'thumbnail': 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80',
                    },
                    {
                        'id': 'c-advanced-calculus',
                        'title': 'Advanced Calculus',
                        'code': 'M1T003',
                        'thumbnail': 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=900&q=80',
                    },
                    {
                        'id': 'c-quantum-physics',
                        'title': 'Quantum Physics',
                        'code': 'PH4021',
                        'thumbnail': 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
                    },
                    {
                        'id': 'c-literary-analysis',
                        'title': 'Literary Analysis',
                        'code': 'EN1004',
                        'thumbnail': 'https://images.unsplash.com/photo-1455885666463-1b2ac11fca08?auto=format&fit=crop&w=900&q=80',
                    },
                    {
                        'id': 'c-data-structures',
                        'title': 'Data Structures and Algorithms',
                        'code': 'CO2002',
                        'thumbnail': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
                    },
                    {
                        'id': 'c-cellular-biology',
                        'title': 'Cellular Biology',
                        'code': 'BI3002',
                        'thumbnail': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
                    },
                ],
            },
            'courseDetails': {

                'c-data-structures': {
                    'courseId': 'c-data-structures',
                    'title': 'Data Structures and Algorithms',
                    'upcomingSessions': [
                        {
                            'id': 'dsa-sess-1',
                            'title': 'Sorting Algorithms (Meetup)',
                            'date': 'Friday, Oct 4',
                            'time': '7:30 AM - 9:30 AM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'dsa-sess-2',
                            'title': 'Advanced Graphs (Lecture)',
                            'date': 'Monday, Oct 7',
                            'time': '10:00 AM - 12:00 PM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'dsa-sess-3',
                            'title': 'Linked List Clinic',
                            'date': 'Wednesday, Oct 9',
                            'time': '9:30 AM - 11:00 AM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'dsa-sess-4',
                            'title': 'Stack & Queues Workshop',
                            'date': 'Friday, Oct 11',
                            'time': '7:30 AM - 9:30 AM',
                            'cta': 'Join Session',
                        },
                    ],
                    'materials': [
                        {'title': 'Sorting Algorithms Playbook', 'type': 'pdf'},
                        {'title': 'Graph & Tree Patterns', 'type': 'video'},
                        {'title': 'Linked List Workbook', 'type': 'pdf'},
                        {'title': 'Stack and Queue Patterns', 'type': 'slides'},
                    ],
                    'quizzes': [
                        {
                            'id': 'dsa-quiz-1',
                            'title': 'Selection, Bubble & Insertion showdown',
                            'category': 'Sorting Algorithms Module',
                            'date': 'October 12, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'dsa-quiz-2',
                            'title': 'Non-comparison sorting challenge',
                            'category': 'Course: Data Structures and Algorithms',
                            'date': 'October 19, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'dsa-quiz-3',
                            'title': 'Hybrid Sorting Marathon',
                            'category': 'Course: Data Structures and Algorithms',
                            'date': 'October 26, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                    ],
                },
                'c-intro-programming': {
                    'courseId': 'c-intro-programming',
                    'title': 'Introduction to Programming',
                    'upcomingSessions': [
                        {
                            'id': 'intro-sess-1',
                            'title': 'Variables & Data Types Lab',
                            'date': 'Monday, Oct 6',
                            'time': '8:00 AM - 9:30 AM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'intro-sess-2',
                            'title': 'Control Flow Workshop',
                            'date': 'Wednesday, Oct 8',
                            'time': '1:00 PM - 3:00 PM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'intro-sess-3',
                            'title': 'Functions & Testing Clinic',
                            'date': 'Friday, Oct 10',
                            'time': '9:00 AM - 11:00 AM',
                            'cta': 'Join Session',
                        },
                    ],
                    'materials': [
                        {'title': 'Course Orientation & Style Guide', 'type': 'pdf'},
                        {'title': 'Loops & Iterations Slides', 'type': 'slides'},
                        {'title': 'Function Practice Pack', 'type': 'pdf'},
                        {'title': 'Debugging Checklist', 'type': 'video'},
                    ],
                    'quizzes': [
                        {
                            'id': 'intro-quiz-1',
                            'title': 'Syntax & Variables quiz',
                            'category': 'Week 2 Fundamentals',
                            'date': 'October 11, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'intro-quiz-2',
                            'title': 'Control Flow challenge',
                            'category': 'Week 3 Fundamentals',
                            'date': 'October 18, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'intro-quiz-3',
                            'title': 'Functions & Arrays check-in',
                            'category': 'Week 4 Fundamentals',
                            'date': 'October 25, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                    ],
                },
                'c-advanced-calculus': {
                    'courseId': 'c-advanced-calculus',
                    'title': 'Advanced Calculus',
                    'upcomingSessions': [
                        {
                            'id': 'calc-sess-1',
                            'title': 'Series Convergence Discussion',
                            'date': 'Tuesday, Oct 7',
                            'time': '10:00 AM - 12:00 PM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'calc-sess-2',
                            'title': 'Laplace Transform Clinic',
                            'date': 'Thursday, Oct 9',
                            'time': '2:00 PM - 4:00 PM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'calc-sess-3',
                            'title': 'Partial Derivatives Studio',
                            'date': 'Saturday, Oct 11',
                            'time': '8:00 AM - 10:00 AM',
                            'cta': 'Join Session',
                        },
                    ],
                    'materials': [
                        {'title': 'Real Analysis Refresher', 'type': 'pdf'},
                        {'title': 'Differential Equations Workbook', 'type': 'pdf'},
                        {'title': 'Laplace Techniques Notes', 'type': 'slides'},
                        {'title': 'Practice Midterm Question Bank', 'type': 'sheet'},
                    ],
                    'quizzes': [
                        {
                            'id': 'calc-quiz-1',
                            'title': 'Sequences & Series check',
                            'category': 'Advanced Calculus Module',
                            'date': 'October 13, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'calc-quiz-2',
                            'title': 'Vector calculus warmup',
                            'category': 'Advanced Calculus Module',
                            'date': 'October 20, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'calc-quiz-3',
                            'title': 'Laplace transform sprint',
                            'category': 'Advanced Calculus Module',
                            'date': 'October 27, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                    ],
                },
                'c-quantum-physics': {
                    'courseId': 'c-quantum-physics',
                    'title': 'Quantum Physics',
                    'upcomingSessions': [
                        {
                            'id': 'quantum-sess-1',
                            'title': 'Wave Functions Seminar',
                            'date': 'Monday, Oct 6',
                            'time': '3:00 PM - 4:30 PM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'quantum-sess-2',
                            'title': 'Particle Spin Lab',
                            'date': 'Thursday, Oct 9',
                            'time': '9:00 AM - 11:00 AM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'quantum-sess-3',
                            'title': 'Quantum Gates Workshop',
                            'date': 'Monday, Oct 13',
                            'time': '1:00 PM - 3:00 PM',
                            'cta': 'Join Session',
                        },
                    ],
                    'materials': [
                        {'title': 'Dirac Notation Primer', 'type': 'pdf'},
                        {'title': 'Schr\xf6dinger Equation Set', 'type': 'slides'},
                        {'title': 'Quantum Experiment Recap', 'type': 'video'},
                        {'title': 'Qubit Simulation Starter Pack', 'type': 'code'},
                    ],
                    'quizzes': [
                        {
                            'id': 'quantum-quiz-1',
                            'title': 'Wave mechanics quiz',
                            'category': 'Quantum Physics Module',
                            'date': 'October 14, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'quantum-quiz-2',
                            'title': 'Quantum numbers checkpoint',
                            'category': 'Quantum Physics Module',
                            'date': 'October 21, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'quantum-quiz-3',
                            'title': 'Entanglement & decoherence',
                            'category': 'Quantum Physics Module',
                            'date': 'October 28, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                    ],
                },
                'c-literary-analysis': {
                    'courseId': 'c-literary-analysis',
                    'title': 'Literary Analysis',
                    'upcomingSessions': [
                        {
                            'id': 'lit-sess-1',
                            'title': 'Victorian Poetry Circle',
                            'date': 'Tuesday, Oct 7',
                            'time': '4:00 PM - 5:30 PM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'lit-sess-2',
                            'title': 'Close Reading Workshop',
                            'date': 'Thursday, Oct 9',
                            'time': '11:00 AM - 12:30 PM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'lit-sess-3',
                            'title': 'Narrative Structures Salon',
                            'date': 'Monday, Oct 13',
                            'time': '9:00 AM - 10:30 AM',
                            'cta': 'Join Session',
                        },
                    ],
                    'materials': [
                        {'title': 'Semester Syllabus & Text Packet', 'type': 'pdf'},
                        {'title': 'Critical Theory Summary Cards', 'type': 'slides'},
                        {'title': 'Poetry Analysis Toolkit', 'type': 'pdf'},
                        {'title': 'Workshop Reading Set', 'type': 'pdf'},
                    ],
                    'quizzes': [
                        {
                            'id': 'lit-quiz-1',
                            'title': 'Romantic poetry check-in',
                            'category': 'Literary Analysis Module',
                            'date': 'October 12, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'lit-quiz-2',
                            'title': 'Narrative voice quiz',
                            'category': 'Literary Analysis Module',
                            'date': 'October 19, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'lit-quiz-3',
                            'title': 'Comparative essay outline review',
                            'category': 'Literary Analysis Module',
                            'date': 'October 26, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                    ],
                },
                'c-cellular-biology': {
                    'courseId': 'c-cellular-biology',
                    'title': 'Cellular Biology',
                    'upcomingSessions': [
                        {
                            'id': 'bio-sess-1',
                            'title': 'Cell Membrane Lab',
                            'date': 'Wednesday, Oct 8',
                            'time': '8:00 AM - 10:00 AM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'bio-sess-2',
                            'title': 'Genetics Problem Hour',
                            'date': 'Friday, Oct 10',
                            'time': '1:00 PM - 2:30 PM',
                            'cta': 'Join Session',
                        },
                        {
                            'id': 'bio-sess-3',
                            'title': 'Lab Safety & Instrument Refresher',
                            'date': 'Monday, Oct 13',
                            'time': '3:00 PM - 4:30 PM',
                            'cta': 'Join Session',
                        },
                    ],
                    'materials': [
                        {'title': 'Microscopy Slides Deck', 'type': 'slides'},
                        {'title': 'Wet Lab Manual', 'type': 'pdf'},
                        {'title': 'Genome Editing Briefing', 'type': 'video'},
                        {'title': 'Cell Cycle Cheat Sheet', 'type': 'sheet'},
                    ],
                    'quizzes': [
                        {
                            'id': 'bio-quiz-1',
                            'title': 'Cell components review',
                            'category': 'Cellular Biology Module',
                            'date': 'October 13, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'bio-quiz-2',
                            'title': 'DNA repair mechanisms',
                            'category': 'Cellular Biology Module',
                            'date': 'October 20, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                        {
                            'id': 'bio-quiz-3',
                            'title': 'Cell cycle regulation check-in',
                            'category': 'Cellular Biology Module',
                            'date': 'October 27, 2025 - 08:00 AM',
                            'status': 'Attempt Quiz',
                        },
                    ],
                },
            },
            'quizSession': {
                'courseId': 'c-data-structures',
                'title': 'Sorting Algorithms Weekend Assessment',
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
                    {
                        'id': 'q2',
                        'text': 'Which data structure works on FIFO principle?',
                        'options': [
                            {'id': 'opt-a2', 'label': 'A', 'value': 'Stack'},
                            {'id': 'opt-b2', 'label': 'B', 'value': 'Queue'},
                            {'id': 'opt-c2', 'label': 'C', 'value': 'Tree'},
                            {'id': 'opt-d2', 'label': 'D', 'value': 'Graph'},
                        ],
                    },
                    {
                        'id': 'q3',
                        'text': 'What is the time complexity of binary search?',
                        'options': [
                            {'id': 'opt-a3', 'label': 'A', 'value': 'O(n)'},
                            {'id': 'opt-b3', 'label': 'B', 'value': 'O(log n)'},
                            {'id': 'opt-c3', 'label': 'C', 'value': 'O(n log n)'},
                            {'id': 'opt-d3', 'label': 'D', 'value': 'O(n^2)'},
                        ],
                    },
                    {
                        'id': 'q4',
                        'text': 'Which sorting algorithm is stable by default?',
                        'options': [
                            {'id': 'opt-a4', 'label': 'A', 'value': 'Quick sort'},
                            {'id': 'opt-b4', 'label': 'B', 'value': 'Merge sort'},
                            {'id': 'opt-c4', 'label': 'C', 'value': 'Heap sort'},
                            {'id': 'opt-d4', 'label': 'D', 'value': 'Selection sort'},
                        ],
                    },
                ],
            },
            'quizSummary': {
                'courseId': 'c-data-structures',
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
                'sessions': ['CO2021 - Lecture 01 (Data Structures) at 2024-05-15'],
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
                'studentInfo': {'name': 'L\xea Minh Khoa', 'studentId': '2310456', 'semester': 'Fall 2023'},
                'gpa': '3.85',
                'standing': 'Excellent Academic Standing',
                'grades': [
                    {'course': 'Programming Fundamentals', 'grade': 'A+', 'credits': 4, 'scale4': 3.98},
                    {'course': 'Discrete Mathematics for Computer Science', 'grade': 'A', 'credits': 3, 'scale4': 3.7},
                    {'course': 'Data Structures & Algorithms', 'grade': 'A', 'credits': 4, 'scale4': 3.85},
                    {'course': 'Computer Organization and Architecture', 'grade': 'C+', 'credits': 3, 'scale4': 2.6},
                    {'course': 'Operating Systems', 'grade': 'A', 'credits': 4, 'scale4': 3.8},
                    {'course': 'Database Systems', 'grade': 'A+', 'credits': 3, 'scale4': 3.95},
                    {'course': 'Computer Networks', 'grade': 'C', 'credits': 3, 'scale4': 2.4},
                    {'course': 'Software Engineering Practices', 'grade': 'A', 'credits': 3, 'scale4': 3.6},
                    {'course': 'Artificial Intelligence Foundations', 'grade': 'A', 'credits': 3, 'scale4': 3.75},
                    {'course': 'Machine Learning Fundamentals', 'grade': 'D+', 'credits': 3, 'scale4': 2.2},
                    {'course': 'Human-Computer Interaction', 'grade': 'A', 'credits': 3, 'scale4': 3.55},
                    {'course': 'Cybersecurity Principles', 'grade': 'D+', 'credits': 2, 'scale4': 2.0},
                    {'course': 'Distributed Systems', 'grade': 'A', 'credits': 3, 'scale4': 3.65},
                    {'course': 'Cloud Computing Architecture', 'grade': 'A', 'credits': 3, 'scale4': 3.72},
                    {'course': 'Parallel Programming', 'grade': 'D', 'credits': 3, 'scale4': 1.8},
                ],
                'scholarships': [
                    {'title': "Dean's List Scholarship", 'amount': '$2,500', 'description': 'Awarded to students with exceptional academic performance each semester.'},
                    {'title': 'STEM Excellence Grant', 'amount': '$3,000', 'description': 'For excellence in Science, Technology, Engineering, and Mathematics.'},
                    {'title': 'TutorLink Merit Scholarship', 'amount': '$1,500', 'description': 'Merit-based scholarship for high-achieving students.'},
                ],
                'tutorLessons': [
                    {'title': 'Algebra Fundamentals', 'tutor': 'Nguy\u1ec5n Th\u1ecb Minh Ch\xe2u'},
                    {'title': 'Physics I Lab', 'tutor': 'Tr\u1ea7n H\u1eefu Kh\xe1nh'},
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
                            {'label': 'Course Registration', 'path': '/portal/tutor/course-matching'},
                            {'label': 'My Schedule', 'path': '/portal/tutor/schedule'},
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
                    {'id': 'stu-1', 'name': 'Nguy\u1ec5n Th\u1ecb \xc1nh', 'attended': True, 'inClassScore': 9},
                    {'id': 'stu-2', 'name': 'Tr\u1ea7n V\u0103n B\xecnh', 'attended': True, 'inClassScore': 8},
                    {'id': 'stu-3', 'name': 'L\xea Kim Chi', 'attended': True, 'inClassScore': 10},
                    {'id': 'stu-4', 'name': 'Ph\u1ea1m Minh Duy', 'attended': False, 'inClassScore': 0},
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
                            {'label': 'Feedback Generation', 'path': '/portal/staff/feedback-generation'},
                        ],
                    },
                ],
            },
            'user': asdict(self._user_directory['staff']),
            'announcements': {
                'heroImage': HERO_IMAGE_URL,
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
                    {'order': 1, 'studentId': '2315622', 'name': 'Nguy\u1ec5n Th\u1ecb An', 'major': 'Computer Science', 'gpa': '3.85', 'status': 'Active'},
                    {'order': 2, 'studentId': '2315315', 'name': 'Tr\u1ea7n V\u0103n B\xecnh', 'major': 'Electrical Eng.', 'gpa': '3.60', 'status': 'Active'},
                    {'order': 3, 'studentId': '2315716', 'name': 'L\xea Th\u1ecb C\xfac', 'major': 'Chemical Eng.', 'gpa': '3.92', 'status': 'Active'},
                    {'order': 4, 'studentId': '2315728', 'name': 'Ph\u1ea1m Minh Duy', 'major': 'Civil Eng.', 'gpa': '3.45', 'status': 'Active'},
                ],
                'notifications': [
                    {'title': 'Scholarship Awarded', 'body': "You've been awarded the Academic Excellence Grant.", 'timeAgo': '2 hours ago'},
                    {'title': 'New Academic Report', 'body': 'A new academic performance report is ready for viewing.', 'timeAgo': 'Yesterday'},
                ],
                'quickActions': [
                    {'label': 'Open Scholarship Board', 'path': '/portal/staff/records'},
                    {'label': 'Notify Students', 'path': '/portal/staff/notify-students'},
                    {'label': 'Generate Reports', 'path': '/portal/staff/reports'},
                ],
                'tabs': ['Student Academic Records', 'Scholarship & Training Credits', 'Award Management'],
            },
            'notifications': {
                'recipients': ['Tutor Program', 'Office of Student Affairs', 'Academic Department'],
                'templates': ['Academic Alert', 'Scholarship Update', 'System Maintenance'],
                'channels': ['Send Notification', 'Send to Office of Student Affairs', 'Send to Academic Department'],
                'selectedStudents': ['Tr\u1ea7n Th\u1ecb Lan (Math 101)', 'Nguy\u1ec5n \u0110\u1ee9c Long (CS 201)', 'Ph\u1ea1m Gia B\u1ea3o (Lit 303)'],
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

