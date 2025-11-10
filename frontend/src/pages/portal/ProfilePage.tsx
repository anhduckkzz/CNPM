import { useMemo, useRef, useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

type ContactCard = {
  key: string;
  displayLabel: string;
  value: string | string[];
  editable?: boolean;
};

type AcademicCard = {
  key: string;
  displayLabel: string;
  value: string | string[];
  type?: 'tags';
  locked?: boolean;
};

const ProfilePage = () => {
  const { portal, user, updateAvatar } = useAuth();
  const profile = portal?.profile;
  const [isEditing, setEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ?? '');
  const [uploadError, setUploadError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user?.avatar]);

  const handleAvatarSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Image must be smaller than 2MB.');
      return;
    }
    setUploadError(undefined);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      updateAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const triggerAvatarPicker = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  if (!profile || !user) {
    return <div className="rounded-3xl bg-white p-8 shadow-soft">Profile data unavailable.</div>;
  }

  const platformLinksItem = profile.academics.find((item) => item.label.toLowerCase().includes('platform'));
  const emailContact = profile.contact.find((item) => item.label.toLowerCase().includes('email'));
  const personalEmailValue = (emailContact?.value as string) ?? user.email ?? '';

  const contactCards: ContactCard[] = [
    ...profile.contact.map((item) => ({
      key: item.label,
      displayLabel: item.label.toLowerCase().includes('email') ? 'PERSONAL EMAIL ADDRESS' : item.label.toUpperCase(),
      value: item.value,
      editable: item.editable,
    })),
  ];

  if (platformLinksItem) {
    contactCards.push({
      key: 'platform-links',
      displayLabel: 'PLATFORM LINKS',
      value: platformLinksItem.value as string[],
      editable: false,
    });
  }

  const academicCards = useMemo(() => {
    const withoutPlatform = profile.academics
      .filter((item) => item.label !== platformLinksItem?.label)
      .map<AcademicCard>((item) => ({
        key: item.label,
        displayLabel: item.label.toUpperCase(),
        value: item.value,
        type: item.type,
        locked: item.label.toLowerCase() === 'student id',
      }));

    const studentIdCard = withoutPlatform.find((card) => card.displayLabel === 'STUDENT ID');
    const rest = withoutPlatform.filter((card) => card.displayLabel !== 'STUDENT ID');

    const studentEmailCard: AcademicCard = {
      key: 'student-email-address',
      displayLabel: 'STUDENT EMAIL ADDRESS',
      value: user.email ?? personalEmailValue,
      locked: true,
    };

    return [...(studentIdCard ? [studentIdCard] : []), studentEmailCard, ...rest];
  }, [personalEmailValue, platformLinksItem?.label, profile.academics, user.email]);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={avatarPreview} alt={user.name} className="h-20 w-20 rounded-3xl object-cover" />
              <button
                type="button"
                onClick={triggerAvatarPicker}
                className="absolute inset-0 rounded-3xl bg-black/40 text-xs font-semibold uppercase tracking-wide text-white opacity-0 transition hover:opacity-80 disabled:pointer-events-none disabled:opacity-0"
                disabled={!isEditing}
              >
                Change
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelection}
              />
            </div>
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
        {uploadError && <p className="mt-3 text-sm text-red-500">{uploadError}</p>}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {contactCards.map((item) => {
          const isArray = Array.isArray(item.value);
          const isPlatformLinks = item.key === 'platform-links';
          return (
            <div key={item.key} className="rounded-[28px] bg-white p-6 shadow-soft">
              <p className="text-sm uppercase tracking-widest text-slate-400">{item.displayLabel}</p>
              {isArray && isPlatformLinks ? (
                <textarea
                  className="mt-3 h-14 w-full resize-none rounded-2xl border border-slate-100 px-4 py-3 text-lg font-semibold text-ink"
                  defaultValue={(item.value as string[]).join(', ')}
                  disabled={!isEditing}
                />
              ) : isArray ? (
                <div className="mt-3 rounded-2xl border border-slate-100 px-4 py-3">
                  {(item.value as string[]).map((link) => (
                    <a key={link} href={link} target="_blank" rel="noreferrer" className="block text-lg font-semibold text-primary hover:text-primary/80">
                      {link}
                    </a>
                  ))}
                </div>
              ) : (
                <input
                  className="mt-3 w-full rounded-2xl border border-slate-100 px-4 py-3 text-lg font-semibold text-ink"
                  defaultValue={item.value}
                  disabled={!item.editable && !isEditing}
                />
              )}
            </div>
          );
        })}
      </section>

      <section className="rounded-[32px] bg-white p-8 shadow-soft">
        <h2 className="text-xl font-semibold text-ink">Academic & Professional Details</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {academicCards.map((item) => (
            <div key={item.key} className="rounded-3xl bg-slate-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{item.displayLabel}</p>
              {item.type === 'tags' || Array.isArray(item.value) ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(item.value as string[]).map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-4 py-1 text-sm font-semibold text-primary">
                      {tag}
                    </span>
                  ))}
                  {isEditing && !item.locked && (
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
                  className={`mt-3 w-full rounded-2xl border px-4 py-3 text-lg font-semibold ${
                    item.locked ? 'border-slate-100 bg-slate-100 text-slate-500' : 'border-white bg-white text-ink'
                  }`}
                  defaultValue={item.value as string}
                  disabled={item.locked || !isEditing}
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
