import { useApi } from '../../../hooks/useApi';
import { ClipLoader } from 'react-spinners';
import { CompanyLogo } from '../../../components/CompanyLogo';

export const AdminPolicies = () => {
  const { data: policies, loading } = useApi<any[]>('/policies');
  
  if (loading) return (
    <div className="p-12 flex justify-center items-center h-full">
      <ClipLoader color="#ef4444" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Branch Policies</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium">Policy Details</th>
              <th className="px-6 py-4 font-medium">Provider</th>
              <th className="px-6 py-4 font-medium">Premium</th>
              <th className="px-6 py-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {policies?.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{p.policyNumber}</div>
                  <div className="text-xs text-gray-500">{p.type}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <CompanyLogo name={p.provider} domain={p.providerDomain} size={32} />
                    <span className="font-medium text-gray-900">{p.provider}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">R {p.premium.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
