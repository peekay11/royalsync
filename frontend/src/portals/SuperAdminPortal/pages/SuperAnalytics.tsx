import { useApi } from '../../../hooks/useApi';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#d92820', '#1d4ed8', '#15803d', '#b45309', '#7c3aed', '#0891b2'];

export const SuperAnalytics = () => {
  const { data: reports, loading, error } = useApi<any>('/reports/summary');
  const { data: commissions } = useApi<any>('/admin/commissions');

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading analytics...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-normal text-gray-800">Platform Analytics</h1>

      {/* Commission trend */}
      {commissions?.monthlyData?.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-medium text-gray-800 mb-1">Monthly Commission Revenue (ZAR)</h2>
          <p className="text-sm text-gray-500 mb-4">Total earned: R{(commissions.totalEarned ?? 0).toLocaleString()}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={commissions.monthlyData}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads by status */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-medium text-gray-800 mb-4">Leads by Status</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={reports?.leadsByStatus ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {(reports?.leadsByStatus ?? []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Claims by status */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-medium text-gray-800 mb-4">Claims by Status</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.claimsByStatus ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applications by status */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-medium text-gray-800 mb-4">Applications by Stage</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.applicationsByStatus ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Policies by status */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-medium text-gray-800 mb-4">Policies by Status</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.policiesByStatus ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#b45309" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
