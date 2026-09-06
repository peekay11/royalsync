import type { Policy, Goal, Claim, Reminder, UserProfile, AssignedAdvisor, User, AppNotification } from '../types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://royalsync-api-production.pasekamabitsela22.workers.dev/api';

let authToken: string | null = null;
let tokenLoaded = false;
const TOKEN_KEY = 'royalsync_token';

const readStoredToken = async () => {
  if (Platform.OS === 'web') return globalThis.localStorage?.getItem(TOKEN_KEY) || null;
  return SecureStore.getItemAsync(TOKEN_KEY);
};

const writeStoredToken = async (token: string | null) => {
  if (Platform.OS === 'web') {
    if (token) globalThis.localStorage?.setItem(TOKEN_KEY, token);
    else globalThis.localStorage?.removeItem(TOKEN_KEY);
    return;
  }
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export const setAuthToken = async (token: string | null) => {
  authToken = token;
  tokenLoaded = true;
  await writeStoredToken(token);
};

const getHeaders = async () => {
  if (!tokenLoaded) {
    authToken = await readStoredToken();
    tokenLoaded = true;
  }
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

const unwrap = <T,>(payload: { data?: T } | T): T => (payload && typeof payload === 'object' && 'data' in payload ? payload.data as T : payload as T);

export const ApiService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = unwrap<{ token: string; user: User }>(await res.json());
      await setAuthToken(data.token);
      return data;
    } catch (e) {
      throw e;
    }
  },

  async sendOtp(idNumber: string): Promise<{ message: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ idNumber }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to send OTP');
      return data;
    } catch (error) {
      throw error;
    }
  },

  async loginWithId(params: {
    idType: 'rsa_id' | 'passport';
    idNumber: string;
    authMethod: 'pin' | 'otp';
    code: string;
  }): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login-id`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error('Authentication failed');
      const data = unwrap<{ token: string; user: User }>(await res.json());
      await setAuthToken(data.token);
      return data;
    } catch (e) {
      throw e;
    }
  },

  async sendLoginOtp(idNumber: string): Promise<{ success: boolean; maskedPhone: string; maskedEmail: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ idNumber }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      return unwrap(await res.json());
    } catch (e) {
      throw e;
    }
  },

  async register(form: any): Promise<{ token: string; user: User }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = unwrap<{ token: string; user: User }>(await res.json());
      await setAuthToken(data.token);
      return data;
    } catch (e) {
      throw e;
    }
  },

  async getUserProfile(): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, { headers: await getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch profile');
      return unwrap(await res.json());
    } catch (e) {
      throw e;
    }
  },

  async updateUserProfile(payload: Record<string, any>): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile');
      }
      return unwrap(await res.json());
    } catch (e) {
      throw e;
    }
  },

  async getPolicies(category?: string): Promise<Policy[]> {
    try {
      const url = category && category !== 'All'
        ? `${API_BASE_URL}/policies?category=${encodeURIComponent(category)}`
        : `${API_BASE_URL}/policies`;
      const res = await fetch(url, { headers: await getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch policies');
      const data = unwrap<Policy[]>(await res.json());
      return data;
    } catch (e) {
      throw e;
    }
  },

  async getGoals(): Promise<{ goals: Goal[]; summary: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/goals`, { headers: await getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch goals');
      return unwrap(await res.json());
    } catch (e) {
      throw e;
    }
  },

  async getClaims(): Promise<Claim[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/claims`, { headers: await getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch claims');
      const data = unwrap<Claim[]>(await res.json());
      return data;
    } catch (e) {
      throw e;
    }
  },

  async submitClaim(claimData: Partial<Claim>): Promise<Claim> {
    try {
      const res = await fetch(`${API_BASE_URL}/claims`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(claimData),
      });
      if (!res.ok) throw new Error('Failed to submit claim');
      return unwrap(await res.json());
    } catch (e) {
      throw e;
    }
  },

  async getReminders(): Promise<Reminder[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/reminders`, { headers: await getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch reminders');
      return unwrap(await res.json());
    } catch (e) {
      throw e;
    }
  },

  async getAdvisorProfile(): Promise<AssignedAdvisor> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/advisor`, { headers: await getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch advisor');
      return unwrap(await res.json());
    } catch (e) {
      throw e;
    }
  },

  async getNotifications(): Promise<AppNotification[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, { headers: await getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = unwrap<any[]>(await res.json());
      return (data || []).map((item, idx) => ({
        id: item.id || `notif_${idx}`,
        title: item.title || item.name || 'Admin Update',
        message: item.message || item.body || item.text || 'New alert from Royal Square administrator',
        timestamp: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
        category: (item.category || 'system') as any,
        read: Boolean(item.read),
        badgeText: item.priority ? `${item.priority.toUpperCase()} ALERT` : 'FROM ADMIN',
        actionText: item.actionText || 'View Details',
        actionScreen: item.actionScreen || undefined,
      }));
    } catch {
      return [];
    }
  },

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: await getHeaders(),
      });
    } catch {}
  },

  async getServiceRequests(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/service-requests`, { headers: await getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch service requests');
      return unwrap(await res.json());
    } catch {
      return [];
    }
  },

  async createServiceRequest(payload: any): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/service-requests`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to submit service request');
      }
      return unwrap(await res.json());
    } catch (e) {
      throw e;
    }
  },

  async getFinancialStatement(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/service-requests/financial-statement`, { headers: await getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch financial statement');
      return unwrap(await res.json());
    } catch {
      return null;
    }
  },

  async updatePrivacyFramework(payload: { framework: 'POPIA' | 'GDPR' | 'HYBRID_EU'; crossBorderTransferOptIn?: boolean; euCountry?: string }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/user/privacy-framework`, {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update privacy policy');
      }
      return await res.json();
    } catch (e) {
      throw e;
    }
  },

  async getLegalFrameworks(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/legal/frameworks`, { headers: await getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch legal frameworks');
      return unwrap(await res.json());
    } catch {
      return null;
    }
  },
};

export const api = ApiService;
