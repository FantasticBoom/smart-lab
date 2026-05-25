// src/components/ui/Button.tsx
import React from 'react';
import type { ComponentVariant } from '../../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ComponentVariant;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  // Pemetaan gaya warna murni menggunakan variabel standar CSS Tailwind 4.2
  const variantStyles: Record<ComponentVariant, string> = {
    primary: 'bg-[var(--color-uigm-blue,rgba(30,58,138,1))] hover:bg-blue-900 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    warning: 'bg-[var(--color-uigm-orange,rgba(249,115,22,1))] hover:bg-orange-600 text-white focus:ring-orange-500',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`
        px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Memproses...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};