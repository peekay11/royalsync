import { useApi } from '../../../hooks/useApi';

export const AdminClaims = () => {
  const { data: claims, loading } = useApi<any[]>('/claims');
  if (loading) return <div className="p-8 text-gray-500">Loading claims...</div>;

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
                  <button className="text-red-600 font-medium hover:underline">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
