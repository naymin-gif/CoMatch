/*
    A multi-line text area. 
    Examples uses: description field in spaces, posts, intro messages from requests. 
*/

import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    
    // Base styles mimicking the Input component, plus vertical resizing
    const textareaBaseStyle = "px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-shadow disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed w-full resize-y min-h-[100px] text-gray-900";
    
    // Dynamic styles depending on whether there is an error
    const textareaStateStyle = error 
      ? "border-comatch-danger focus:ring-comatch-danger focus:border-comatch-danger" 
      : "border-gray-300 focus:ring-comatch-primary focus:border-comatch-primary";

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {/* Render the label if provided */}
        {label && (
          <label htmlFor={props.id || props.name} className="text-mini font-medium text-gray-700">
            {label}
          </label>
        )}
        
        {/* The actual textarea field */}
        <textarea
          ref={ref}
          id={props.id || props.name}
          className={`${textareaBaseStyle} ${textareaStateStyle}`}
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

Textarea.displayName = 'Textarea';

export default Textarea;