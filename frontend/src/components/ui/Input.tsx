import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700 tracking-wide">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-3 py-2 border rounded-md text-sm transition-all duration-200
          focus:outline-none focus:ring-2
          ${error 
            ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
};