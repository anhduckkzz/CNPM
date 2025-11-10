import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith('@hcmut.edu.vn')) {
      setError('You are not allowed to use this services.');
      setSubmitting(false);
      return;
    }

    if (!isAdminView && password !== '12345678') {
      setError('Wrong password');
      setSubmitting(false);
      return;
    }

    if (isAdminView && normalizedEmail !== 'staff@hcmut.edu.vn') {
      setError("You don't have permission to access this site.");
      setSubmitting(false);
      return;
    }

    const forcedRole = isAdminView ? 'staff' : 'student';

    try {
      const role = await login(normalizedEmail, password, forcedRole);
      navigate(`/portal/${role}/home`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#1E0E5E] text-white">
      <div className="mx-auto mt-10 w-full max-w-5xl rounded-[32px] bg-white p-10 text-ink shadow-soft">
        <div className="grid gap-10 lg:grid-cols-[420px_1fr]">
          <form onSubmit={submit} className="rounded-[24px] border border-slate-100 p-8 shadow-soft">
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
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-2xl bg-primary px-4 py-3 font-semibold text-white shadow-soft disabled:opacity-60"
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
          <div className="rounded-[24px] bg-slate-50 p-8">
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
      <footer className="mt-auto px-8 py-6 text-sm text-white/70">
        Ac {new Date().getFullYear()} Ho Chi Minh University of Technology. All rights reserved.
      </footer>
    </div>
  );
};

export default CasLogin;
