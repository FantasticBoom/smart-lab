// src/pages/LabDetail.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Grid } from '../components/ui/Grid';
import { BottomSheet } from '../components/ui/BottomSheet';
import { apiClient } from '../services/apiClient';
import type { LabTable, HardwareItem } from '../types/inventory';
import { ArrowLeft, Cpu, HardDrive, Layers, SquareTerminal, Info } from 'lucide-react';

interface LabDetailProps {
  labId: string;
  labName: string;
  onBack: () => void;
}

export const LabDetail: React.FC<LabDetailProps> = ({ labId, labName, onBack }) => {
  const [tables, setTables] = useState<LabTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<LabTable | null>(null);
  const [hardware, setHardware] = useState<HardwareItem[]>([]);
  
  const [isLoadingTables, setIsLoadingTables] = useState<boolean>(true);
  const [isLoadingHardware, setIsLoadingHardware] = useState<boolean>(false);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  // 1. Ambil Susunan Relasi Struktur Meja di Lab Terpilih
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await apiClient.get<LabTable[]>(`/api/v1/inventory/labs/${labId}/tables`);
        setTables(response.data);
      } catch (error) {
        console.error('Gagal mengambil data susunan meja lab:', error);
      } finally {
        setIsLoadingTables(false);
      }
    };

    fetchTables();
  }, [labId]);

  // 2. Ambil Spesifikasi Komponen Hardware saat Meja Terkait di-Tap/Klik Operator
  const handleTableTap = async (table: LabTable) => {
    setSelectedTable(table);
    setIsSheetOpen(true);
    setIsLoadingHardware(true);
    try {
      // Mengonsumsi endpoint penarik data hardware murni backend
      const response = await apiClient.get<HardwareItem[]>(`/api/v1/inventory/items?table_id=${table.id}`);
      setHardware(response.data);
    } catch (error) {
      console.error('Gagal mengambil spesifikasi komponen meja:', error);
      setHardware([]);
    } finally {
      setIsLoadingHardware(false);
    }
  };

  // Helper untuk merender ikon penanda jenis perangkat hardware spesifik
  const renderHardwareIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('processor') || lower.includes('cpu')) return <Cpu className="h-4 w-4 text-blue-600" />;
    if (lower.includes('ram') || lower.includes('memory')) return <Layers className="h-4 w-4 text-emerald-600" />;
    if (lower.includes('storage') || lower.includes('ssd') || lower.includes('hdd')) return <HardDrive className="h-4 w-4 text-orange-600" />;
    return <SquareTerminal className="h-4 w-4 text-purple-600" />;
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      {/* Header Halaman Kembalian Navigasi */}
      <div className="w-full flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 hover:text-gray-900 transition-all focus:outline-none">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-base font-black text-gray-900 tracking-wide uppercase">DENAH FISIK: {labName}</h2>
          <p className="text-xs text-gray-400 font-medium">Ketuk atau klik pada nomor meja untuk memverifikasi spesifikasi hardware secara detail</p>
        </div>
      </div>

      {isLoadingTables ? (
        <div className="text-center p-12 text-sm text-gray-400 font-medium">Menyusun matriks meja laboratorium...</div>
      ) : (
        <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          {/* Pembungkus Responsif Horizontal Scroll Adaptor untuk Smartphone */}
          <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-[760px] p-1">
              
              <Grid columns={4} className="gap-4">
                {tables.length === 0 ? (
                  <div className="col-span-4 p-12 text-center text-sm font-medium text-gray-400">
                    Belum ada tata letak meja fisik yang terdaftar pada ruangan lab ini.
                  </div>
                ) : (
                  tables.map((table) => (
                    <div
                      key={table.id}
                      onClick={() => handleTableTap(table)}
                      className="cursor-pointer bg-gray-50/60 border border-gray-100 hover:border-[var(--color-uigm-blue,#1e3a8a)] hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center h-28 transition-all duration-200 group shadow-xs"
                    >
                      <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors uppercase">Stasiun Kerja</span>
                      <span className="text-xl font-black text-gray-800 tracking-tight mt-0.5">Meja {table.table_number}</span>
                      
                      {table.client_id ? (
                        <span className="text-[9px] font-mono font-semibold text-emerald-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 mt-2 truncate max-w-full">
                          Terhubung Agen
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-2">
                          Kosong
                        </span>
                      )}
                    </div>
                  ))
                )}
              </Grid>

            </div>
          </div>
        </div>
      )}

      {/* IMPLEMENTASI PEMANGGILAN BOTTOM SHEET TERISOLASI RAMAH SMARTPHONE */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={selectedTable ? `Spesifikasi Hardware - Meja ${selectedTable.table_number}` : 'Detail Komponen'}
      >
        {isLoadingHardware ? (
          <div className="text-center py-10 text-sm font-semibold text-gray-400 animate-pulse flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            Membaca modul audit perangkat keras...
          </div>
        ) : hardware.length === 0 ? (
          <div className="p-6 bg-white rounded-xl border border-gray-100 text-center text-sm font-medium text-gray-400 flex flex-col items-center gap-2">
            <Info className="h-5 w-5 text-gray-300" />
            Tidak ada riwayat spesifikasi hardware yang tercatat pada meja ini di database.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {hardware.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-xs flex gap-4 items-start">
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl shrink-0">
                  {renderHardwareIcon(item.device_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block leading-none mb-1">
                    {item.device_type}
                  </span>
                  <h4 className="text-sm font-black text-gray-800 truncate">
                    {item.brand} {item.model}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 bg-gray-50 p-1.5 rounded border border-gray-100/50">
                    {item.specification}
                  </p>
                  
                  <div className="text-[10px] font-mono text-gray-400 font-semibold mt-2">
                    S/N: {item.serial_number}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
};