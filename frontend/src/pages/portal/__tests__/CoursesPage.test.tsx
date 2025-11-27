import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoursesPage from '../CoursesPage';
import { useAuth } from '../../../context/AuthContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe('CoursesPage (Course GUI)', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('shows a placeholder when no courses exist', () => {
    mockedUseAuth.mockReturnValue({
      portal: { courses: undefined },
      role: 'student',
    } as any);

    render(<CoursesPage />);

    expect(screen.getByText('No registered courses found.')).toBeInTheDocument();
  });

  it('navigates to course details when Access Course is clicked', async () => {
    mockedUseAuth.mockReturnValue({
      portal: {
        courses: {
          title: 'My Courses',
          description: '',
          courses: [{ id: 'c-math101', title: 'Math 101', code: 'MATH101', thumbnail: '' }],
        },
      },
      role: 'student',
    } as any);

    const user = userEvent.setup();
    render(<CoursesPage />);

    await user.click(screen.getByRole('button', { name: 'Access Course' }));

    expect(mockNavigate).toHaveBeenCalledWith('/portal/student/course-detail/math101');
  });
});
