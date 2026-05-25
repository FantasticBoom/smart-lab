// src/pages/AuditLogs.tsx
import React, { useState, useEffect } from 'react';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { apiClient } from '../services/apiClient';
import type { AuditLogItem } from '../types/logs';
import { ShieldCheck, Clock, User, Activity } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Deteksi ukuran layar responsif secara dinamis
  useEffect(() => {
    const checkResponsiveSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkResponsiveSize();
    window.addEventListener('resize', checkResponsiveSize);
    return () => window.removeEventListener('resize', checkResponsiveSize);
  }, []);

  // Ambil data log dari database secara kronologis (Terbaru di atas)
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await apiClient.get<AuditLogItem[]>('/api/v1/logs/audit');
        setLogs(response.data);
      } catch (error) {
        console.error('Gagal memuat log audit keamanan:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuditLogs();
  }, []);

  // Format Helper untuk Tanggal PostgreSQL
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Konfigurasi Kolom Tabel murni Generik untuk Resolusi Desktop (Monitor Lab)
  const columns = [
    {
      header: 'Waktu Transaksi',
      accessor: (item: AuditLogItem) => (
        <span className="font-mono text-gray-500 font-medium">{formatDate(item.created_at)}</span>
      )
    },
    {
      header: 'Operator Pengeksekusi',
      accessor: (item: AuditLogItem) => (
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <User className="h-3.5 w-3.5 text-gray-400" /> {item.operator_name}
        </div>
      )
    },
    {
      header: 'Aksi & Instruksi Sistem',
      accessor: (item: AuditLogItem) => (
        <span className="font-semibold text-gray-800">{item.action}</span>
      )
    },
    {
      header: 'Tingkat Keamanan',
      accessor: (item: AuditLogItem) => {
        const isBroadcast = item.action.includes('BROADCAST');
        return (
          <Badge variant={isBroadcast ? 'warning' : 'primary'}>
            {isBroadcast ? 'SYSTEM_WIDE' : 'WORKSTATION'}
          </Badge>
        );
      }
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-black text-gray-900 tracking-wide flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600" /> LOG AUDIT KEAMANAN
        </h2>
        <p className="text-xs text-gray-400 font-medium">Manifes transparansi riwayat instruksi operasional laboratorium komputer UIGM</p>
      </div>

      {isLoading ? (
        <div className="text-center p-12 text-sm text-gray-400 font-medium">Membaca berkas enkripsi log audit...</div>
      ) : logs.length === 0 ? (
        <Card className="text-center p-12 text-sm text-gray-400 font-medium">Belum ada aktivitas terekam di database.</Card>
      ) : isMobile ? (
        
        /* RENDERING OPTIMAL SMARTPHONE: Card Timeline List Vertikal Ringkas */
        <div className="flex flex-col gap-3">
          {logs.map((item) => (
            <Card key={item.id} className="border border-gray-100/70 p-4 flex flex-col gap-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <User className="h-3.5 w-3.5 text-gray-400" /> {item.operator_name}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono font-medium text-gray-400">
                  <Clock className="h-3 w-3" /> {formatDate(item.created_at)}
                </div>
              </div>
              
              <div className="text-sm font-black text-gray-800 bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{item.action}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        
        /* RENDERING OPTIMAL DESKTOP: Tabel Komponen Generik Modular */
        <Table data={logs} columns={columns} keyExtractor={(item) => item.id} />
      )}
    </div>
  );
};