import React, { useState } from 'react';
import { initials } from '../utils/helpers';

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  avatar,
  size = 'md',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-8 h-8 text-xs rounded-lg',
    sm: 'w-10 h-10 text-xs rounded-xl',
    md: 'w-14 h-14 text-base rounded-xl',
    lg: 'w-20 h-20 text-xl rounded-2xl',
    xl: 'w-28 h-28 text-3xl rounded-3xl',
    '2xl': 'w-36 h-36 text-4xl rounded-[2.5rem]',
    '3xl': 'w-48 h-48 text-5xl rounded-[3rem]'
  }[size];

  const isImage =
    avatar &&
    !imgError &&
    (avatar.startsWith('data:') ||
      avatar.startsWith('http://') ||
      avatar.startsWith('https://') ||
      avatar.startsWith('blob:') ||
      avatar.startsWith('/'));

  if (isImage) {
    return (
      <div
        className={`relative overflow-hidden flex-shrink-0 shadow-sm border-2 border-teal-200/90 bg-slate-100 ${sizeClasses} ${className}`}
      >
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (avatar && !imgError && avatar.length <= 4) {
    return (
      <div
        className={`relative flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-teal-200/80 bg-teal-50 select-none ${sizeClasses} ${className}`}
      >
        <span className="leading-none">{avatar}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center font-black text-white flex-shrink-0 shadow-sm border border-white/80 select-none bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 ${sizeClasses} ${className}`}
    >
      <span>{initials(name)}</span>
    </div>
  );
};
