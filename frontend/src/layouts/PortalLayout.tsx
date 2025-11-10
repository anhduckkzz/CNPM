import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { Menu, LayoutGrid, User2, BookOpen, CalendarDays, MessageSquare, Repeat, BellRing, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const PortalLayout = () => {
  const { portal, user, logout } = useAuth();
  const { role } = useParams();
  const location = useLocation();
  const [isPinnedOpen, setPinnedOpen] = useState(true);
  const [isHovering, setHovering] = useState(false);

  const isSidebarOpen = isPinnedOpen || isHovering;

  const sidebarLinks = useMemo(() => portal?.navigation.sidebar ?? [], [portal]);

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
          onMouseEnter={() => !isPinnedOpen && setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          className={clsx(
            'group hidden rounded-3xl bg-white p-5 shadow-soft transition-[width] duration-300 lg:block',
            isSidebarOpen ? 'w-64' : 'w-24',
          )}
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Toggle navigation"
              className={clsx(
                'flex items-center gap-3 rounded-2xl border border-slate-100 text-left transition-all duration-300',
                isSidebarOpen ? 'w-full px-3 py-2' : 'w-11 justify-center border-transparent px-0 py-0',
              )}
              onClick={() => setPinnedOpen((prev) => !prev)}
            >
              <div
                className={clsx(
                  'flex items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white transition-all duration-300',
                  isSidebarOpen ? 'h-11 w-11' : 'h-11 w-11',
                )}
              >
                BK
              </div>
              <div
                className={clsx(
                  'transition-all duration-300',
                  isSidebarOpen ? 'opacity-100 translate-x-0' : 'hidden',
                )}
              >
                <p className="text-xs uppercase tracking-wide text-slate-400">HCMUT e-learning</p>
                <p className="text-sm font-semibold capitalize text-ink">{role} view</p>
              </div>
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              onClick={() => setPinnedOpen((prev) => !prev)}
            >
              <Menu size={18} />
            </button>
          </div>

          <div className="mt-8 space-y-6">
            {sidebarLinks.map((section) => (
              <div key={section.title}>
                <p
                  className={clsx(
                    'mb-3 text-xs uppercase tracking-wide text-slate-400 transition-opacity duration-300',
                    isSidebarOpen ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  {section.title}
                </p>
                <div className="space-y-2">
                  {section.links.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      title={!isSidebarOpen ? link.label : undefined}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2 text-sm font-medium transition hover:bg-slate-50',
                          isActive ? 'bg-primary text-white shadow-soft' : 'text-slate-500',
                        )
                      }
                    >
                      <span
                        className={clsx(
                          'flex h-9 w-9 items-center justify-center rounded-2xl border text-primary',
                          isSidebarOpen ? 'border-primary/10 bg-primary/5' : 'border-transparent bg-transparent',
                        )}
                      >
                        {linkIcon(link.label)}
                      </span>
                      <span
                        className={clsx(
                          'flex-1 truncate transition-all duration-300',
                          isSidebarOpen ? 'opacity-100 translate-x-0' : 'pointer-events-none -translate-x-4 opacity-0',
                        )}
                      >
                        {link.label}
                      </span>
                      {link.badge && (
                        <span
                          className={clsx(
                            'rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-white transition-opacity duration-300',
                            isSidebarOpen ? 'opacity-100' : 'opacity-0',
                          )}
                        >
                          {link.badge}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 space-y-2 text-xs text-slate-400">
            {['Settings', 'Quick Links', 'Legal'].map((item) => (
              <button
                key={item}
                type="button"
                className={clsx(
                  'block w-full rounded-xl px-3 py-2 text-left transition hover:text-primary',
                  !isSidebarOpen && 'text-center text-[10px]',
                )}
                title={!isSidebarOpen ? item : undefined}
              >
                {isSidebarOpen ? item : item.charAt(0)}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
            <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
              {portal.navigation.topLinks.map((link) => (
                <span
                  key={link}
                  className={[
                    'rounded-full px-4 py-1.5 capitalize',
                    location.pathname.includes(link.toLowerCase()) ? 'bg-primary text-white' : 'bg-slate-50',
                  ].join(' ')}
                >
                  {link}
                </span>
              ))}
            </nav>
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
            <Outlet />
          </section>

          <footer className="rounded-3xl bg-white px-6 py-4 text-sm text-slate-400 shadow-soft">
            &copy; {new Date().getFullYear()} HCMUT e-learning Experience. Crafted for smooth interactions.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
