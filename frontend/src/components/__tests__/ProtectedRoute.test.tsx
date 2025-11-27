import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { type Role } from '../../types/portal';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);

const baseUser = {
  id: 'u-1',
  name: 'Test User',
  title: 'Student',
  email: 'student@hcmut.edu.vn',
  avatar: '/avatar.jpg',
  role: 'student' as Role,
};

const authState = (overrides: Partial<ReturnType<typeof useAuth>>) => ({
  user: undefined,
  role: undefined,
  token: undefined,
  portal: undefined,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshPortal: vi.fn(),
  updateAvatar: vi.fn(),
  updatePortal: vi.fn(),
  ...overrides,
});

const renderProtectedRoute = (initialEntry = '/protected', allow?: Role[]) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<ProtectedRoute allow={allow} />}>
          <Route path="/protected" element={<div>Secret area</div>} />
          <Route path="/portal/staff/admin" element={<div>Staff admin</div>} />
        </Route>
        <Route path="/" element={<div>Public landing</div>} />
        <Route path="/portal/staff/home" element={<div>Staff default home</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading indicator when auth state is loading', () => {
    mockedUseAuth.mockReturnValue(authState({ loading: true }) as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByText(/Website loading/i)).toBeInTheDocument();
  });

  it('redirects visitors to the landing page when not authenticated', () => {
    mockedUseAuth.mockReturnValue(authState({ user: undefined, role: undefined }) as ReturnType<typeof useAuth>);

    renderProtectedRoute();

    expect(screen.getByText('Public landing')).toBeInTheDocument();
  });

  it('renders the nested route when the role is permitted', () => {
    mockedUseAuth.mockReturnValue(
      authState({
        user: baseUser,
        role: 'staff',
      }) as ReturnType<typeof useAuth>,
    );

    renderProtectedRoute('/protected', ['staff']);

    expect(screen.getByText('Secret area')).toBeInTheDocument();
  });

  it('redirects unauthorized roles to their default home', () => {
    mockedUseAuth.mockReturnValue(
      authState({
        user: { ...baseUser, role: 'staff' },
        role: 'staff',
      }) as ReturnType<typeof useAuth>,
    );

    renderProtectedRoute('/portal/staff/admin', ['student']);

    expect(screen.getByText('Staff default home')).toBeInTheDocument();
  });
});
