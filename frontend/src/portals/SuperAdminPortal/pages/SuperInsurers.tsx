import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { CompanyLogo } from '../../../components/CompanyLogo';

export const SuperInsurers = () => {
  const { data: insurers, loading, error, refetch } = useApi<any[]>('/insurers');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', domain: '', category: 'short-term', contactEmail: '' });

  const categoryColors: Record<string, string> = {
    'life': 'bg-blue-100 text-blue-700',
    'short-term': 'bg-green-100 text-green-700',
    'employee-benefits': 'bg-purple-100 text-purple-700',
    'health': 'bg-orange-100 text-orange-700',
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/insurers', { method: 'POST', body: JSON.stringify(form) });
      toast.success(`${form.name} added to platform`);
      setShowForm(false);
      setForm({ name: '', domain: '', category: 'short-term', contactEmail: '' });
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add insurer');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (insurer: any) => {
    const newStatus = insurer.status === 'active' ? 'suspended' : 'active';
    try {
      await apiRequest(`/insurers/${insurer.id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      toast.success(`${insurer.name} ${newStatus}`);
      refetch();
    } catch {
      toast.error('Failed to update insurer');
    }
  };

  const remove = async (insurer: any) => {
    if (!confirm(`Remove ${insurer.name}? This will fail if policies exist.`)) return;
    try {
      await apiRequest(`/insurers/${insurer.id}`, { method: 'DELETE' });
      toast.success(`${insurer.name} removed`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Cannot remove insurer');
    }
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading insurers...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-normal text-gray-800">Approved Insurers</h1>
        <button onClick={() => setShowForm(v => !v)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
          <FiPlus /> Add Insurer
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-medium text-gray-800">Add New Insurer</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Insurer Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mutual & Federal" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Website Domain</label>
              <input value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} placeholder="e.g. mutualfederal.co.za" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="short-term">Short-term</option>
                <option value="life">Life</option>
                <option value="health">Health</option>
                <option value="employee-benefits">Employee Benefits</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contact Email</label>
              <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="brokers@insurer.co.za" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{saving ? 'Adding...' : 'Add Insurer'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {(insurers ?? []).map((ins: any) => (
          <div key={ins.id} className={`bg-white border rounded-xl p-5 flex items-center justify-between transition-all ${ins.status === 'suspended' ? 'border-red-200 bg-red-50/30 opacity-70' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex items-center gap-4">
              <CompanyLogo name={ins.name} domain={ins.domain} size={40} />
              <div>
                <div className="font-medium text-gray-900">{ins.name}</div>
                <div className="text-sm text-gray-500">{ins.contactEmail || ins.domain || 'No contact'}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[ins.category] ?? 'bg-gray-100 text-gray-600'}`}>{ins.category}</span>
              <span className="text-sm text-gray-500">{ins.policyCount ?? 0} policies</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ins.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{ins.status}</span>
              <button
                onClick={() => toggleStatus(ins)}
                className="text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg px-3 py-1 hover:border-red-300"
              >
                {ins.status === 'active' ? 'Suspend' : 'Reinstate'}
              </button>
              <button onClick={() => remove(ins)} className="text-gray-400 hover:text-red-600 p-1" title="Remove insurer">
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
