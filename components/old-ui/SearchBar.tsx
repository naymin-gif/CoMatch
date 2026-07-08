import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className = '', placeholder = 'Search...', ...props }, ref) => {
    return (
      <div className={`relative w-full ${className}`}>
        {/* Search Icon */}
        <span className="absolute inset-y-0 left-4 flex items-center text-gray-400 pointer-events-none">
          <Search size={20} />
        </span>

        {/* Search Input Field */}
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-comatch-primary focus:border-comatch-primary text-gray-900 placeholder-gray-400 transition"
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
