const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://royalsync-api.pasekamabitsela22.workers.dev/api';

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

export const uploadDocument = async (file: File, category: string = 'General') => {
  const token = localStorage.getItem('royalsync_token');
  const form = new FormData();
  form.append('file', file);
  form.append('category', category);
  const response = await fetch(`${API_BASE}/documents/upload`, { method: 'POST', body: form, headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  const body = await response.json() as ApiEnvelope<unknown>;
  if (!response.ok || !body.success) throw new Error(body.error || 'Upload failed');
  return body.data;
};

export const deleteDocument = async (id: string) => {
  return apiRequest(`/documents/${id}`, { method: 'DELETE' });
};

export const downloadDocument = async (id: string, filename: string) => {
  const token = localStorage.getItem('royalsync_token');
  const response = await fetch(`${API_BASE}/documents/${id}/download`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!response.ok) throw new Error('Download failed');
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const login = (email: string, password: string) => apiRequest<{ token: string; user: { role: string; email: string } }>('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});