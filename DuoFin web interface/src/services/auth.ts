import { api } from '../lib/api';
import type { LoginPayload, LoginResponse } from '../types/auth';

const TOKEN_KEY = 'duofin_token';
const USER_KEY = 'duofin_user';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const data = await api<LoginResponse>('/api/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!data.token || !data.user) {
    throw new Error(data.message || 'Resposta de login inválida.');
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}
