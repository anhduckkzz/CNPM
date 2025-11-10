import { useNavigate } from 'react-router-dom';

const SSOLanding = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
            BK
          </div>
          <div>
            <p className="text-sm text-slate-500">Ho Chi Minh City University of Technology</p>
            <p className="text-xl font-semibold text-ink">HCMUT e-learning</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/cas-login')}
          className="rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-primary-dark"
        >
          Login
        </button>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-12">
        <div className="w-full max-w-3xl rounded-[32px] bg-white p-12 text-center shadow-soft">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-3xl font-bold text-primary">
            BK
          </div>
          <p className="text-3xl font-semibold text-primary">HCMUT e-learning</p>
          <p className="mt-2 text-lg text-slate-500">Log in with your account on:</p>
          <button
            type="button"
            onClick={() => navigate('/cas-login')}
            className="mt-8 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-white shadow-soft transition hover:bg-primary-dark"
          >
            Log in with HCMUT SSO (HCMUT account)
          </button>
          <div className="mt-6 rounded-2xl border border-slate-200 px-4 py-3 text-slate-500">
            Administrator
          </div>
          <div className="mt-4 text-sm text-slate-500">English ▾</div>
        </div>
      </main>
      <footer className="px-8 pb-6 text-sm text-slate-400">
        © {new Date().getFullYear()} BKEL · Developed based on Moodle · Made for demo purposes.
      </footer>
    </div>
  );
};

export default SSOLanding;
