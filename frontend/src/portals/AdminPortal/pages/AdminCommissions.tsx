import { useApi } from '../../../hooks/useApi';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';

export const AdminCommissions = () => {
  const { data, loading, error, refetch } = useApi<any>('/admin/commissions');

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading commissions...</div>;
  if (error) return (
    <div className="p-8 space-y-3">
      <p className="text-red-600">{error}</p>
      <button onClick={refetch} className="border rounded-lg px-4 py-2 text-sm">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Commissions</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Total Earned</span>
            <FiDollarSign className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">R {(data?.totalEarned ?? 0).toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">This Month</span>
            <FiTrendingUp className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">R {(data?.thisMonth ?? 0).toLocaleString()}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Entries</span>
            <FiDollarSign className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{data?.count ?? 0}</div>
        </div>
      </div>

      {/* Monthly trend chart */}
      {data?.monthlyData?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-medium text-gray-800 mb-4">Monthly Commission Trend</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `R${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => `R${v.toLocaleString()}`} />
                <Bar dataKey="value" fill="#d92820" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent entries */}
      {data?.recent?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-800">Recent Entries</h2>
          </div>
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-700">Month</th>
                <th className="px-6 py-3 font-medium text-gray-700">Type</th>
                <th className="px-6 py-3 font-medium text-gray-700">Amount</th>
                <th className="px-6 py-3 font-medium text-gray-700 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recent.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{c.month}</td>
                  <td className="px-6 py-4 capitalize">{c.type.replace('_', ' ')}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">R {c.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
