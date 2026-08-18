export interface AuthUser {
  id: number;
  couple_id: number;
  name: string;
  email: string;
  avatar: string | null;
  is_active: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}
