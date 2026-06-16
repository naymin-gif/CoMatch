/* 
    Used for status badge in dashboard: pending, approved or rejected
*/ 

import React from 'react';

export type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: ApplicationStatus;
  className?: string;
}

export default function StatusBadge({ 
  status, 
  className = '', 
  ...props 
}: StatusBadgeProps) {
  
  // Base style for the badge container
  const baseStyle = "inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-pill";

  // Specific styles for each status state
  const styles: Record<ApplicationStatus, string> = {
    Pending: "bg-gray-100 text-gray-700",
    Approved: "bg-comatch-success text-white",
    Rejected: "bg-comatch-danger text-white",
  };

  // SVGs
  const icons = {
    Pending: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    Approved: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    Rejected: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  return (
    <span 
      className={`${baseStyle} ${styles[status]} ${className}`} 
      {...props}
    >
      {icons[status]}
      {status}
    </span>
  );
}