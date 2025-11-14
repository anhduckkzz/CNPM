import { NavLink, Outlet, useParams } from 'react-router-dom';
import { LayoutGrid, User2, BookOpen, CalendarDays, MessageSquare, Repeat, BellRing, FileText, Menu, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { courseIdFromSlug } from '../utils/courseSlug';

const hcmutLogoUrl = '/images/HCMUT-BachKhoa-Logo.png';

const PortalLayout = () => {
  const { portal, user, logout } = useAuth();
  const { role } = useParams();
  const location = useLocation();
  const [isSidebarHovered, setSidebarHovered] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isSidebarOpen = isSidebarHovered;

  const sidebarLinks = useMemo(() => portal?.navigation.sidebar ?? [], [portal]);
  const derivedTitle =
    location.pathname.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g, ' ') || 'dashboard';
  const courseSlug = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const courseDetailIndex = segments.indexOf('course-detail');
    if (courseDetailIndex !== -1 && segments[courseDetailIndex + 1]) {
      return segments[courseDetailIndex + 1];
    }
    const quizIndex = segments.indexOf('quiz');
    if (quizIndex !== -1 && segments[quizIndex + 1]) {
      return segments[quizIndex + 1];
    }
    return undefined;
  }, [location.pathname]);
  const courseHeaderTitle = useMemo(() => {
    if (!courseSlug) return undefined;
    const courseKey = courseIdFromSlug(courseSlug);
    if (!courseKey) return undefined;
    return (
      portal?.courseDetails?.[courseKey]?.title ??
      portal?.courses?.courses?.find((course) => course.id === courseKey)?.title
    );
  }, [courseSlug, portal]);
  const headerTitle = courseHeaderTitle ?? derivedTitle;

  if (!portal || !role) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 px-6 text-center text-lg font-semibold text-primary">
        <p>
          Warming up your portal workspace… If this takes too long, try reloading the main dashboard at{' '}
          <a href="https://cnpm-frontend.vercel.app/" className="underline">
            https://cnpm-frontend.vercel.app/
          </a>{' '}
          to sign in again.
        </p>
      </div>
    );
  }

  const linkIcon = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes('dashboard') || normalized.includes('home')) return <LayoutGrid size={16} />;
    if (normalized.includes('profile')) return <User2 size={16} />;
    if (normalized.includes('course')) return <BookOpen size={16} />;
    if (normalized.includes('schedule')) return <CalendarDays size={16} />;
    if (normalized.includes('feedback')) return <MessageSquare size={16} />;
    if (normalized.includes('reschedule')) return <Repeat size={16} />;
    if (normalized.includes('notify')) return <BellRing size={16} />;
    return <FileText size={16} />;
  };

  useEffect(() => {
    if (isMobileSidebarOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [isMobileSidebarOpen]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen]);

  const renderNavLinks = (expanded: boolean, onNavigate?: () => void) => (
    <div className="mt-8 space-y-2">
      {sidebarLinks.map((section) => (
        <div key={section.title}>
          <div className="space-y-2">
            {section.links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => onNavigate?.()}
                title={!expanded ? link.label : undefined}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center overflow-hidden rounded-2xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    expanded ? 'gap-3 justify-start' : 'gap-0 justify-center',
                    isActive
                      ? expanded
                        ? 'bg-primary text-white shadow-soft hover:bg-primary'
                        : 'text-primary'
                      : 'text-slate-500 hover:bg-slate-50',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={clsx(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-300',
                        isActive
                          ? 'border-white bg-white text-primary shadow-soft'
                          : expanded
                            ? 'border-primary/10 bg-primary/5 text-primary'
                            : 'border-transparent bg-transparent text-primary',
                      )}
                    >
                      {linkIcon(link.label)}
                    </span>
                    <span
                      className={clsx(
                        'whitespace-nowrap transition-all duration-300',
                        expanded ? 'flex-1 translate-x-0 opacity-100 text-inherit' : 'pointer-events-none -translate-x-4 opacity-0 w-0',
                      )}
                    >
                      {link.label}
                    </span>
                    {expanded && link.badge && (
                      <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-white">{link.badge}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-6 lg:py-8">
        {isMobileSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
            aria-label="Close navigation"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <div
          className={clsx(
            'fixed inset-y-0 left-0 z-50 w-72 translate-x-0 bg-white p-5 shadow-2xl transition-transform duration-300 lg:hidden',
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          )}
          role="dialog"
          aria-label="Portal navigation"
          aria-hidden={!isMobileSidebarOpen}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <img src={hcmutLogoUrl} alt="HCMUT logo" className="h-10 w-10 rounded-2xl border border-primary/10 bg-white p-1 shadow-sm" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Navigation</p>
                <p className="text-sm font-semibold capitalize text-ink">{role} view</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:border-primary/30 hover:text-primary"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="h-[calc(100vh-120px)] overflow-y-auto pb-6">{renderNavLinks(true, () => setMobileSidebarOpen(false))}</div>
        </div>

        <aside
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          className={clsx(
            'group hidden rounded-3xl bg-white p-5 shadow-soft transition-[width] duration-500 ease-out lg:block',
            isSidebarOpen ? 'w-72' : 'w-20',
          )}
        >
          <div
            className={clsx(
              'flex items-center gap-3 rounded-2xl transition-all duration-500 ease-out',
              isSidebarOpen ? 'border border-slate-100 px-3 py-2' : 'px-0 py-0',
            )}
          >
            <img
              src={hcmutLogoUrl}
              alt="HCMUT logo"
              className="h-11 w-11 shrink-0 rounded-2xl border border-primary/10 bg-white p-1 object-contain shadow-sm"
            />
            <div className={clsx('transition-all duration-300 ease-out', isSidebarOpen ? 'translate-x-0 opacity-100' : 'hidden')}>
              <p className="text-xs uppercase tracking-wide text-slate-400">HCMUT e-learning</p>
              <p className="text-sm font-semibold capitalize text-ink">{role} view</p>
            </div>
          </div>

          {renderNavLinks(isSidebarOpen)}
        </aside>

        <main className="flex-1 space-y-6">
          <header className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-soft sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:border-primary/30 hover:text-primary lg:hidden"
                aria-label="Toggle navigation"
                onClick={() => setMobileSidebarOpen((prev) => !prev)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-semibold capitalize text-ink sm:text-3xl">{headerTitle}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400">Logged in as</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
              <img src={user?.avatar} alt={user?.name} className="h-12 w-12 rounded-2xl object-cover" />
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-primary-dark"
              >
                Logout
              </button>
            </div>
          </header>

          <section>
            <Outlet context={{ isSidebarOpen }} />
          </section>

          <footer className="rounded-3xl bg-white px-6 py-4 text-sm text-slate-400 shadow-soft">
            &copy; {new Date().getFullYear()} HCMUT Tutor Support System.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
