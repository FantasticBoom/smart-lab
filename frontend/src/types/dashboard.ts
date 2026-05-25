export interface LabStats {
  online_agents: number;
  total_items: number;
  active_users: number;
}

export interface AgentClientInfo {
  client_id: string;      
  computer_name: string;
  table_number: string;
  status: 'ONLINE' | 'OFFLINE';
  is_locked: boolean;
}