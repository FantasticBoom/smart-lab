import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in">
      {/* Backdrop Gelap Belakang */}
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Konten Sheet Meluncur dari Bawah */}
      <div className="relative w-full md:max-w-xl bg-white rounded-t-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden animate-slide-up border-t border-gray-100">
        
        {/* Notch Dekoratif untuk Indikator Geser HP */}
        <div className="w-full flex justify-center py-2.5 bg-white">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Header Sheet */}
        <div className="px-6 pb-4 border-b border-gray-50 flex items-center justify-between bg-white">
          <h3 className="text-base font-black text-gray-900 tracking-wide uppercase">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Isi Informasi Spesifikasi Hardware */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 text-sm">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};