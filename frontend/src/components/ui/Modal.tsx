import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer 
}) => {
  // Mengunci scroll layar utama saat modal terbuka (Sangat krusial di smartphone)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Backdrop Hitam Transparan */}
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Konten Modal Box */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-xl shadow-xl z-10 transform transition-all overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
          <h3 className="text-base font-bold text-gray-900 tracking-wide">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Isi/Body Modal */}
        <div className="p-5 overflow-y-auto text-sm text-gray-600 flex-1">
          {children}
        </div>

        {/* Footer Modal */}
        {footer && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};