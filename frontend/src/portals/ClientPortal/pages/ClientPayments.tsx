import { useApi } from '../../../hooks/useApi';

export const ClientPayments = () => {
  const { data: payments, loading } = useApi<any[]>('/finance/payments');

  if (loading) return <div className="p-8 text-gray-500">Loading payments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Payments & Mandates</h1>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
          Change Bank Details
        </button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <h3 className="text-red-800 font-medium mb-1">Failed Collection Notice</h3>
        <p className="text-red-600 text-sm mb-3">Your last premium collection failed. Please update your details or retry.</p>
        <button className="bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-50">Retry Now</button>
      </div>

      <h2 className="text-lg font-medium text-gray-800">Payment History</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments?.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{p.date}</td>
                <td className="px-6 py-4">R {p.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'collected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
