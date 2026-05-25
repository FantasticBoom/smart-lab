import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { ShieldAlert, User, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (username: string, role: 'admin' | 'operator') => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  
  // State manajemen error validasi sesuai protokol keamanan
  const [errors, setErrors] = useState<{ username?: string; password?: string; global?: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State hitung mundur untuk penanganan SlowAPI Rate Limit (HTTP 429)
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(0);

  useEffect(() => {
    if (rateLimitCountdown <= 0) return;
    const timer = setInterval(() => {
      setRateLimitCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [rateLimitCountdown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const localErrors: typeof errors = {};
    if (!username.trim()) localErrors.username = 'Username institusi wajib diisi';
    if (!password) localErrors.password = 'Security password wajib diisi';

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setIsLoading(true);
    try {
      // Mengonsumsi API nyata POST /api/v1/auth/login menggunakan format OAuth2 Form
      const data = await authService.login(username, password);
      
      localStorage.setItem('uigm_token', data.access_token);
      localStorage.setItem('uigm_user', JSON.stringify(data.user_data));
      
      onLoginSuccess(data.user_data.username, data.user_data.role);
    } catch (error: any) {
      const serverErrors: typeof errors = {};

      if (error.response) {
        const { status, data } = error.response;
        if (status === 429) {
          serverErrors.global = 'Too many authorization attempts. Session locked temporarily.';
          setRateLimitCountdown(60); 
        } else if (status === 401) {
          serverErrors.global = 'Invalid institutional username or security password.';
        } else {
          serverErrors.global = data?.detail || 'Authentication server error. Please try again.';
        }
      } else {
        serverErrors.global = 'Failed to establish connection to Central Research Hub.';
      }
      setErrors(serverErrors);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gray-100 flex items-center justify-center p-4 antialiased font-sans overflow-hidden">
      
      {/* 1. Latar Belakang Lab dengan Overlay Efek Gambar login.jpg */}
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-25 mix-blend-overlay scale-105" 
           style={{ backgroundImage: `url('../assets/lab.webp')` }} />
      
      {/* 2. Dekorasi Kotak Transparan Floating Semisimetris Sesuai Mockup */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[18%] w-16 h-16 bg-white/40 backdrop-blur-xs rounded-xl border border-white/20 shadow-xs" />
        <div className="absolute top-[4%] right-[12%] w-28 h-28 bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20" />
        <div className="absolute bottom-[30%] left-[25%] w-14 h-14 bg-white/50 backdrop-blur-xs rounded-lg" />
        <div className="absolute bottom-[5%] left-[19%] w-36 h-36 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20" />
        <div className="absolute bottom-[15%] right-[8%] w-32 h-32 bg-white/30 backdrop-blur-xs rounded-xl border border-white/10" />
        <div className="absolute bottom-[20%] right-[15%] w-20 h-20 bg-white/40 backdrop-blur-sm rounded-xl border border-white/20" />
        <div className="absolute top-[35%] right-[22%] w-10 h-10 bg-white/20 backdrop-blur-xs rounded-md" />
      </div>

      {/* Kontainer Utama Form Login */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center">
        
        {/* Identitas Autentikasi LabSystem Pro */}
        <div className="text-center mb-7 select-none">
          <div className="inline-flex p-3 bg-[#002060] text-white rounded-xl mb-3.5 shadow-md border border-[#001845]">
            {/* Ikon Cawan Lab / Erlenmeyer custom CSS murni / Lucide */}
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12M12 3v11M9 11h6M4 21h16M5 11l4.66-9.33a1 1 0 0 1 1.78 0L19 11v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-[#002060] tracking-tight">Smart Lab System</h1>
          <p className="text-[11px] text-gray-400 font-bold tracking-wider mt-0.5 uppercase">Central Research Hub Authentication</p>
        </div>

        {/* Form Box Putih Bersih */}
        <Card className="w-full bg-white/95 backdrop-blur-md p-7 rounded-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Penangan Notifikasi Error Rate Limit / Kredensial Salah */}
            {errors.global && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold flex items-start gap-2 animate-fade-in">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p>{errors.global}</p>
                  {rateLimitCountdown > 0 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">Retry cooldown active: {rateLimitCountdown}s</p>
                  )}
                </div>
              </div>
            )}

            {/* Input 1: Institutional Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase">
                Institutional Username
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder="e.g. admin_j_smith"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading || rateLimitCountdown > 0}
                  className={`w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50/50 border ${errors.username ? 'border-red-400 focus:ring-red-100' : 'border-gray-200/80 focus:border-gray-400 focus:ring-gray-100'} rounded-lg transition-all focus:outline-none focus:ring-4 font-medium text-gray-700 placeholder-gray-300`}
                />
              </div>
              {errors.username && <span className="text-[10px] text-red-500 font-semibold">{errors.username}</span>}
            </div>

            {/* Input 2: Security Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[10px] font-mono font-bold text-gray-500 tracking-widest uppercase">
                Security Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || rateLimitCountdown > 0}
                  className={`w-full pl-10 pr-10 py-2.5 text-xs bg-gray-50/50 border ${errors.password ? 'border-red-400 focus:ring-red-100' : 'border-gray-200/80 focus:border-gray-400 focus:ring-gray-100'} rounded-lg transition-all focus:outline-none focus:ring-4 font-mono text-gray-700 placeholder-gray-300`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[10px] text-red-500 font-semibold">{errors.password}</span>}
            </div>

            {/* Baris Opsi: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-[11px] font-semibold mt-1 select-none">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-sm border-gray-300 text-[#002060] focus:ring-[#002060]/20 cursor-pointer accent-[#002060]"
                />
                <span className="group-hover:text-gray-600 transition-colors">Remember Me</span>
              </label>
              <a href="#forgot" className="text-[#002060] hover:underline hover:text-blue-900 transition-colors font-bold">
                Forgot Password?
              </a>
            </div>

            {/* Tombol Eksekusi Sesi */}
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={rateLimitCountdown > 0}
              className="w-full bg-[#002060] hover:bg-[#001845] text-white py-3 rounded-lg text-xs font-bold tracking-wide shadow-md transition-all active:scale-[0.99] mt-3 flex items-center justify-center gap-2"
            >
              <span>Authorize Session</span>
              <span className="text-sm font-normal">→</span>
            </Button>
          </form>

          {/* Garis batas pemisah tipis */}
          <div className="w-full h-[1px] bg-gray-100 my-5" />

          {/* Kontak Admin Informasi Internal */}
          <div className="text-center text-[10px] font-medium text-gray-400 tracking-wide">
            Internal System Access Only. <br />
            <a href="#admin-contact" className="text-[#002060] font-bold hover:underline transition-colors mt-0.5 inline-block">
              Contact System Administrator
            </a> for access.
          </div>
        </Card>

        {/* Footer Luar: Status Operasional Sistem */}
        <div className="mt-6 flex items-center gap-4 text-[9px] font-mono font-bold text-gray-400 tracking-widest uppercase select-none animate-fade-in">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00ffcc] shadow-[0_0_8px_#00ffcc] animate-pulse" />
            <span>SYSTEM OPERATIONAL</span>
          </div>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-1">
            <span>🛡️ V4.2.0-STABLE</span>
          </div>
        </div>

      </div>
    </div>
  );
};