import { NavLink, Outlet, useParams } from 'react-router-dom';
import { LayoutGrid, User2, BookOpen, CalendarDays, MessageSquare, Repeat, BellRing, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
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
      <div className="flex h-screen items-center justify-center bg-slate-50 text-lg font-semibold text-primary">
        Preparing your personalised workspace...
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

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <div className="mx-auto flex max-w-[1440px] gap-6 px-6 py-8 lg:flex-row">
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
            <div className={clsx('transition-all duration-300 ease-out', isSidebarOpen ? 'opacity-100 translate-x-0' : 'hidden')}>
              <p className="text-xs uppercase tracking-wide text-slate-400">HCMUT e-learning</p>
              <p className="text-sm font-semibold capitalize text-ink">{role} view</p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            {sidebarLinks.map((section) => (
              <div key={section.title}>
                <div className="space-y-2">
                  {section.links.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      title={!isSidebarOpen ? link.label : undefined}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center overflow-hidden rounded-2xl px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                          isSidebarOpen ? 'gap-3' : 'gap-0',
                          isSidebarOpen ? 'justify-start' : 'justify-center',
                          isActive
                            ? isSidebarOpen
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
                                : isSidebarOpen
                                  ? 'border-primary/10 bg-primary/5 text-primary'
                                  : 'border-transparent bg-transparent text-primary',
                            )}
                          >
                            {linkIcon(link.label)}
                          </span>
                          <span
                            className={clsx(
                              'whitespace-nowrap transition-all duration-300',
                              isSidebarOpen ? 'flex-1 translate-x-0 opacity-100 text-inherit' : 'pointer-events-none -translate-x-4 opacity-0 w-0',
                            )}
                          >
                            {link.label}
                          </span>
                          {isSidebarOpen && link.badge && (
                            <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-white">
                              {link.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl font-semibold capitalize text-ink">{headerTitle}</h1>
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
