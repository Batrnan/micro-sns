interface UserAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-10 h-10 text-base',
  md: 'w-12 h-12 text-lg',
  lg: 'w-20 h-20 text-4xl',
  xl: 'w-28 h-28 text-5xl',
};

export function UserAvatar({ name, size = 'sm', className = '' }: UserAvatarProps) {
  const sizeClass = sizeClasses[size];
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0 ${sizeClass} ${className}`}
    >
      {initial}
    </div>
  );
}
