import { useApi } from '../../../hooks/useApi';
import { FiPlus } from 'react-icons/fi';

export const ClientClaims = () => {
  const { data: claims, loading } = useApi<any[]>('/claims');

  if (loading) return <div className="p-8 text-gray-500">Loading claims...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">My Claims</h1>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
          <FiPlus /> Report a Claim
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {claims?.map(claim => (
              <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{claim.reference}</td>
                <td className="px-6 py-4">{claim.incidentDate}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium capitalize">
                    {claim.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-600 font-medium hover:underline">View Claim</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
