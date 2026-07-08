import React from 'react';

// exact strings allowed for the variant
type ButtonVariant =
  | 'primary'
  | 'success'
  | 'danger'
  | 'outline'
  | 'tab-active'
  | 'tab-inactive';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  // Base styles applied to ALL buttons
  const baseStyle =
    'px-6 py-2 rounded-full font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  // Specific styles based on the variant prop
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-comatch-primary text-white hover:bg-comatch-light',
    success: 'bg-comatch-success text-white hover:opacity-80',
    danger: 'bg-comatch-danger text-white hover:opacity-80',
    outline:
      'border-2 border-comatch-primary text-comatch-primary hover:bg-gray-50',
    'tab-active': 'bg-comatch-primary text-white shadow-md text-sm',
    'tab-inactive':
      'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 text-sm',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
