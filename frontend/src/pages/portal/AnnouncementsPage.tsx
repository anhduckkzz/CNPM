import { useEffect, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AnnouncementsPage = () => {
  const { portal } = useAuth();
  const data = portal?.announcements;
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">No announcement data available.</div>;
  }

  const activeAnnouncement = data.items.find((item) => item.id === activeId);
  const closeModal = () => setActiveId(null);
  const handleKeyOpen = (event: ReactKeyboardEvent<HTMLElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveId(id);
    }
  };

  return (
    <div className="space-y-6 px-2">
      <div className="relative mx-auto max-w-[1600px] overflow-hidden rounded-[32px] bg-slate-900 shadow-soft">
        <img
          src={data.heroImage}
          alt="Campus"
          className="mx-auto h-80 w-full object-cover object-center opacity-80 md:h-[28rem]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
          <p className="text-sm uppercase tracking-widest text-white/70">HCMUT Portal</p>
          <h1 className="mt-2 text-3xl font-semibold">{data.title}</h1>
          <p className="mt-2 max-w-3xl text-lg text-white/80">{data.subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.items.map((announcement) => (
          <article
            key={announcement.id}
            role="button"
            tabIndex={0}
            onClick={() => setActiveId(announcement.id)}
            onKeyDown={(event) => handleKeyOpen(event, announcement.id)}
            className="rounded-[28px] bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <img
                src="/images/HCMUT-BachKhoa-Logo.png"
                alt="HCMUT logo"
                className="h-10 w-10 rounded-2xl border border-primary/20 bg-white p-1 object-contain"
              />
              <div>
                <p className="font-semibold text-ink">{announcement.author}</p>
                <p>{announcement.timestamp}</p>
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-primary">{announcement.title}</h2>
            <p className="mt-3 text-base text-slate-600">{announcement.body}</p>
          </article>
        ))}
      </div>

      {activeAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            >
              <X size={16} />
              <span className="sr-only">Close</span>
            </button>
            <p className="text-xs uppercase tracking-widest text-slate-400">Announcement detail</p>
            <h3 className="mt-2 text-3xl font-semibold text-ink">{activeAnnouncement.title}</h3>
            <p className="mt-2 text-sm text-slate-500">
              {activeAnnouncement.author} · {activeAnnouncement.role} · {activeAnnouncement.timestamp}
            </p>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-600">
              <p>
                {activeAnnouncement.body} To support this initiative we have compiled a short action checklist with
                deadlines, recommended tools, and support contacts. Please review the guidance and share any blockers with
                your department coordinator.
              </p>
              <p>
                Need the official reference?{' '}
                <a
                  href="https://www.hcmut.edu.vn/vi"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary underline decoration-primary/40 underline-offset-4"
                >
                  Read the full circular on the HCMUT site
                </a>{' '}
                or visit the{' '}
                <a
                  href="https://elearning.hcmut.edu.vn"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary underline decoration-primary/40 underline-offset-4"
                >
                  e-learning service desk
                </a>{' '}
                for step-by-step walkthroughs.
              </p>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Next actions</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Share this announcement with your cohort or faculty mailing list.</li>
                  <li>Bookmark key deadlines in the portal calendar to ensure reminders.</li>
                  <li>
                    Submit open questions through the{' '}
                    <a href="mailto:support@hcmut.edu.vn" className="text-primary underline">
                      support@hcmut.edu.vn
                    </a>{' '}
                    channel for a 24h response.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsPage;
