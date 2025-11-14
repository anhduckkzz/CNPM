import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast({ visible: true, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2200);
  };

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  const handleSubmit = () => {
    showToast('Password updated successfully');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetEmail = () => {
    showToast('Reset link sent to your email');
  };

  return (
    <>
      <div className="flex min-h-screen flex-col bg-[#1E0E5E] text-white">
        <div className="mx-auto mt-8 w-full max-w-4xl rounded-[32px] bg-white px-4 py-8 text-ink shadow-soft sm:px-8 lg:p-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-semibold text-primary transition hover:opacity-80"
          >
            ← Back
          </button>
          <h1 className="mt-4 text-3xl font-semibold text-primary">Change Password</h1>
          <p className="mt-1 text-slate-500">Update your credentials or request a reset link via email.</p>
          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <label className="block text-sm font-medium text-slate-500">
              Username
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="email"
                placeholder="name@hcmut.edu.vn"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-500">
              Old Password
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                type="password"
                placeholder="Enter your current password"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-500">
              New Password
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                type="password"
                placeholder="Create a new password"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-500">
              Confirm New Password
              <input
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base focus:border-primary focus:outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Re-enter the new password"
                required
              />
            </label>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="submit"
                className="flex-1 min-w-[200px] rounded-2xl bg-primary px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-primary/90"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleResetEmail}
                className="flex-1 min-w-[220px] rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
              >
                Reset password by email
              </button>
            </div>
          </form>
        </div>
      </div>

      <div
        aria-live="assertive"
        className={`pointer-events-none fixed left-6 top-6 z-[60] w-full max-w-xs transform rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm shadow-lg transition-all duration-300 ${
          toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
        }`}
      >
        <div className="pointer-events-auto flex items-start gap-3 text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Success</p>
            <p className="text-xs text-emerald-800/80">{toast.message || 'Action completed successfully.'}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
