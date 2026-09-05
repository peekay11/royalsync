import { useApi } from '../../../hooks/useApi';

export const ClientInsurance = () => {
  const { data: policies, loading } = useApi<any[]>('/policies');

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading policies...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">My Insurance</h1>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
          Get New Quote
        </button>
      </div>

      <div className="grid gap-4">
        {policies?.map(policy => (
          <div key={policy.id} className="border border-gray-200 rounded-xl p-6 bg-white flex justify-between items-center hover:shadow-sm transition-shadow">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-medium text-gray-900">{policy.provider}</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium capitalize">{policy.status}</span>
              </div>
              <p className="text-sm text-gray-500">Policy: {policy.policyNumber}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-medium text-gray-900">R {policy.premium}/mo</div>
              <button className="text-red-600 text-sm font-medium mt-1 hover:underline">View Details</button>
            </div>
          </div>
        ))}
        {(!policies || policies.length === 0) && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
            You don't have any active policies yet.
          </div>
        )}
      </div>
    </div>
  );
};
