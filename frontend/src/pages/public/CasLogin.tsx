import type { FormEvent } from 'react';
import { useMemo, useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types/portal';
import { Coffee } from 'lucide-react';

const CasLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultRole = useMemo(() => new URLSearchParams(location.search).get('role'), [location.search]);
  const isAdminView = defaultRole === 'staff';
  const [email, setEmail] = useState(isAdminView ? 'staff@hcmut.edu.vn' : 'student@hcmut.edu.vn');
  const [password, setPassword] = useState(isAdminView ? 'password' : '12345678');
  const [error, setError] = useState<string>();
  const [isSubmitting, setSubmitting] = useState(false);
  const [showWakeNotice, setShowWakeNotice] = useState(false);
  const wakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (wakeTimer.current) clearTimeout(wakeTimer.current);
    },
    [],
  );

  const scheduleWakeNotice = () => {
    if (wakeTimer.current) clearTimeout(wakeTimer.current);
    wakeTimer.current = setTimeout(() => {
      setShowWakeNotice(true);
    }, 1000);
  };

  const clearWakeNotice = () => {
    if (wakeTimer.current) clearTimeout(wakeTimer.current);
    setShowWakeNotice(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);
    scheduleWakeNotice();

    const normalizedEmail = email.trim().toLowerCase();

    let inferredRole: Role = 'student';
    if (normalizedEmail === 'staff@hcmut.edu.vn') {
      inferredRole = 'staff';
    } else if (normalizedEmail === 'tutor@hcmut.edu.vn') {
      inferredRole = 'tutor';
    }

    if (!normalizedEmail.endsWith('@hcmut.edu.vn')) {
      setError('You are not allowed to use this services.');
      clearWakeNotice();
      setSubmitting(false);
      return;
    }

    if (inferredRole === 'student' && password !== '12345678') {
      setError('Wrong password');
      clearWakeNotice();
      setSubmitting(false);
      return;
    }

    if (inferredRole === 'staff' && normalizedEmail !== 'staff@hcmut.edu.vn') {
      setError("You don't have permission to access this site.");
      clearWakeNotice();
      setSubmitting(false);
      return;
    }

    try {
      const role = await login(normalizedEmail, password, inferredRole);
      navigate(`/portal/${role}/home`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.');
    } finally {
      clearWakeNotice();
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#1E0E5E] text-white">
      <div className="mx-auto mt-8 w-full max-w-5xl rounded-[32px] bg-white px-4 py-8 text-ink shadow-soft sm:px-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr] lg:gap-10">
          <form onSubmit={submit} className="rounded-[24px] border border-slate-100 p-6 shadow-soft sm:p-8">
            <h1 className="text-2xl font-semibold text-primary">Enter your Username and Password</h1>
            <label className="mt-6 block text-sm font-medium text-slate-500">
              Username
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="Enter your username"
              />
            </label>
            <label className="mt-4 block text-sm font-medium text-slate-500">
              Password
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter your password"
              />
            </label>
            <label className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" defaultChecked />
              Warn me before logging me into other sites.
            </label>
            {error && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 min-w-[160px] rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-soft disabled:opacity-60"
              >
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('');
                  setPassword('');
                }}
                className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
            <button type="button" className="mt-4 text-sm font-semibold text-primary" onClick={() => navigate('/change-password')}>
              Change password?
            </button>
          </form>
          <div className="rounded-[24px] bg-slate-50 p-6 sm:p-8">
            <div className="flex justify-end gap-3 text-sm font-semibold">
              <span className="text-primary">Vietnamese</span>
              <span>English</span>
            </div>
            <section className="mt-6 space-y-4 text-sm text-slate-600">
              <h2 className="text-base font-semibold text-primary">Please note</h2>
              <p>
                The Login page enables single sign-on to multiple websites at HCMUT. Use your HCMUT username and password
                to access the HCMUT Information System, email, and all subscribed services.
              </p>
              <p>For security reasons, please exit your browser when done accessing services that require authentication.</p>
            </section>
            <section className="mt-8 rounded-2xl border border-primary/20 bg-white p-4 text-sm">
              <p className="font-semibold text-primary">Technical support</p>
              <p>Email: support@hcmut.edu.vn</p>
              <p>Tel: (84-8) 38647256 - 7204</p>
            </section>
          </div>
        </div>
      </div>
      <footer className="mt-auto px-4 py-6 text-sm text-white/70 sm:px-6 lg:px-8">
        Ac {new Date().getFullYear()} Ho Chi Minh University of Technology. All rights reserved.
      </footer>
      {showWakeNotice && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header with friendly gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-center gap-2">
                <div className="relative">
                  <Coffee className="h-8 w-8 text-white" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">Almost there!</h2>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-6 py-5">
              <div className="flex flex-col items-center gap-4">
                {/* Animated loader */}
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Waking up the server ☕
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our server is starting up after a rest. This usually takes just a few seconds.
                  </p>
                </div>
                
                {/* Reassurance message */}
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 w-full">
                  <svg className="h-5 w-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-blue-700">
                    Don't worry! Please stay on this page — you'll be signed in automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CasLogin;
