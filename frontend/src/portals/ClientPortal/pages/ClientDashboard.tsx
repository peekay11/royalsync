import { useApi } from '../../../hooks/useApi';
import { FiShield, FiFileText, FiTarget } from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ClientDashboardData {
  activePolicyCount: number;
  monthlyPremium: number;
  openClaims: number;
  nextPayment: { amount?: number; date?: string } | null;
  goals: { target: number; current: number; percentage: number };
  premiumByType: Array<{ name: string; value: number }>;
}

export const ClientDashboard = () => {
  const { data, loading, error, refetch } = useApi<ClientDashboardData>('/dashboard/client');

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading dashboard data...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-red-600">{error}</p><button onClick={refetch} className="border rounded-lg px-4 py-2">Retry</button></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Good morning, {JSON.parse(localStorage.getItem('royalsync_user') || '{}')?.firstName || 'Client'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32 hover:border-red-200 transition-colors bg-white">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Active Policies</span>
            <FiShield className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{data?.activePolicyCount || 0}</div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32 hover:border-red-200 transition-colors bg-white">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Open Claims</span>
            <FiFileText className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{data?.openClaims || 0}</div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32 hover:border-red-200 transition-colors bg-white">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Top Goal Progress</span>
            <FiTarget className="text-gray-400 text-xl" />
          </div>
          <div className="text-2xl font-light text-gray-900 mt-2 truncate">
            {data?.goals.percentage || 0}% complete
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Monthly premium by cover type</h2>
          {data?.premiumByType.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.premiumByType}><CartesianGrid strokeDasharray="3 3" stroke="#eee" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#d92820" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div> : <p className="text-sm text-gray-500">No policy premium data is available yet.</p>}
        </div>
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Portfolio summary</h2>
          <p className="text-3xl font-light text-gray-900">R {(data?.monthlyPremium || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">Current monthly premium from active policies.</p>
        </div>
      </div>
    </div>
  );
};
