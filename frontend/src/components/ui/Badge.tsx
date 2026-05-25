import React from 'react';
import type { ComponentVariant } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: ComponentVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className = '' 
}) => {
  const variantStyles: Record<ComponentVariant, string> = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-gray-50 text-gray-700 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide
      ${variantStyles[variant]} ${className}
    `}>
      {children}
    </span>
  );
};