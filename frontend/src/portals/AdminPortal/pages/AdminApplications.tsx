import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';

export const AdminApplications = () => {
  const { data: apps, loading, error, refetch } = useApi<any[]>('/sales/applications');
  const updateStatus = async (app: any, status: string) => {
    try { await apiRequest(`/sales/applications/${app.id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); toast.success('Application updated'); refetch(); }
    catch { toast.error('Could not update application'); }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading applications...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-red-600">{error}</p><button onClick={refetch} className="border rounded-lg px-4 py-2">Retry</button></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Applications</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Client</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Stage</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {apps?.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{app.client}</td>
                <td className="px-6 py-4">{app.productType}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium capitalize">{app.status.replace(/_/g, ' ')}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select value={app.status || 'draft'} onChange={event => updateStatus(app, event.target.value)} className="border rounded px-2 py-1 text-xs"><option value="draft">Draft</option><option value="ready_to_quote">Ready to quote</option><option value="awaiting_quotes">Awaiting quotes</option><option value="comparing">Comparing</option><option value="client_deciding">Client deciding</option><option value="selected">Selected</option><option value="inception">Inception</option><option value="live">Live</option><option value="abandoned">Abandoned</option></select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
