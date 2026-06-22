// Uses: Technical skills badges on user profile page, open roles on posts, etc.

import React from 'react';

// available visual styles for your badges
export type BadgeVariant = 'primary' | 'light' | 'outline' | 'gray';

// can pass custom classes or IDs
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({
  children,
  variant = 'light', // Default
  className = '',
  ...props
}: BadgeProps) {
  // Base styles: small text, inline-flex to keep text centered, and custom pill radius
  const baseStyle =
    'inline-flex items-center justify-center px-3 py-1 text-sm font-medium rounded-pill';

  const variants: Record<BadgeVariant, string> = {
    primary: 'bg-comatch-primary text-white',
    light: 'bg-comatch-light text-blue-900', // Soft blue background with dark blue text
    outline:
      'border border-comatch-primary text-comatch-primary bg-transparent',
    gray: 'bg-gray-200 text-gray-700', // Useful for inactive or generic tags
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
