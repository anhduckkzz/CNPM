import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
  const { portal, user } = useAuth();
  const profile = portal?.profile;
  const [isEditing, setEditing] = useState(false);

  if (!profile || !user) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Profile data unavailable.</div>;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-3xl object-cover" />
            <div>
              <p className="text-sm uppercase tracking-widest text-slate-400">Your Profile</p>
              <h1 className="text-3xl font-semibold text-ink">{user.name}</h1>
              <p className="text-slate-500">{user.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing((prev) => !prev)}
            className="rounded-full border border-primary px-6 py-2 text-sm font-semibold text-primary"
          >
            {isEditing ? 'Confirm' : 'Edit'}
          </button>
        </div>
        <textarea
          className="mt-6 w-full rounded-3xl border border-slate-100 bg-slate-50 px-6 py-4 text-lg text-slate-600"
          disabled={!isEditing}
          defaultValue={profile.header.about}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {profile.contact.map((item) => (
          <div key={item.label} className="rounded-[28px] bg-white p-6 shadow-soft">
            <p className="text-sm uppercase tracking-widest text-slate-400">{item.label}</p>
            <input
              className="mt-3 w-full rounded-2xl border border-slate-100 px-4 py-3 text-lg font-semibold text-ink"
              defaultValue={item.value}
              disabled={!item.editable && !isEditing}
            />
          </div>
        ))}
      </section>

      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">Academic & Professional Details</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {profile.academics.map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-50 p-6">
              <p className="text-sm font-semibold text-slate-500">{item.label}</p>
              {item.type === 'tags' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(item.value as string[]).map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-4 py-1 text-sm font-semibold text-primary">
                      {tag}
                    </span>
                  ))}
                  {isEditing && (
                    <button
                      type="button"
                      className="rounded-full border border-dashed border-slate-300 px-4 py-1 text-sm text-slate-400"
                    >
                      Add
                    </button>
                  )}
                </div>
              ) : (
                <input
                  className="mt-3 w-full rounded-2xl border border-white bg-white px-4 py-3 text-lg font-semibold text-ink"
                  defaultValue={item.value as string}
                  disabled={!isEditing}
                />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
