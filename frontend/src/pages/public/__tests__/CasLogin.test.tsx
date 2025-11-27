import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useParams } from 'react-router-dom';
import CasLogin from '../CasLogin';
import { useAuth } from '../../../context/AuthContext';
import type { Role } from '../../../types/portal';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

type LoginFn = (email: string, password?: string, role?: Role) => Promise<Role> | Role;

const buildAuthState = (loginImpl: LoginFn = () => Promise.resolve('student' as Role)) =>
  ({
    user: undefined,
    role: undefined,
    token: undefined,
    portal: undefined,
    loading: false,
    login: vi.fn(loginImpl),
    logout: vi.fn(),
    refreshPortal: vi.fn(),
    updateAvatar: vi.fn(),
    updatePortal: vi.fn(),
  }) as ReturnType<typeof useAuth>;

const LocationDisplay = () => {
  const location = useLocation();
  const params = useParams();
  return (
    <div>
      <div>Portal landing</div>
      <div data-testid="location-path">{location.pathname}</div>
      <div data-testid="role-param">{params.role}</div>
    </div>
  );
};

const renderCasLogin = (initialEntry = '/cas-login') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/cas-login" element={<CasLogin />} />
        <Route path="/change-password" element={<div>Change password screen</div>} />
        <Route path="/portal/:role/home" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>,
  );

describe('CasLogin page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prefills staff credentials when visiting the administrator link', () => {
    mockedUseAuth.mockReturnValue(buildAuthState());
    renderCasLogin('/cas-login?role=staff');

    expect(screen.getByLabelText(/Username/i)).toHaveValue('staff@hcmut.edu.vn');
    expect(screen.getByLabelText(/Password/i)).toHaveValue('password');
  });

  it('rejects non-HCMUT email domains before calling login', async () => {
    const loginMock = vi.fn();
    mockedUseAuth.mockReturnValue(buildAuthState(loginMock));
    renderCasLogin();

    const user = userEvent.setup();
    const usernameInput = screen.getByLabelText(/Username/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, 'user@gmail.com');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    expect(await screen.findByText('You are not allowed to use this services.')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('normalizes the email, logs in, and redirects to the role portal', async () => {
    const loginMock = vi.fn().mockResolvedValue('student');
    mockedUseAuth.mockReturnValue(buildAuthState(loginMock));
    renderCasLogin();

    const user = userEvent.setup();
    const usernameInput = screen.getByLabelText(/Username/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, ' Student@HCMUT.edu.vn ');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith('student@hcmut.edu.vn', '12345678', 'student'),
    );
    expect(await screen.findByText('Portal landing')).toBeInTheDocument();
    expect(screen.getByTestId('location-path')).toHaveTextContent('/portal/student/home');
  });

  it('navigates to the change password page when the shortcut is clicked', async () => {
    mockedUseAuth.mockReturnValue(buildAuthState());
    renderCasLogin();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Change password/i }));

    expect(screen.getByText('Change password screen')).toBeInTheDocument();
  });

  it('shows the wake notice while waiting for the backend and hides it after success', async () => {
    let resolveLogin: ((role: Role) => void) | undefined;
    const loginMock = vi.fn(
      () =>
        new Promise<Role>((resolve) => {
          resolveLogin = resolve;
        }),
    );
    mockedUseAuth.mockReturnValue(buildAuthState(loginMock));
    renderCasLogin();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Login/i }));

    expect(loginMock).toHaveBeenCalled();
    expect(
      await screen.findByText(/Waking up the server/i, undefined, { timeout: 2000 }),
    ).toBeInTheDocument();

    await act(async () => {
      resolveLogin?.('student');
    });
    expect(
      await screen.findByText('Portal landing', undefined, { timeout: 2000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Waking up the server/i)).not.toBeInTheDocument();
  });
});
