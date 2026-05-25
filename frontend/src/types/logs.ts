export interface AuditLogItem {
  id: string;
  user_id: string;
  operator_name: string; 
  action: string;        
  target_id: string | null;
  created_at: string;
}

export interface MaintenanceLogItem {
  id: string;
  table_id: string;
  table_number: string;
  lab_name: string;
  issue_description: string;
  reported_by: string;   
  reporter_name: string; 
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  created_at: string;
}