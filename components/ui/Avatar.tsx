import React from 'react';
import { StaticImageData } from 'next/image';

interface AvatarProps {
  name: string;
  src?: string | StaticImageData;
}

const getInitials = (name: string) => {
  if (!name) return "";
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function Avatar({ name, src }: AvatarProps) {
  if (src) {
    const imageSource = typeof src === 'string' ? src : src.src;

    return (
      <div className="avatar">
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-sm bg-white overflow-hidden shrink-0 z-10">
          <img 
            src={imageSource} 
            alt={`${name}'s profile picture`} 
            className="object-cover w-full h-full rounded-full"
          />
        </div>
      </div>
    );
  }

  const initials = getInitials(name);

  return (
    <div className="avatar placeholder">
      <div className="bg-comatch-light text-neutral-content w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-sm flex items-center justify-center shrink-0 z-10">
        <span className="text-4xl sm:text-5xl font-semibold">{initials}</span>
      </div>
    </div>
  );
}