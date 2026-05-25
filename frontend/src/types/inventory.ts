export interface Laboratory {
  id: string;
  name: string;
  code: string;
  location: string;
  total_tables: number;
}

export interface LabTable {
  id: string;
  lab_id: string;
  table_number: string;
  client_id: string | null;
}

export interface HardwareItem {
  id: string;
  table_id: string;
  device_type: string; 
  brand: string;
  model: string;
  specification: string;
  serial_number: string;
}