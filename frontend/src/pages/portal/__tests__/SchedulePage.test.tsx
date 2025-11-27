import { render, screen } from '@testing-library/react';
import SchedulePage from '../SchedulePage';
import { useAuth } from '../../../context/AuthContext';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ role: 'student' }),
    useOutletContext: () => ({ isSidebarOpen: false }),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

describe('SchedulePage (Scheduling GUI)', () => {
  it('renders a fallback message when no schedule data exists', () => {
    mockedUseAuth.mockReturnValue({
      portal: { schedule: undefined },
    } as any);

    render(<SchedulePage />);

    expect(screen.getByText('Schedule data unavailable.')).toBeInTheDocument();
  });
});
