import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  toast, 
  onClose, 
  duration = 4000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  const typeStyles = {
    success: 'bg-green-600 text-white shadow-green-200/50',
    error: 'bg-red-600 text-white shadow-red-200/50',
    info: 'bg-blue-600 text-white shadow-blue-200/50',
  };

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium tracking-wide
      animate-slide-in max-w-sm w-full border border-white/10 ${typeStyles[toast.type]}
    `}>
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onClose(toast.id)} className="text-white/70 hover:text-white transition-all">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};