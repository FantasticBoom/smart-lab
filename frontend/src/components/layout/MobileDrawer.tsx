import React from 'react';
import { X, LayoutDashboard, Monitor, ShieldCheck, Wrench } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { name: 'Dashboard Monitoring', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventaris Lab', path: '/inventory', icon: Monitor },
    { name: 'Log Audit Keamanan', path: '/audit', icon: ShieldCheck },
    { name: 'Laporan Pemeliharaan', path: '/maintenance', icon: Wrench },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    onClose(); // Menutup otomatis setelah berpindah rute
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
      {/* Backdrop Gelap Belakang */}
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" onClick={onClose} />

      {/* Konten Menu Latar Belakang Putih */}
      <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col p-5 shadow-2xl z-10 animate-slide-in">
        {/* Atas Drawer */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <span className="text-xs font-black text-[var(--color-uigm-blue,#1e3a8a)] tracking-widest">
            MENU NAVIGASI
          </span>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List Menu Links */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleLinkClick(item.path)}
                className={`
                  w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-150 text-left
                  ${isActive
                    ? 'bg-blue-50 text-[var(--color-uigm-blue,#1e3a8a)] shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[var(--color-uigm-blue,#1e3a8a)]' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="text-center pt-4 border-t border-gray-50">
          <span className="text-[10px] text-gray-400 font-bold tracking-widest block">
            UIGM SMART LAB SMARTPHONE
          </span>
        </div>
      </div>
    </div>
  );
};