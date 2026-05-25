import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};