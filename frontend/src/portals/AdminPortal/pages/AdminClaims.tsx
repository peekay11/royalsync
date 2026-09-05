import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';

export const AdminClaims = () => {
  const { data: claims, loading, error, refetch } = useApi<any[]>('/claims');
  const updateStatus = async (claim: any, status: string) => {
    try { await apiRequest(`/claims/${claim.id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); toast.success('Claim updated'); refetch(); }
    catch { toast.error('Could not update claim'); }
  };
  if (loading) return <div className="p-8 text-gray-500">Loading claims...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-red-600">{error}</p><button onClick={refetch} className="border rounded-lg px-4 py-2">Retry</button></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Claims Management</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Incident Date</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {claims?.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{c.reference}</td>
                <td className="px-6 py-4">{c.incidentDate}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">{c.status.replace('_', ' ')}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <select value={c.status} onChange={event => updateStatus(c, event.target.value)} className="border rounded px-2 py-1 text-xs"><option>submitted</option><option>acknowledged</option><option>under_assessment</option><option>approved</option><option>rejected</option><option>settled</option><option>closed</option><option>reopened</option></select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
