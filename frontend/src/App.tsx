import React, { useState, useEffect } from 'react';
import { LayoutWrapper } from './components/layout/LayoutWrapper';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { LabDetail } from './pages/LabDetail';
import { AuditLogs } from './pages/AuditLogs';
import { Maintenance } from './pages/Maintenance';
import { LockScreen } from './pages/LockScreen';
import type { UserData } from './types';
import { websocketService } from './services/websocketService';

export const App: React.FC = () => {
  // 1. State Autentikasi Global Sesi
  const [token, setToken] = useState<string | null>(localStorage.getItem('uigm_token'));
  const [user, setUser] = useState<UserData | null>(() => {
    const savedUser = localStorage.getItem('uigm_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. State Navigator / Router Ringan Sesuai Kontrak Komponen Layout
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/dashboard');
  
  // State sub-sub halaman khusus modul Inventaris Lab Penunjuk Detail
  const [selectedLab, setSelectedLab] = useState<{ id: string; name: string } | null>(null);

  // Efek Pelacak URL Fisik Browser (Fail-safe Sinkronisasi Tombol Back)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fungsi Pemicu Perpindahan Halaman Dinamis
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    // Reset sub-halaman inventaris jika berpindah menu utama
    if (path !== '/inventory') {
      setSelectedLab(null);
    }
  };

  // Handler Keberhasilan Masuk Gerbang Log In
  const handleLoginSuccess = (username: string, role: 'admin' | 'operator') => {
    setToken(localStorage.getItem('uigm_token'));
    const savedUser = localStorage.getItem('uigm_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    navigateTo('/dashboard');
  };

  // Handler Pemutusan Sesi Sistem (Log Out)
  const handleLogout = () => {
    localStorage.removeItem('uigm_token');
    localStorage.removeItem('uigm_user');
    websocketService.disconnect(); // Tutup aliran live data socket secara sengaja
    setToken(null);
    setUser(null);
    navigateTo('/login');
  };

  // ==========================================
  // SKENARIO 1: ISOLASI TOTAL RUTE LOCK SCREEN KLIEN (Menolak Kerangka Shell Admin)
  // ==========================================
  if (currentPath === '/client/lockscreen') {
    return (
      <LockScreen
        clientIdFromAgent="00:1A:2B:3C:4D:5E" // Nilai makro disuplai dinamis oleh AgentUIGM Windows
        computerName="LAB_A_PC04"
        tableNumber="04"
        onLocalUnlockSuccess={() => {
          console.log('[SYSTEM SMART LAB] Proteksi gembok lokal berhasil dibuka.');
          navigateTo('/dashboard'); // Kembalikan ke rute utama aman jika diuji di browser
        }}
      />
    );
  }

  // ==========================================
  // SKENARIO 2: GATEWAY PROTEKSI BELUM LOGIN (Sandi/Kredensial Belum Terverifikasi)
  // ==========================================
  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // ==========================================
  // SKENARIO 3: OPERATOR TERVERIFIKASI (Aspek Rasio Layout Makro Diaktifkan)
  // ==========================================
  return (
    <LayoutWrapper
      currentPath={currentPath}
      username={user.username}
      role={user.role}
      onNavigate={navigateTo}
      onLogout={handleLogout}
    >
      {/* Logika Switch View Render Berdasarkan State Jalur Rute Dinamis */}
      {(() => {
        switch (currentPath) {
          case '/dashboard':
            return <Dashboard />;
            
          case '/inventory':
            // Jika sub-menu detail lab dipilih, render denah meja. Jika tidak, tampilkan grid list lab.
            if (selectedLab) {
              return (
                <LabDetail
                  labId={selectedLab.id}
                  labName={selectedLab.name}
                  onBack={() => setSelectedLab(null)}
                />
              );
            }
            return (
              <Inventory
                onSelectLab={(id, name) => setSelectedLab({ id, name })}
              />
            );
            
          case '/audit':
            return <AuditLogs />;
            
          case '/maintenance':
            return <Maintenance userRole={user.role} />;
            
          default:
            // Fail-safe URL: Jika rute tidak dikenali, kembalikan pandangan operator ke halaman utama dasbor
            return <Dashboard />;
        }
      })()}
    </LayoutWrapper>
  );
};