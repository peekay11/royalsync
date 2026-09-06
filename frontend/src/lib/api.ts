const DEFAULT_ONLINE_API = 'https://royalsync-api-production.pasekamabitsela22.workers.dev/api';
const LOCAL_API_ENDPOINTS = [
  'http://localhost:5000/api',
  'http://127.0.0.1:5000/api',
  'http://localhost:8787/api',
  'http://127.0.0.1:8787/api'
];

const CONFIGURED_API = import.meta.env.VITE_API_BASE_URL || DEFAULT_ONLINE_API;

// Priority list: First try configured API, then local endpoints as fallbacks
const API_CANDIDATES: string[] = [
  CONFIGURED_API,
  ...LOCAL_API_ENDPOINTS.filter(url => url !== CONFIGURED_API)
];

// Cache the active working base URL so subsequent requests do not suffer failover latency
let activeApiBase = CONFIGURED_API;

export const getActiveApiBase = () => activeApiBase;

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

/**
 * Fetch wrapper that automatically switches to localhost APIs if the online API is offline,
 * unreachable, fails DNS/network, or responds with gateway errors (502, 503, 504).
 */
export const fetchWithFallback = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const attemptFetch = async (baseUrl: string): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s fast timeout to prevent long blocking when online is down
    try {
      const response = await fetch(`${baseUrl}${normalizedEndpoint}`, {
        ...options,
        signal: options.signal || controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  // 1. Try the current activeApiBase first
  try {
    const res = await attemptFetch(activeApiBase);
    // If online server returned a 502/503/504 gateway offline response, fail over to localhost
    if (res.status >= 502 && res.status <= 504 && !activeApiBase.includes('localhost') && !activeApiBase.includes('127.0.0.1')) {
      throw new Error(`Online API returned status ${res.status}`);
    }
    return res;
  } catch (initialErr) {
    console.warn(`[RoyalSync API] ${activeApiBase}${normalizedEndpoint} is offline or unreachable. Trying local fallbacks...`);
  }

  // 2. Iterate through fallbacks (localhost / 127.0.0.1)
  const remainingCandidates = API_CANDIDATES.filter(url => url !== activeApiBase);
  let lastError: any = null;

  for (const candidate of remainingCandidates) {
    try {
      const res = await attemptFetch(candidate);
      if (res.status < 500 || candidate.includes('localhost') || candidate.includes('127.0.0.1')) {
        activeApiBase = candidate;
        console.info(`[RoyalSync API] Switched to local API endpoint: ${activeApiBase}`);
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All online and local API endpoints are unreachable');
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