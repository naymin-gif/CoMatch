/* UI for all pages. All pages in this app must be wrapped with this. */

import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export default function PageWrapper({
  children,
  title,
  subtitle,
  headerAction,
}: PageWrapperProps) {
  return (
    <div className="w-full min-h-screen pb-40 pt-12 font-sans relative">
      <div className="max-w-3xl mx-auto px-6">
        {/* Page Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-heading-lg font-extrabold font-heading text-gray-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-500 text-mini mt-1">{subtitle}</p>
            )}
          </div>

          {/* Optional buttons/actions opposite the title */}
          {headerAction && <div>{headerAction}</div>}
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
}
