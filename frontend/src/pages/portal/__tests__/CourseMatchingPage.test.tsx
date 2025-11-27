import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseMatchingPage from '../CourseMatchingPage';
import { useAuth } from '../../../context/AuthContext';

const showToast = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../hooks/useStackedToasts', () => ({
  useStackedToasts: () => ({
    toasts: [],
    showToast,
  }),
}));

const mockedUseAuth = vi.mocked(useAuth);

const courseMatching = {
  recommended: [
    {
      id: 'c-1',
      title: 'Advanced Calculus',
      code: 'CAL101',
      format: 'In-person',
      capacity: '10/25',
      actionLabel: 'Register',
      thumbnail: '',
    },
    {
      id: 'c-2',
      title: 'Quantum Design Thinking',
      code: 'DES205',
      format: 'Online',
      capacity: '22/24',
      actionLabel: 'Register',
      thumbnail: '',
    },
  ],
  history: [],
  modal: {
    focusCourseId: 'c-1',
    slots: [
      {
        id: 'slot-1',
        section: 'CAL101 - Morning Section',
        tutor: 'Dr. AI',
        format: 'In-person',
        capacity: '8/25',
        days: 'Tuesday',
        cta: 'Register Course',
      },
      {
        id: 'slot-2',
        section: 'DES205 - Online Studio',
        tutor: 'Coach Bot',
        format: 'Online',
        capacity: '10/24',
        days: 'Thursday',
        cta: 'Register Course',
      },
    ],
  },
};

describe('CourseMatchingPage (Tutor-Student Course Matching GUI)', () => {
  beforeEach(() => {
    showToast.mockClear();
    mockedUseAuth.mockReturnValue({
      portal: { courseMatching },
      role: 'tutor',
    } as any);
  });

  it('filters courses and registers via the modal', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/portal/tutor/course-matching']}>
        <Routes>
          <Route path="/portal/:role/course-matching" element={<CourseMatchingPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Advanced Calculus')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Quantum Design Thinking')[0]).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Search for courses...'), 'Quantum');
    expect(screen.queryAllByText('Advanced Calculus')).toHaveLength(0);

    const searchInput = screen.getByPlaceholderText('Search for courses...');
    await user.clear(searchInput);

    await user.click(screen.getAllByRole('button', { name: 'Register Course' })[0]);

    await user.click(screen.getByRole('button', { name: 'In-person' }));

    expect(showToast).toHaveBeenCalledWith('Registered Advanced Calculus in In-person');
  });

  it('auto-matches courses for students', async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue({
      portal: { courseMatching },
      role: 'student',
    } as any);

    render(
      <MemoryRouter initialEntries={['/portal/student/course-matching']}>
        <Routes>
          <Route path="/portal/:role/course-matching" element={<CourseMatchingPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getAllByRole('button', { name: 'Register Course' })[0]);
    await user.click(screen.getByRole('button', { name: 'AI Auto-match to best section' }));

    await waitFor(
      () => expect(showToast).toHaveBeenCalledWith(expect.stringContaining('CAL101 - Morning Section')),
      { timeout: 5000 },
    );
    expect(await screen.findByRole('button', { name: 'Go To Your Course' })).toBeInTheDocument();
    expect(screen.getByText(/Tutor: Dr\. AI/)).toBeInTheDocument();
    expect(screen.getAllByText(/AI matched/i).length).toBeGreaterThan(0);
  });
});
