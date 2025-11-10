import { useAuth } from '../../context/AuthContext';

const AnnouncementsPage = () => {
  const { portal } = useAuth();
  const data = portal?.announcements;

  if (!data) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">No announcement data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[32px] bg-slate-900 shadow-soft">
        <img src={data.heroImage} alt="Campus" className="h-80 w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
          <p className="text-sm uppercase tracking-widest text-white/70">HCMUT Portal</p>
          <h1 className="mt-2 text-3xl font-semibold">{data.title}</h1>
          <p className="mt-2 max-w-3xl text-lg text-white/80">{data.subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        {data.items.map((announcement) => (
          <article key={announcement.id} className="rounded-[28px] bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <div className="h-10 w-10 rounded-2xl bg-primary/10"></div>
              <div>
                <p className="font-semibold text-ink">{announcement.author}</p>
                <p>{announcement.timestamp}</p>
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-primary">{announcement.title}</h2>
            <p className="mt-3 text-base text-slate-600">{announcement.body}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
              <button type="button" className="text-primary">
                Permalink
              </button>
              {announcement.repliesLabel && (
                <button type="button" className="text-primary">
                  {announcement.repliesLabel}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
