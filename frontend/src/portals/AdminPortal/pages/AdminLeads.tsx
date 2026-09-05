import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { FiPlus } from 'react-icons/fi';
import { toast } from 'sonner';

export const AdminLeads = () => {
  const columns = ['New', 'Contacted', 'Qualified', 'Quoted', 'Won', 'Lost'];
  const { data: leads, loading } = useApi<any[]>('/crm/leads');

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiRequest(`/crm/leads/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
      toast.success('Lead status updated');
    } catch {
      toast.error('Failed to update lead');
    }
  };
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Leads Pipeline</h1>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
          <FiPlus /> Add Lead
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col} className="bg-gray-50 border border-gray-200 rounded-xl w-72 flex-shrink-0 flex flex-col">
            <div className="p-3 border-b border-gray-200 font-medium text-gray-700">{col}</div>
            <div className="p-3 flex-1 space-y-3">
              {loading && col === 'New' && <p className="text-sm text-gray-500">Loading leads...</p>}
              {leads?.filter(lead => lead.status === col).map(lead => (
                <div key={lead.id} className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm hover:border-red-300">
                  <div className="font-medium text-gray-900">{lead.name || `${lead.firstName || ''} ${lead.lastName || ''}`}</div>
                  <div className="text-xs text-gray-500 mt-1">{lead.interest || 'Lead'}</div>
                  <select value={lead.status} onChange={event => updateStatus(lead.id, event.target.value)} className="mt-2 w-full border border-gray-200 rounded p-1 text-xs">
                    {columns.map(option => <option key={option}>{option}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
