const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('royalsync_token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const body = await response.json() as ApiEnvelope<T>;
  if (!response.ok || !body.success) throw new Error(body.error || 'Request failed');
  return body.data;
};

export const login = (email: string, password: string) => apiRequest<{ token: string; user: { role: string; email: string } }>('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});