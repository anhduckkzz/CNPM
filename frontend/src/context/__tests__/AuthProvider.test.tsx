import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import type { PortalBundle } from '../../types/portal';
import { fetchPortalBundle, loginRequest } from '../../lib/api';

vi.mock('../../lib/api', () => ({
  loginRequest: vi.fn(),
  fetchPortalBundle: vi.fn(),
  updatePortalBundle: vi.fn(),
}));

const mockedLoginRequest = vi.mocked(loginRequest);
const mockedFetchBundle = vi.mocked(fetchPortalBundle);

const portalBundle: PortalBundle = {
  navigation: { topLinks: [], sidebar: [], quickActions: [] },
  user: {
    id: 'u-1',
    name: 'Student Example',
    title: 'CE Student',
    email: 'student@hcmut.edu.vn',
    avatar: '/avatar.png',
    role: 'student',
  },
  announcements: {
    heroImage: '',
    title: 'Latest News',
    subtitle: 'Stay informed',
    items: [],
  },
  profile: {
    header: {
      about: 'Bio',
      role: 'Student',
    },
    contact: [],
    academics: [],
  },
};

const AuthConsumer = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="auth-user">{auth.user?.name ?? 'guest'}</div>
      <button type="button" onClick={() => auth.login('student@hcmut.edu.vn', '12345678')}>
        trigger-login
      </button>
      <button type="button" onClick={() => auth.logout()}>
        trigger-logout
      </button>
    </div>
  );
};

describe('AuthProvider (Login-Logout functionality)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockedLoginRequest.mockResolvedValue({
      token: 'token-123',
      role: 'student',
      user: portalBundle.user,
    });
    mockedFetchBundle.mockResolvedValue(portalBundle);
  });

  it('persists login details and clears them on logout', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth-user')).toHaveTextContent('guest');

    await user.click(screen.getByRole('button', { name: 'trigger-login' }));

    await waitFor(() => expect(screen.getByTestId('auth-user')).toHaveTextContent('Student Example'));
    expect(localStorage.getItem('cnpm-portal-auth')).toContain('student@hcmut.edu.vn');

    await user.click(screen.getByRole('button', { name: 'trigger-logout' }));

    expect(screen.getByTestId('auth-user')).toHaveTextContent('guest');
    expect(localStorage.getItem('cnpm-portal-auth')).toBeNull();
  });
});
