import React from 'react';
import { LayoutDashboard, Monitor, ShieldCheck, Wrench } from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const menuItems = [
    { name: 'Dashboard Monitoring', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventaris Lab', path: '/inventory', icon: Monitor },
    { name: 'Log Audit Keamanan', path: '/audit', icon: ShieldCheck },
    { name: 'Laporan Pemeliharaan', path: '/maintenance', icon: Wrench },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-100 p-4 sticky top-16 left-0 overflow-y-auto">
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 text-left
                ${isActive
                  ? 'bg-blue-50 text-[var(--color-uigm-blue,#1e3a8a)] border-l-4 border-[var(--color-uigm-blue,#1e3a8a)] shadow-xs'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[var(--color-uigm-blue,#1e3a8a)]' : 'text-gray-400'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Footer Hak Cipta Internal */}
      <div className="mt-auto pt-4 border-t border-gray-50 text-center">
        <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase block">
          © 2026 UIGM Palembang
        </span>
      </div>
    </aside>
  );
};