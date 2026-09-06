const DEFAULT_ONLINE_API = 'https://royalsync.onrender.com/api';

const rawApiUrl = import.meta.env.VITE_API_BASE_URL;
const formatApiUrl = (url?: string): string => {
  if (!url) return DEFAULT_ONLINE_API;
  let formatted = url.trim();
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }
  if (!formatted.endsWith('/api') && !formatted.includes('/api/')) {
    formatted = formatted.replace(/\/+$/, '') + '/api';
  }
  return formatted;
};

const CONFIGURED_API = formatApiUrl(rawApiUrl);
let activeApiBase = CONFIGURED_API;

export const getActiveApiBase = () => activeApiBase;

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const fetchWithFallback = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return fetch(`${activeApiBase}${normalizedEndpoint}`, options);
};

export const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('royalsync_token');
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetchWithFallback(endpoint, { ...options, headers });
  const body = await response.json() as ApiEnvelope<T>;
  if (!response.ok || !body.success) throw new Error(body.error || 'Request failed');
  return body.data;
};

export const scanDocument = async (file: File, expectedCategory: string = 'General', expiryDate?: string) => {
  const token = localStorage.getItem('royalsync_token');
  const form = new FormData();
  form.append('file', file);
  form.append('expectedCategory', expectedCategory);
  if (expiryDate) form.append('expiryDate', expiryDate);
  const response = await fetchWithFallback('/documents/scan', {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const body = (await response.json()) as ApiEnvelope<any>;
  if (!response.ok || !body.success) throw new Error(body.error || 'Document scan failed');
  return body.data;
};

export const uploadDocument = async (file: File, category: string = 'General', expiryDate?: string, scanReport?: any) => {
  const token = localStorage.getItem('royalsync_token');
  const form = new FormData();
  form.append('file', file);
  form.append('category', category);
  if (expiryDate) form.append('expiryDate', expiryDate);
  if (scanReport) form.append('scanReport', JSON.stringify(scanReport));
  const response = await fetchWithFallback('/documents/upload', {
    method: 'POST',
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  const body = await response.json() as ApiEnvelope<unknown>;
  if (!response.ok || !body.success) throw new Error(body.error || 'Upload failed');
  return body.data;
};

export const deleteDocument = async (id: string) => {
  return apiRequest(`/documents/${id}`, { method: 'DELETE' });
};

export const downloadDocument = async (id: string, filename: string) => {
  const token = localStorage.getItem('royalsync_token');
  const response = await fetchWithFallback(`/documents/${id}/download`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
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

export const checkId = (idNumber: string) => apiRequest<{ exists: boolean; maskedName?: string; message: string }>('/auth/check-id', {
  method: 'POST',
  body: JSON.stringify({ idNumber })
});