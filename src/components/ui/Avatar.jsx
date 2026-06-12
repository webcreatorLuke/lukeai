// src/components/ui/Avatar.jsx
import React from 'react';
import { cn, getInitials } from '@utils/helpers';

const SIZES = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };

export default function Avatar({ user, size = 'md', className }) {
  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || 'Avatar'}
        className={cn('rounded-full object-cover', SIZES[size], className)}
      />
    );
  }
  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center',
      'font-display font-bold text-white',
      SIZES[size], className
    )}>
      {getInitials(user?.displayName || user?.email || '?')}
    </div>
  );
}
