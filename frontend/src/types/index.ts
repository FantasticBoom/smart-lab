export type ComponentVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

export interface UserData {
  id: string;
  username: string;
  role: 'admin' | 'operator';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_data: UserData;
}