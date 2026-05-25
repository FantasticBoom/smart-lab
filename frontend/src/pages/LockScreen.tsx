import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { apiClient } from '../services/apiClient';
import { websocketService } from '../services/websocketService';
import { Lock, ShieldAlert, CheckCircle } from 'lucide-react';

interface LockScreenProps {
  clientIdFromAgent: string; 
  computerName: string;
  tableNumber: string;
  onLocalUnlockSuccess: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  clientIdFromAgent,
  computerName,
  tableNumber,
  onLocalUnlockSuccess
}) => {
  const [bypassPin, setBypassPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Efek Real-Time: Jika Admin membuka kunci dari Dashboard Utama via WebSocket,
  // maka Lock Screen di PC ini akan otomatis terbuka secara instan.
  useEffect(() => {
    websocketService.connect();
    
    const unsubscribe = websocketService.subscribe((message: any) => {
      if (message.type === 'COMMAND_UNLOCK' && message.client_id === clientIdFromAgent) {
        setIsSuccess(true);
        setTimeout(() => {
          onLocalUnlockSuccess();
        }, 1500);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [clientIdFromAgent, onLocalUnlockSuccess]);

  const handleBypassUnlock = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!bypassPin.trim()) {
      setError('PIN bypass administrasi wajib diisi!');
      return;
    }

    setIsLoading(true);
    try {
      // Menembak endpoint otentikasi lokal untuk verifikasi pelepasan gembok workstation
      await apiClient.post('/api/v1/command/verify-bypass', {
        client_id: clientIdFromAgent,
        bypass_pin: bypassPin
      });

      setIsSuccess(true);
      setError(null);
      
      // Berikan jeda animasi sebelum menutup layar lockscreen penuh
      setTimeout(() => {
        onLocalUnlockSuccess();
      }, 1500);

    } catch (err: any) {
      if (err.response && err.response.status === 429) {
        setError('Terlalu banyak percobaan PIN salah! Sistem dibekukan sementara.');
      } else {
        setError(err.response?.data?.detail || 'PIN bypass salah atau tidak terdaftar!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-slate-900 flex flex-col items-center justify-center p-4 select-none antialiased font-sans">
      <div className="w-full max-w-sm animate-fade-in text-center">
        
        {/* Desain Atas: Indikator Proteksi Gembok Workstation */}
        <div className="mb-6 flex flex-col items-center">
          <div className={`p-4 rounded-3xl border mb-4 shadow-lg transition-all duration-500 ${
            isSuccess 
              ? 'bg-green-500 text-white border-green-400 scale-110' 
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}>
            <Lock className="h-8 w-8 animate-pulse" />
          </div>
          
          <h1 className="text-xl font-black text-white tracking-wider uppercase">
            {isSuccess ? 'Akses Terbuka' : 'STASIUN KERJA DIKUNCI'}
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1 tracking-widest uppercase">
            Lab Komputer UIGM — Meja {tableNumber} ({computerName})
          </p>
        </div>

        {/* Kotak Penginputan Kredensial Administrasi Lokal */}
        <Card className="bg-white/95 border-0 shadow-2xl backdrop-blur-md p-6 text-left">
          {isSuccess ? (
            <div className="py-6 flex flex-col items-center justify-center text-center gap-3 text-green-600 animate-scale-up">
              <CheckCircle className="h-10 w-10" />
              <span className="text-sm font-black tracking-wide">Membuka proteksi Windows, silakan tunggu...</span>
            </div>
          ) : (
            <form onSubmit={handleBypassUnlock} className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Gunakan otorisasi bypass komputer lokal untuk membuka workstation jika tidak melalui dasbor pusat admin.
              </p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2 animate-pulse">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                id="bypass_pin_input"
                label="PIN Bypass Administrator"
                type="password"
                placeholder="Masukkan PIN keamanan meja..."
                value={bypassPin}
                onChange={(e) => setBypassPin(e.target.value)}
                disabled={isLoading}
                maxLength={8}
                className="text-center font-mono text-lg tracking-widest border-slate-200 focus:ring-red-100 focus:border-red-500"
              />

              <Button
                type="submit"
                variant="danger"
                className="w-full mt-2 py-2.5 text-xs font-black tracking-widest uppercase shadow-md bg-red-600 hover:bg-red-700 focus:ring-red-500"
                isLoading={isLoading}
              >
                Buka Kunci Lokal
              </Button>
            </form>
          )}
        </Card>

        {/* Informasi Identitas Bawah Keamanan Kampus */}
        <div className="mt-8">
          <span className="text-[9px] text-slate-500 font-black tracking-widest uppercase block">
            PROTECTED BY UIGM SECURITY INFRASTRUCTURE — © 2026
          </span>
        </div>

      </div>
    </div>
  );
};