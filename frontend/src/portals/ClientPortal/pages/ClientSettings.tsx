import { useEffect, useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';

export const ClientSettings = () => {
  const { data, loading, error, refetch } = useApi<any[]>('/settings');
  const [preferences, setPreferences] = useState({ policyUpdates: true, marketing: false });
  useEffect(() => { const saved = data?.[0]; if (saved) setPreferences({ policyUpdates: saved.policyUpdates !== false, marketing: saved.marketing === true }); }, [data]);
  const save = async () => { try { if (data?.[0]?.id) await apiRequest(`/settings/${data[0].id}`, { method: 'PUT', body: JSON.stringify(preferences) }); else await apiRequest('/settings', { method: 'POST', body: JSON.stringify(preferences) }); toast.success('Settings saved'); refetch(); } catch { toast.error('Could not save settings'); } };
  if (loading) return <div className="p-8 text-gray-500">Loading settings...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-red-600">{error}</p><button onClick={refetch} className="border rounded-lg px-4 py-2">Retry</button></div>;
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-normal text-gray-800">Settings</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Policy Updates (Email & WhatsApp)</span>
            <input type="checkbox" checked={preferences.policyUpdates} onChange={event => setPreferences({ ...preferences, policyUpdates: event.target.checked })} className="text-red-600 rounded border-gray-300 focus:ring-red-500" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Marketing & Offers</span>
            <input type="checkbox" checked={preferences.marketing} onChange={event => setPreferences({ ...preferences, marketing: event.target.checked })} className="text-red-600 rounded border-gray-300 focus:ring-red-500" />
          </label>
        </div>
      </div>
      <button onClick={save} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">Save notification settings</button>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Security</h2>
        <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors mr-3">Change Password</button>
        <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Enable MFA</button>
      </div>
    </div>
  );
};
