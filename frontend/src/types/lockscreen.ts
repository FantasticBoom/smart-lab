export interface UnlockPayload {
  client_id: string; 
  bypass_pin: string;
}

export interface LockScreenState {
  is_locked: boolean;
  client_id: string;
  computer_name: string;
  table_number: string;
}