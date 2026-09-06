import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { FiPlus, FiX } from 'react-icons/fi';
import { toast } from 'sonner';

const COLUMNS = ['New', 'Contacted', 'Qualified', 'Quoted', 'Won', 'Lost'];

const colColors: Record<string, string> = {
  New: 'bg-gray-100 text-gray-600',
  Contacted: 'bg-blue-100 text-blue-700',
  Qualified: 'bg-purple-100 text-purple-700',
  Quoted: 'bg-yellow-100 text-yellow-700',
  Won: 'bg-green-100 text-green-700',
  Lost: 'bg-red-100 text-red-700',
};

export const AdminLeads = () => {
  const { data: leads, loading, refetch } = useApi<any[]>('/crm/leads');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', mobile: '', interest: 'Life Insurance' });

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiRequest(`/crm/leads/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      toast.success('Lead moved');
      refetch();
    } catch {
      toast.error('Failed to update lead');
    }
  };

  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/crm/leads', { method: 'POST', body: JSON.stringify(form) });
      toast.success('Lead added');
      setShowForm(false);
      setForm({ firstName: '', lastName: '', email: '', mobile: '', interest: 'Life Insurance' });
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Leads Pipeline</h1>
        <button onClick={() => setShowForm(v => !v)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
          {showForm ? <FiX /> : <FiPlus />} {showForm ? 'Cancel' : 'Add Lead'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createLead} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h3 className="font-medium text-gray-800">New Lead</h3>
          <div className="grid grid-cols-2 gap-3">
            <input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name *" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name *" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email (optional)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input type="tel" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="Mobile (optional)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <select value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm col-span-2">
              {['Life Insurance', 'Car Insurance', 'Home Contents', 'Home Owners', 'Disability Cover', 'Income Protection', 'Business Insurance', 'Employee Benefits', 'Retirement Annuity', 'General Insurance'].map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{saving ? 'Adding...' : 'Add Lead'}</button>
        </form>
      )}

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colLeads = (leads ?? []).filter(l => l.status === col);
          return (
            <div key={col} className="bg-gray-50 border border-gray-200 rounded-xl w-64 flex-shrink-0 flex flex-col">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <span className="font-medium text-gray-700 text-sm">{col}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colColors[col]}`}>{colLeads.length}</span>
              </div>
              <div className="p-3 flex-1 space-y-2 overflow-y-auto max-h-[60vh]">
                {loading && col === 'New' && <p className="text-xs text-gray-400">Loading...</p>}
                {colLeads.map(lead => (
                  <div key={lead.id} className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm hover:border-red-300 transition-colors">
                    <div className="font-medium text-gray-900 text-sm">{lead.firstName} {lead.lastName}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{lead.interest}</div>
                    {lead.mobile && <div className="text-xs text-gray-400 mt-0.5">{lead.mobile}</div>}
                    <select
                      value={lead.status}
                      onChange={e => updateStatus(lead.id, e.target.value)}
                      className="mt-2 w-full border border-gray-200 rounded px-1.5 py-1 text-xs bg-gray-50"
                    >
                      {COLUMNS.map(option => <option key={option}>{option}</option>)}
                    </select>
                  </div>
                ))}
                {!loading && colLeads.length === 0 && (
                  <div className="text-xs text-gray-400 text-center py-4">No leads</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
