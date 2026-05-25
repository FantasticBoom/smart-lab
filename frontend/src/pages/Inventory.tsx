// src/pages/Inventory.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Grid } from '../components/ui/Grid';
import { apiClient } from '../services/apiClient';
import type { Laboratory } from '../types/inventory';
import { Monitor, ArrowRight, MapPin } from 'lucide-react';

interface InventoryProps {
  onSelectLab: (labId: string, labName: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ onSelectLab }) => {
  const [labs, setLabs] = useState<Laboratory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await apiClient.get<Laboratory[]>('/api/v1/inventory/labs');
        setLabs(response.data);
      } catch (error) {
        console.error('Gagal mengambil daftar laboratorium:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabs();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-black text-gray-900 tracking-wide">INVENTARIS LABORATORIUM</h2>
        <p className="text-xs text-gray-400 font-medium">Pilih ruangan laboratorium untuk melihat manajemen denah dan spesifikasi hardware</p>
      </div>

      {isLoading ? (
        <div className="text-center p-12 text-sm text-gray-400 font-medium">Memuat manifes laboratorium komputer...</div>
      ) : (
        <Grid columns={3}>
          {labs.map((lab) => (
            <Card key={lab.id} className="hover:shadow-md border border-gray-100 flex flex-col justify-between h-44 group transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-blue-50 text-[var(--color-uigm-blue,#1e3a8a)] rounded-xl border border-blue-100">
                    <Monitor className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-black text-[var(--color-uigm-orange,#f97316)] bg-orange-50 px-2 py-0.5 rounded border border-orange-100 tracking-wider">
                    {lab.code}
                  </span>
                </div>
                
                <h3 className="text-base font-black text-gray-800 tracking-wide group-hover:text-[var(--color-uigm-blue,#1e3a8a)] transition-colors">
                  {lab.name}
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mt-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{lab.location}</span>
                </div>
              </div>

              <div className="w-full border-t border-gray-50 pt-3 mt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400">{lab.total_tables} Meja Workstation</span>
                <button
                  onClick={() => onSelectLab(lab.id, lab.name)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-uigm-blue,#1e3a8a)] hover:gap-2 transition-all cursor-pointer focus:outline-none"
                >
                  Buka Denah <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </Grid>
      )}
    </div>
  );
};