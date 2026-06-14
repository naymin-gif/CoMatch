/* 
    Components that accept user inputs.
*/

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

// Using forwardRef 
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    
    // Base styles for the input field
    const inputBaseStyle = "px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-shadow disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed w-full";
    
    // Dynamic styles depending on whether there is an error
    const inputStateStyle = error 
      ? "border-comatch-danger focus:ring-comatch-danger focus:border-comatch-danger" 
      : "border-gray-300 focus:ring-comatch-primary focus:border-comatch-primary";

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {/* Render the label if provided */}
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        
        {/* The actual input field */}
        <input
          ref={ref}
          className={`${inputBaseStyle} ${inputStateStyle}`}
          {...props}
        />
        
        {/* Render the error message if provided */}
        {error && (
          <span className="text-xs text-comatch-danger">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;