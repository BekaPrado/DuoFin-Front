const API_URL = import.meta.env.VITE_API_URL ?? '';

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('duofin_token');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  const data = await response.json() as T & { message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? 'Não foi possível concluir a solicitação.');
  }

  return data;
}
