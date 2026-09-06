import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';
import { FiPlus } from 'react-icons/fi';

export const SuperTenants = () => {
  const { data: tenants, loading, error, refetch } = useApi<any[]>('/tenants');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', plan: 'professional' });
  const [showForm, setShowForm] = useState(false);

  const createTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiRequest('/tenants', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Tenant created');
      setShowForm(false);
      setForm({ name: '', slug: '', plan: 'professional' });
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create tenant');
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiRequest(`/tenants/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      toast.success('Tenant updated');
      refetch();
    } catch {
      toast.error('Failed to update tenant');
    }
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading tenants...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-normal text-gray-800">Broker Tenants</h1>
        <button onClick={() => setShowForm(v => !v)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
          <FiPlus /> New Tenant
        </button>
      </div>

      {showForm && (
        <form onSubmit={createTenant} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-medium text-gray-800">Create New Tenant</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tenant Name</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Acacia Financial" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Slug (URL key)</label>
              <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="e.g. acacia-financial" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Plan</label>
              <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{creating ? 'Creating...' : 'Create Tenant'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Tenant</th>
              <th className="px-6 py-3 font-medium">Slug</th>
              <th className="px-6 py-3 font-medium">Plan</th>
              <th className="px-6 py-3 font-medium">Users</th>
              <th className="px-6 py-3 font-medium">Clients</th>
              <th className="px-6 py-3 font-medium">Policies</th>
              <th className="px-6 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(tenants ?? []).map((t: any) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{t.slug}</td>
                <td className="px-6 py-4 capitalize">{t.plan}</td>
                <td className="px-6 py-4">{t.userCount ?? t._count?.users ?? '—'}</td>
                <td className="px-6 py-4">{t.clientCount ?? t._count?.clients ?? '—'}</td>
                <td className="px-6 py-4">{t.policyCount ?? t._count?.policies ?? '—'}</td>
                <td className="px-6 py-4 text-right">
                  <select
                    value={t.status}
                    onChange={e => updateStatus(t.id, e.target.value)}
                    className={`text-xs rounded-full px-3 py-1 border font-medium ${t.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="trial">Trial</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
