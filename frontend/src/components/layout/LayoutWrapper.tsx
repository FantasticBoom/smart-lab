import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileDrawer } from './MobileDrawer';

interface LayoutWrapperProps {
  children: React.ReactNode;
  currentPath: string;
  username: string;
  role: 'admin' | 'operator';
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({
  children,
  currentPath,
  username,
  role,
  onNavigate,
  onLogout,
}) => {
  // State pengendali visibilitas drawer mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="w-full min-h-screen bg-gray-50/50 flex flex-col antialiased font-sans">
      {/* 1. Render Bilah Atas */}
      <Header
        username={username}
        role={role}
        onMenuToggle={() => setIsMobileMenuOpen(true)}
        onLogout={onLogout}
      />

      {/* 2. Pembungkus Konten Utama dan Menu Navigasi Samping */}
      <div className="w-full flex flex-1 relative">
        {/* Desktop Sidebar (Permanen di resolusi MD+) */}
        <Sidebar currentPath={currentPath} onNavigate={onNavigate} />

        {/* Mobile Drawer Overlay (Hanya aktif di resolusi kecil saat dipicu) */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          currentPath={currentPath}
          onNavigate={onNavigate}
        />

        {/* 3. Area Konten Utama Aplikasi (Flexible Content Area) */}
        <main className="flex-1 p-4 md:p-6 min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};