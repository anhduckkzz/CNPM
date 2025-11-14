import clsx from 'clsx';
import type { PropsWithChildren } from 'react';

const palettes = [
  { from: '#6366F1', to: '#A855F7', accent: '#C4B5FD' },
  { from: '#0EA5E9', to: '#22D3EE', accent: '#BAE6FD' },
  { from: '#F97316', to: '#FACC15', accent: '#FCD34D' },
  { from: '#10B981', to: '#34D399', accent: '#A7F3D0' },
  { from: '#EC4899', to: '#F472B6', accent: '#FBCFE8' },
  { from: '#EF4444', to: '#F97316', accent: '#FECACA' },
];

const patterns = [
  'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 60%)',
  'radial-gradient(circle at 80% 0%, rgba(255,255,255,0.3), transparent 55%)',
  'linear-gradient(135deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

type CourseArtworkProps = PropsWithChildren<{
  identifier: string;
  title: string;
  code?: string;
  size?: 'default' | 'compact' | 'modal';
}>;

const sizeClassMap: Record<NonNullable<CourseArtworkProps['size']>, string> = {
  default: 'h-36',
  compact: 'h-28',
  modal: 'h-48',
};

const CourseArtwork = ({ identifier, title, code, size = 'default' }: CourseArtworkProps) => {
  const hash = hashString(identifier || title);
  const palette = palettes[hash % palettes.length];
  const pattern = patterns[hash % patterns.length];
  const angle = (hash % 360) + 'deg';

  return (
    <div className={clsx('relative w-full overflow-hidden rounded-2xl', sizeClassMap[size])}>
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
      />
      <div
        className="absolute -left-10 top-1/3 h-32 w-32 rounded-full opacity-40 blur-3xl"
        style={{ background: palette.accent }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: pattern, backgroundSize: '180px 180px', transform: `rotate(${angle})` }}
      />
      <div className="relative flex h-full flex-col justify-between p-4 text-white">
        <div className="text-xs uppercase tracking-[0.3em] text-white/70">Course</div>
        <div>
          <p className="text-lg font-semibold leading-tight">{title}</p>
          {code && <p className="text-sm text-white/80">{code}</p>}
        </div>
      </div>
    </div>
  );
};

export default CourseArtwork;
