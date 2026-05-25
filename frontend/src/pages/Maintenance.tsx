import React, { useState, useEffect } from 'react';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { apiClient } from '../services/apiClient';
import type { MaintenanceLogItem } from '../types/logs';
import { Wrench, Plus, AlertCircle, Calendar } from 'lucide-react';

interface MaintenanceProps {
  userRole: 'admin' | 'operator';
}

export const Maintenance: React.FC<MaintenanceProps> = ({ userRole }) => {
  const [tickets, setTickets] = useState<MaintenanceLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // State manajemen form laporan (Khusus Admin)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [tableId, setTableId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Ambil manifes antrean perbaikan hardware
  const fetchTickets = async () => {
    try {
      const response = await apiClient.get<MaintenanceLogItem[]>('/api/v1/logs/maintenance');
      setTickets(response.data);
    } catch (error) {
      console.error('Gagal memuat log pemeliharaan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tableId.trim() || !description.trim()) {
      setFormError('Semua kolom bidang pelaporan wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      // Mengirimkan objek kerusakan hardware baru ke backend
      await apiClient.post('/api/v1/logs/maintenance', {
        table_id: tableId,
        issue_description: description
      });
      
      // Reset State & Muat Ulang Tabel
      setTableId('');
      setDescription('');
      setIsModalOpen(false);
      fetchTickets();
    } catch (error: any) {
      setFormError(error.response?.data?.detail || 'Gagal mengirimkan laporan perbaikan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Konfigurasi Kolom Penyaji Data Tabel Manifes Kerusakan Perangkat
  const columns = [
    {
      header: 'Laboratorium',
      accessor: (item: MaintenanceLogItem) => <span className="font-black text-gray-800">{item.lab_name}</span>
    },
    {
      header: 'Lokasi Stasiun',
      accessor: (item: MaintenanceLogItem) => <span className="font-semibold text-gray-600">Meja {item.table_number}</span>
    },
    {
      header: 'Deskripsi Kerusakan Hardware',
      className: 'max-w-xs truncate',
      accessor: 'issue_description'
    },
    {
      header: 'Pelapor',
      accessor: 'reporter_name'
    },
    {
      header: 'Status Perbaikan',
      accessor: (item: MaintenanceLogItem) => {
        if (item.status === 'RESOLVED') return <Badge variant="success">SELESAI</Badge>;
        if (item.status === 'IN_PROGRESS') return <Badge variant="primary">DIPERBAIKI</Badge>;
        return <Badge variant="danger">ANTREAN</Badge>;
      }
    }
  ];

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      
      {/* Sisi Atas: Judul & Tombol Tambah dengan Proteksi Gated Role TypeScript */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-wide flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" /> LAPORAN PEMELIHARAAN ASSET
          </h2>
          <p className="text-xs text-gray-400 font-medium">Sistem kendali dan inventarisasi kendala perangkat keras laboratorium</p>
        </div>

        {/* PROTEKSI ROLE ABSOLUT: Tombol hanya di-render jika User bertindak sebagai Admin */}
        {userRole === 'admin' && (
          <Button
            variant="primary"
            className="w-full sm:w-auto text-xs font-bold gap-1.5 px-4 py-2 shadow-xs"
            onClick={() => { setFormError(null); setIsModalOpen(true); }}
          >
            <Plus className="h-4 w-4" /> Tambah Laporan Perbaikan
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center p-12 text-sm text-gray-400 font-medium">Membaca manifes rekam pemeliharaan...</div>
      ) : (
        <Table data={tickets} columns={columns} keyExtractor={(item) => item.id} />
      )}

      {/* DIALOG MODAL TAMBAH TICKET: Hanya diakses jika Lolos Otorisasi Admin */}
      {userRole === 'admin' && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Laporkan Kerusakan Komputer Baru"
        >
          <form onSubmit={handleCreateTicket} className="flex flex-col gap-4">
            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2 animate-pulse">
                <AlertCircle className="h-4 w-4" /> {formError}
              </div>
            )}

            <Input
              id="table_id_input"
              label="ID / UUID Meja Komputer"
              type="text"
              placeholder="Masukkan UUID stasiun meja target..."
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              disabled={isSubmitting}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="issue_desc_input" className="text-sm font-semibold text-gray-700 tracking-wide">
                Deskripsi Detail Kerusakan Perangkat Hardware
              </label>
              <textarea
                id="issue_desc_input"
                rows={3}
                placeholder="Contoh: RAM Meja 04 mati total, blue screen saat booting..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 rounded-md text-sm outline-none transition-all duration-200"
              />
            </div>

            <div className="w-full flex justify-end gap-2 border-t border-gray-50 pt-3 mt-1">
              <Button type="button" variant="secondary" className="px-4 py-1.5 text-xs font-bold" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Batalkan
              </Button>
              <Button type="submit" variant="primary" className="px-4 py-1.5 text-xs font-bold shadow-xs" isLoading={isSubmitting}>
                Kirim Laporan
              </Button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};