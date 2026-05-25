import React, { useState, useEffect } from 'react';
import { Grid } from '../components/ui/Grid';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { apiClient } from '../services/apiClient';
import { websocketService } from '../services/websocketService';
import type { LabStats, AgentClientInfo } from '../types/dashboard';
import { Monitor, Users, Database, Lock, Unlock, ShieldAlert, Cpu } from 'lucide-react';

export const Dashboard: React.FC = () => {
  // State untuk data statis kartu statistik ringkasan
  const [stats, setStats] = useState<LabStats>({ online_agents: 0, total_items: 0, active_users: 0 });
  
  // State untuk daftar komputer meja lab yang diperbarui secara real-time via WS
  const [agents, setAgents] = useState<AgentClientInfo[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  // State untuk sistem Dialog Modal Konfirmasi Tindakan Massal / Individu
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'LOCK_ALL' | 'UNLOCK_ALL' | 'SINGLE_LOCK' | 'SINGLE_UNLOCK';
    targetClientId: string | null;
    targetComputerName?: string;
  }>({ isOpen: false, type: 'LOCK_ALL', targetClientId: null });

  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // 1. Ambil Ringkasan Statistik via REST API saat halaman pertama kali dibuka
  useEffect(() => {
    const fetchInitialStats = async () => {
      try {
        const response = await apiClient.get<LabStats>('/api/v1/logs/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Gagal mengambil data statistik awal:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchInitialStats();
  }, []);

  // 2. Hubungkan Jaringan WebSocket Client untuk Monitoring Real-Time Grid Meja
  useEffect(() => {
    // Sambungkan socket global
    websocketService.connect();

    // Berlangganan data masuk dari server WebSocket FastAPI
    const unsubscribe = websocketService.subscribe((message: any) => {
      // Struktur pesan diasumsikan berupa list data status agen terbaru atau pembaruan statistik
      if (message.type === 'AGENT_LIST_UPDATE' && Array.isArray(message.data)) {
        setAgents(message.data);
      }
      if (message.type === 'STATS_REALTIME') {
        setStats(message.data);
      }
    });

    // Otomatis putuskan langganan socket saat operator meninggalkan halaman dasbor (Daur Hidup Unmount)
    return () => {
      unsubscribe();
    };
  }, []);

  // Handler Pemicu Pembukaan Kotak Dialog Modal Konfirmasi
  const triggerModal = (type: typeof modalConfig.type, clientId: string | null = null, computerName?: string) => {
    setActionError(null);
    setModalConfig({ isOpen: true, type, targetClientId: clientId, targetComputerName: computerName });
  };

  // 3. Eksekusi Perintah Nyata Menembak API Backend & Disiarkan Langsung ke Agent Klien Windows
  const handleConfirmAction = async () => {
    setIsExecutingAction(true);
    setActionError(null);
    try {
      if (modalConfig.type === 'LOCK_ALL') {
        await apiClient.post('/api/v1/websocket/broadcast', { action: 'LOCK' });
      } else if (modalConfig.type === 'UNLOCK_ALL') {
        await apiClient.post('/api/v1/websocket/broadcast', { action: 'UNLOCK' });
      } else if (modalConfig.type === 'SINGLE_LOCK' && modalConfig.targetClientId) {
        await apiClient.post(`/api/v1/command/lock/${modalConfig.targetClientId}`);
      } else if (modalConfig.type === 'SINGLE_UNLOCK' && modalConfig.targetClientId) {
        await apiClient.post(`/api/v1/command/unlock/${modalConfig.targetClientId}`);
      }

      // Tutup modal jika sukses dieksekusi
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    } catch (error: any) {
      setActionError(error.response?.data?.detail || 'Gagal mengirimkan perintah kontrol ke agen komputer.');
    } finally {
      setIsExecutingAction(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      
      {/* BAGIAN ATAS: Header Aksi Masal sesuai rancangan Kontrol Dasbor */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-wide">DASHBOARD MONITORING LAB</h2>
          <p className="text-xs text-gray-400 font-medium">Pemantauan daya & kendali layar workstation laboratorium UIGM</p>
        </div>
        
        {/* Tombol Aksi Kendali Massal Seluruh Laboratorium */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="danger" 
            className="flex-1 sm:flex-initial text-xs font-bold gap-1.5 px-3.5 py-2"
            onClick={() => triggerModal('LOCK_ALL')}
          >
            <Lock className="h-3.5 w-3.5" /> Kunci Massal
          </Button>
          <Button 
            variant="success" 
            className="flex-1 sm:flex-initial text-xs font-bold gap-1.5 px-3.5 py-2"
            onClick={() => triggerModal('UNLOCK_ALL')}
          >
            <Unlock className="h-3.5 w-3.5" /> Buka Massal
          </Button>
        </div>
      </div>

      {/* KARTU STATISTIK: Grid 3 Kolom Responsif Fluid untuk Ringkasan Data */}
      <Grid columns={3}>
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl border border-green-100 shadow-xs">
            <Monitor className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Workstation Aktif</span>
            <span className="text-xl font-black text-gray-800">{isLoadingStats ? '...' : stats.online_agents} PC</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-xs">
            <Database className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Aset Inventaris</span>
            <span className="text-xl font-black text-gray-800">{isLoadingStats ? '...' : stats.total_items} Unit</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 shadow-xs">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sesi User Aktif</span>
            <span className="text-xl font-black text-gray-800">{isLoadingStats ? '...' : stats.active_users} Akun</span>
          </div>
        </Card>
      </Grid>

      {/* DENAH LAYOUT UTAMA MEJA LAB: Flexible Smartphone-Ready Matrix Panel */}
      <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-3">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="h-4 w-4 text-blue-600" /> Tata Letak Meja Komputer Lab
          </h3>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Online</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Offline</span>
          </div>
        </div>

        {/* FAIL-SAFE RESPONSIVE: Mengunci Rasio Meja dengan horizontal scroll jika dibuka di smartphone */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[760px] p-1">
            
            {/* Grid Render Menggunakan Komponen Atomik Grid Bawaan Tahap 2 */}
            <Grid columns={4} className="gap-4">
              {agents.length === 0 ? (
                <div className="col-span-4 p-12 text-center text-sm font-medium text-gray-400">
                  Menunggu koneksi dari agen komputer lab (`AgentUIGM` Win32)...
                </div>
              ) : (
                agents.map((pc) => (
                  <Card key={pc.client_id} className="border border-gray-100 hover:border-blue-200 transition-all shadow-xs flex flex-col justify-between h-32 p-4">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase">Meja {pc.table_number}</span>
                        <span className="text-sm font-black text-gray-800 truncate max-w-[120px]" title={pc.computer_name}>
                          {pc.computer_name}
                        </span>
                      </div>
                      
                      {/* Badge Indikator Status Daya Real-Time */}
                      <Badge variant={pc.status === 'ONLINE' ? 'success' : 'danger'}>
                        {pc.status}
                      </Badge>
                    </div>

                    {/* Sisi Bawah Card: Tombol Kendali Mandiri Per PC Meja */}
                    <div className="w-full flex items-center justify-between border-t border-gray-50 pt-2 mt-2">
                      <span className="text-[10px] font-mono text-gray-400 truncate max-w-[100px]">{pc.client_id}</span>
                      
                      {pc.status === 'ONLINE' && (
                        <button
                          onClick={() => triggerModal(pc.is_locked ? 'SINGLE_UNLOCK' : 'SINGLE_LOCK', pc.client_id, pc.computer_name)}
                          className={`p-1.5 rounded-lg transition-all border ${
                            pc.is_locked 
                              ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' 
                              : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                          }`}
                          title={pc.is_locked ? "Buka Kunci Workstation" : "Kunci Layar Workstation"}
                        >
                          {pc.is_locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </Grid>

          </div>
        </div>
      </div>

      {/* DIALOG MODAL KONFIRMASI: Memanggil Komponen Dialog Terpisah Hasil Tahap 2 */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title="Konfirmasi Perintah Operasional Security"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
              disabled={isExecutingAction}
              className="px-4 py-1.5 text-xs font-bold"
            >
              Batalkan
            </Button>
            <Button 
              variant={modalConfig.type.includes('LOCK') ? 'danger' : 'success'}
              onClick={handleConfirmAction}
              isLoading={isExecutingAction}
              className="px-4 py-1.5 text-xs font-bold"
            >
              Ya, Eksekusi
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {actionError && (
            <div className="p-2.5 bg-red-50 border border-red-100 text-red-700 font-semibold text-xs rounded-lg flex items-center gap-2 animate-pulse">
              <ShieldAlert className="h-4 w-4" /> {actionError}
            </div>
          )}
          <p className="text-sm text-gray-600 font-medium">
            {modalConfig.type === 'LOCK_ALL' && "Apakah Anda yakin ingin MENGUNCI MASAL seluruh layar komputer klien yang sedang aktif di laboratorium?"}
            {modalConfig.type === 'UNLOCK_ALL' && "Apakah Anda yakin ingin MEMBUKA MASAL seluruh proteksi lockscreen komputer klien di laboratorium?"}
            {modalConfig.type === 'SINGLE_LOCK' && `Apakah Anda yakin ingin mengunci layar workstation secara individual pada PC ${modalConfig.targetComputerName}?`}
            {modalConfig.type === 'SINGLE_UNLOCK' && `Apakah Anda yakin ingin melepas proteksi gembok lockscreen secara individual pada PC ${modalConfig.targetComputerName}?`}
          </p>
          <span className="text-[11px] text-gray-400 font-bold tracking-wide block bg-gray-50 p-2 rounded-md border border-gray-100">
            Catatan Protokol: Perintah ini akan diteruskan secara instan melalui sistem WebSocket dan dicatat dalam manifes database Log Audit Keamanan.
          </span>
        </div>
      </Modal>

    </div>
  );
};