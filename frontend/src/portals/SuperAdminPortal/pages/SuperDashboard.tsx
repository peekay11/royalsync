import { useApi } from '../../../hooks/useApi';
import { FiGrid, FiUsers, FiShield, FiAlertCircle, FiFileText } from 'react-icons/fi';

const Stat = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32 hover:border-red-200 transition-colors">
    <div className="flex justify-between items-start">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="text-gray-400 text-xl">{icon}</span>
    </div>
    <div className="text-4xl font-light text-gray-900">{value}</div>
  </div>
);

export const SuperDashboard = () => {
  const { data, loading, error, refetch } = useApi<any>('/dashboard/super');

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading dashboard...</div>;
  if (error) return (
    <div className="p-8 space-y-3">
      <p className="text-red-600">{error}</p>
      <button onClick={refetch} className="border rounded-lg px-4 py-2 text-sm">Retry</button>
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-normal text-gray-800">Super Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Stat label="Platform Tenants" value={data?.totalTenants ?? 0} icon={<FiGrid />} />
        <Stat label="Active Users" value={(data?.totalUsers ?? 0).toLocaleString()} icon={<FiUsers />} />
        <Stat label="Active Clients" value={(data?.totalClients ?? 0).toLocaleString()} icon={<FiUsers />} />
        <Stat label="Active Policies" value={(data?.activePolicies ?? 0).toLocaleString()} icon={<FiShield />} />
        <Stat label="Active Claims" value={data?.activeClaims ?? 0} icon={<FiAlertCircle />} />
        <Stat label="Applications" value={data?.totalApplications ?? 0} icon={<FiFileText />} />
      </div>

      {/* Tenant Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800">Tenant Breakdown</h2>
        </div>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Tenant</th>
              <th className="px-6 py-3 font-medium">Plan</th>
              <th className="px-6 py-3 font-medium">Users</th>
              <th className="px-6 py-3 font-medium">Clients</th>
              <th className="px-6 py-3 font-medium">Policies</th>
              <th className="px-6 py-3 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data?.tenantBreakdown ?? []).map((t: any) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{t.name}</td>
                <td className="px-6 py-4 capitalize">{t.plan}</td>
                <td className="px-6 py-4">{t.users}</td>
                <td className="px-6 py-4">{t.clients}</td>
                <td className="px-6 py-4">{t.policies}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Audit Events */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800">Recent Activity</h2>
        </div>
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Actor</th>
              <th className="px-6 py-3 font-medium">Action</th>
              <th className="px-6 py-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data?.recentAuditEvents ?? []).map((e: any) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{new Date(e.createdAt).toLocaleString('en-ZA', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{e.actor}</div>
                  <div className="text-xs text-gray-400">{e.actorRole}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono">{e.action}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
