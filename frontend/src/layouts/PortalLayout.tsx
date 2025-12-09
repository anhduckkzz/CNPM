import { NavLink, Outlet, useParams } from 'react-router-dom';
import { LayoutGrid, User2, BookOpen, CalendarDays, MessageSquare, Repeat, BellRing, FileText, Menu, X, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { courseIdFromSlug } from '../utils/courseSlug';

const hcmutLogoUrl = '/images/HCMUT-BachKhoa-Logo.png';

const PortalLayout = () => {
  const { portal, user, logout, updatePortal } = useAuth();
  const { role } = useParams();
  const location = useLocation();
  const [isSidebarHovered, setSidebarHovered] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isSidebarOpen = isSidebarHovered;

  const handleResetToDefault = async () => {
    if (!updatePortal || !role) return;
    
    const defaultCourses = [
      {
        id: role === 'student' ? 'c-intro-programming' : 'c-intro-programming',
        title: 'Introduction to Programming',
        code: 'CO1002',
        thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80',
        status: 'in-progress',
        registeredDate: '2025-12-01',
        instructor: 'Dr. Nguyễn Văn A',
        format: 'Blended',
        schedule: 'Mon, Wed 8:00-10:00',
        ...(role === 'tutor' && { timeStudy: 'Mon & Wed 14:00-16:00', studentCount: 38, tutor: 'You', tags: ['CS'] })
      },
      {
        id: 'c-advanced-calculus',
        title: 'Advanced Calculus',
        code: 'M1T003',
        thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=900&q=80',
        status: 'completed',
        registeredDate: '2025-12-02',
        instructor: role === 'student' ? 'Prof. Trần Thị B' : 'Prof. Lê Hoàng B',
        format: 'In-person',
        schedule: role === 'student' ? 'Tue, Thu 14:00-16:00' : 'Tue, Thu 09:00-11:00',
        ...(role === 'tutor' && { timeStudy: 'Tue & Thu 09:00-11:00', studentCount: 52, tutor: 'You', tags: ['MATH'] })
      },
      {
        id: 'c-quantum-physics',
        title: 'Quantum Physics',
        code: 'PH4021',
        thumbnail: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
        status: 'in-progress',
        registeredDate: '2025-12-03',
        instructor: role === 'student' ? 'Dr. Lê Văn C' : 'Dr. Phạm Quốc C',
        format: 'In-person',
        schedule: 'Wed, Fri 10:00-12:00',
        ...(role === 'tutor' && { timeStudy: 'Wed & Fri 10:00-12:00', studentCount: 28, tutor: 'You', tags: ['PHYSICS'] })
      },
      {
        id: 'c-literary-analysis',
        title: 'Literary Analysis',
        code: 'EN1004',
        thumbnail: role === 'student' ? 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80' : 'https://images.unsplash.com/photo-1455885666463-1b2ac11fca08?auto=format&fit=crop&w=900&q=80',
        status: 'cancelled',
        registeredDate: role === 'student' ? '2025-12-04' : '2025-12-05',
        instructor: 'Dr. Phạm Thị D',
        format: role === 'student' ? 'Blended' : 'In-person',
        schedule: role === 'student' ? 'Mon 15:00-17:00' : 'Mon, Thu 13:00-15:00',
        ...(role === 'tutor' && { timeStudy: 'Mon & Thu 13:00-15:00', studentCount: 32, tutor: 'You', tags: ['LITERATURE'] })
      },
      {
        id: 'c-data-structures',
        title: 'Data Structures and Algorithms',
        code: 'CO2002',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
        status: 'in-progress',
        registeredDate: role === 'student' ? '2025-12-05' : '2025-12-06',
        instructor: role === 'student' ? 'Dr. Hoàng Văn E' : 'Prof. Đinh Văn E',
        format: role === 'student' ? 'Blended' : 'Online',
        schedule: role === 'student' ? 'Tue, Thu 8:00-10:00' : 'Tue, Fri 11:00-13:00',
        ...(role === 'tutor' && { timeStudy: 'Tue & Fri 11:00-13:00', studentCount: 45, tutor: 'You', tags: ['CS'] })
      },
      {
        id: 'c-cellular-biology',
        title: 'Cellular Biology',
        code: 'BI3002',
        thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
        status: 'waiting',
        registeredDate: role === 'student' ? '2025-12-06' : '2025-12-07',
        instructor: role === 'student' ? 'Prof. Vũ Thị F' : 'Dr. Ngô Xuân F',
        format: role === 'student' ? 'In-person' : 'Blended',
        schedule: role === 'student' ? 'Mon, Wed 13:00-15:00' : 'Wed, Sat 09:00-11:00',
        ...(role === 'tutor' && { timeStudy: 'Wed & Sat 09:00-11:00', studentCount: 35, tutor: 'You', tags: ['BIOLOGY'] })
      },
    ];

    if (role === 'tutor') {
      defaultCourses.push({
        id: 'c-web-development',
        title: 'Web Development Advanced Topics',
        code: 'CS3050',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80',
        status: 'completed',
        registeredDate: '2025-12-08',
        instructor: 'Prof. Bùi Minh G',
        format: 'In-person',
        schedule: 'Tue, Thu 10:00-12:00',
        timeStudy: 'Tue & Thu 10:00-12:00',
        studentCount: 44,
        tutor: 'You',
        tags: ['CS']
      });
    }

    await updatePortal((prev) => ({
      ...prev,
      courses: {
        title: 'Courses',
        description: 'Your registered classes for this semester.',
        courses: defaultCourses as any
      },
      courseMatching: {
        ...(prev.courseMatching || {}),
        recommended: role === 'student' ? [
          {
            id: 'c-digital-signal',
            title: 'Digital Signal Processing',
            code: 'CO3002',
            format: 'Blended',
            capacity: '47/70',
            thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
            actionLabel: 'Register Course',
            instructor: 'Dr. Võ Văn I',
            schedule: 'Tue, Thu 10:00-12:00'
          },
          {
            id: 'c-machine-learning',
            title: 'Machine Learning Fundamentals',
            code: 'CS4001',
            format: 'Online',
            capacity: '55/80',
            thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80',
            actionLabel: 'Register Course',
            instructor: 'Dr. Trần Văn J',
            schedule: 'Mon, Wed 14:00-16:00'
          }
        ] : (prev.courseMatching?.recommended || [])
      } as any
    }));

    window.location.reload();
  };

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
    if (normalized.includes('registration')) return <Sparkles size={16} />;
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
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:px-6 lg:py-8">
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
            'group hidden rounded-3xl bg-white shadow-soft transition-[width] duration-500 ease-out lg:block',
            isSidebarOpen ? 'w-72 p-5' : 'w-16 p-3',
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
              className={clsx(
                'shrink-0 rounded-2xl border border-primary/10 bg-white p-1 object-contain shadow-sm transition-all duration-300',
                isSidebarOpen ? 'h-11 w-11' : 'h-10 w-10'
              )}
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
                <p className="font-semibold">{portal?.user?.name ?? user?.name}</p>
              </div>
              <img src={portal?.user?.avatar ?? user?.avatar} alt={portal?.user?.name ?? user?.name} className="h-12 w-12 rounded-2xl object-cover" />
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
            <span 
              onClick={handleResetToDefault}
              style={{ cursor: 'pointer' }}
            >
              &copy; {new Date().getFullYear()} HCMUT Tutor Support System.
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
