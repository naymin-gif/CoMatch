/*
    Standard white, rounded container with a soft shadow. 
    Use it to wrap distinct blocks of content like dashboard items, 
    form sections, or profile details.
*/

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ 
  children, 
  className = '', 
  ...props 
}: CardProps) {
  
  // Base styles: white background, custom card border-radius, a soft shadow, and default padding
  const baseStyle = "bg-white rounded-card shadow-md p-6";

  return (
    <div 
      className={`${baseStyle} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}