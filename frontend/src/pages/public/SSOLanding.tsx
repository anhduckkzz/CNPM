import { useNavigate } from 'react-router-dom';

const hcmutLogoUrl = '/images/HCMUT-BachKhoa-Logo.png';

const SSOLanding = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1 shadow-soft sm:h-14 sm:w-14">
            <img src={hcmutLogoUrl} alt="HCMUT logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Ho Chi Minh City University of Technology</p>
            <p className="text-xl font-semibold text-ink sm:text-2xl">HCMUT e-learning</p>
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
        <div className="w-full max-w-3xl rounded-[32px] bg-white p-6 text-center shadow-soft sm:p-10 lg:p-12">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 p-3 sm:h-24 sm:w-24">
            <img src={hcmutLogoUrl} alt="HCMUT logo" className="h-full w-full object-contain" />
          </div>
          <p className="text-2xl font-semibold text-primary sm:text-3xl">HCMUT e-learning</p>
          <p className="mt-2 text-base text-slate-500 sm:text-lg">Log in with your account on:</p>
          <button
            type="button"
            onClick={() => navigate('/cas-login')}
            className="mt-8 w-full rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-white shadow-soft transition hover:bg-primary-dark"
          >
            Log in with HCMUT SSO (HCMUT account)
          </button>
          <button
            type="button"
            onClick={() => navigate('/cas-login?role=staff')}
            className="mt-6 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-600 transition hover:border-primary/40 hover:text-primary"
          >
            Administrator
          </button>
          <div className="mt-4 text-sm text-slate-500">English ▼</div>
        </div>
      </main>
      <footer className="px-4 pb-6 text-sm text-slate-400 sm:px-6 lg:px-8">
        <span aria-hidden="true">©</span> {new Date().getFullYear()} BKEL · Developed based on Moodle.
      </footer>
    </div>
  );
};

export default SSOLanding;



