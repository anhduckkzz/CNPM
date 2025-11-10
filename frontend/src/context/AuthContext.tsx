import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PortalBundle, Role, UserProfile } from '../types/portal';
import { fetchPortalBundle, loginRequest } from '../lib/api';

interface AuthState {
  user?: UserProfile;
  role?: Role;
  token?: string;
  portal?: PortalBundle;
  loading: boolean;
  login: (email: string, password?: string) => Promise<Role>;
  logout: () => void;
  refreshPortal: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'cnpm-portal-auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile>();
  const [role, setRole] = useState<Role>();
  const [token, setToken] = useState<string>();
  const [portal, setPortal] = useState<PortalBundle>();
  const [loading, setLoading] = useState(true);

  const persistState = useCallback(
    (next: { token?: string; role?: Role; user?: UserProfile }) => {
      if (!next.token || !next.user || !next.role) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: next.token, role: next.role, user: next.user }),
      );
    },
    [],
  );

  const bootstrap = useCallback(async () => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return;
      const parsed = JSON.parse(cached) as { token: string; role: Role; user: UserProfile };
      setToken(parsed.token);
      setRole(parsed.role);
      setUser(parsed.user);
      const bundle = await fetchPortalBundle(parsed.role);
      setPortal(bundle);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password?: string) => {
    setLoading(true);
    try {
      const response = await loginRequest({ email, password });
      setToken(response.token);
      setRole(response.role);
      setUser(response.user);
      persistState({ token: response.token, role: response.role, user: response.user });
      const bundle = await fetchPortalBundle(response.role);
      setPortal(bundle);
      return response.role;
    } finally {
      setLoading(false);
    }
  }, [persistState]);

  const logout = useCallback(() => {
    setUser(undefined);
    setRole(undefined);
    setToken(undefined);
    setPortal(undefined);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshPortal = useCallback(async () => {
    if (!role) return;
    const bundle = await fetchPortalBundle(role);
    setPortal(bundle);
  }, [role]);

  const updateAvatar = useCallback(
    (avatarUrl: string) => {
      setUser((prev) => {
        if (!prev) return prev;
        const nextUser = { ...prev, avatar: avatarUrl };
        if (token && role) {
          persistState({ token, role, user: nextUser });
        }
        return nextUser;
      });
      setPortal((prev) => (prev ? { ...prev, user: { ...prev.user, avatar: avatarUrl } } : prev));
    },
    [persistState, role, token],
  );

  const value = useMemo<AuthState>(
    () => ({
      user,
      role,
      token,
      portal,
      loading,
      login,
      logout,
      refreshPortal,
      updateAvatar,
    }),
    [user, role, token, portal, loading, login, logout, refreshPortal, updateAvatar],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
