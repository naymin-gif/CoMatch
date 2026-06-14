/* 
    A standard circular profile picture component. 
    This appears on the User Profile page , next to user names in the chat sidebar, 
    and on individual Teammate Call posts. It should accept an image URL or 
    display the user's initial (like "H" for Henry) if no image is uploaded.
*/

import React from 'react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string; // Optional: The image URL
  alt: string;  // Required: Used for accessibility AND to grab the initial
  size?: AvatarSize;
  className?: string;
}

export default function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  ...props 
}: AvatarProps) {
  
  // Base container styles: perfectly round, hides overflow, centers text
  const baseStyle = "relative inline-flex items-center justify-center rounded-full overflow-hidden bg-comatch-light text-comatch-primary font-bold shrink-0";
  
  // Size variations
  const sizes: Record<AvatarSize, string> = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-2xl",
    xl: "w-24 h-24 text-4xl",
  };

  // Grab the first letter of the alt text for the fallback initial
  const initial = alt ? alt.charAt(0).toUpperCase() : '?';

  return (
    <div 
      className={`${baseStyle} ${sizes[size]} ${className}`} 
      {...props}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}