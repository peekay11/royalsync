import { useApi } from '../../../hooks/useApi';

export const AdminApplications = () => {
  const { data: apps, loading } = useApi<any[]>('/sales/applications');

  if (loading) return <div className="p-8 text-gray-500">Loading applications...</div>;

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
                  <button className="text-red-600 font-medium hover:underline">Continue</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
