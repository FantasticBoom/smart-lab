import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';

interface HeaderProps {
  username: string;
  role: 'admin' | 'operator';
  onMenuToggle: () => void; 
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  username,
  role,
  onMenuToggle,
  onLogout,
}) => {
  return (
    <header className="w-full h-16 bg-white border-b border-gray-100 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Sisi Kiri: Tombol Hamburger (Mobile Only) & Judul Sistem */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 md:hidden transition-all focus:outline-none"
          aria-label="Buka Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:gap-2">
          <span className="text-sm font-black text-[var(--color-uigm-blue,#1e3a8a)] tracking-wider">
            UIGM SMART LAB
          </span>
          <span className="hidden md:inline text-gray-300">|</span>
          <span className="text-xs md:text-sm font-semibold text-gray-500">
            System Management Laboratory
          </span>
        </div>
      </div>

      {/* Sisi Kanan: Informasi Profil Operator & Aksi */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          <div className="p-1 rounded-full bg-blue-100 text-[var(--color-uigm-blue,#1e3a8a)]">
            <User className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-gray-800 leading-none">{username}</span>
            <span className="text-[10px] font-medium text-gray-400 capitalize">{role}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          title="Keluar Sistem"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};