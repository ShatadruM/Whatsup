import { UserStatus } from '../../types';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  status?: UserStatus;
  showStatus?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

const statusDotSize = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
};

const statusColors: Record<UserStatus, string> = {
  online: 'bg-emerald-400',
  away: 'bg-amber-400',
  busy: 'bg-rose-400',
  offline: 'bg-slate-400',
};

const avatarColors = [
  'bg-blue-500',
  'bg-teal-500',
  'bg-emerald-500',
  'bg-orange-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-amber-500',
  'bg-sky-500',
];

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ name, src, size = 'md', status, showStatus = false }: AvatarProps) {
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-semibold text-white ${!src ? getAvatarColor(name) : ''}`}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {showStatus && status && (
        <span className={`absolute bottom-0 right-0 rounded-full border-slate-900 ${statusDotSize[size]} ${statusColors[status]}`} />
      )}
    </div>
  );
}
