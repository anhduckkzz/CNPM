import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '../ProfilePage';
import { useAuth } from '../../../context/AuthContext';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const profileData = {
  header: { about: 'Bio', role: 'Student' },
  contact: [{ label: 'Personal Email', value: 'me@example.com', icon: '', editable: true }],
  academics: [{ label: 'Student ID', value: '2353101' }],
};

const user = {
  id: 'u-1',
  name: 'Sample Student',
  title: 'CS Student',
  email: 'student@hcmut.edu.vn',
  avatar: '/avatar.png',
  role: 'student' as const,
};

describe('ProfilePage (Profile Management GUI)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a fallback message when profile data is unavailable', () => {
    mockedUseAuth.mockReturnValue({
      portal: undefined,
      user: undefined,
      updateAvatar: vi.fn(),
    } as any);

    render(<ProfilePage />);

    expect(screen.getByText('Profile data unavailable.')).toBeInTheDocument();
  });

  it('enters edit mode when the user clicks Edit', async () => {
    mockedUseAuth.mockReturnValue({
      portal: { profile: profileData },
      user,
      updateAvatar: vi.fn(),
    } as any);

    const userSession = userEvent.setup();
    render(<ProfilePage />);

    const editButton = await screen.findByRole('button', { name: 'Edit' });
    await userSession.click(editButton);

    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });
});
