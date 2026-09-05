import { useApi } from '../../../hooks/useApi';
import { FiUsers, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const AdminDashboard = () => {
  const { data, loading, error, refetch } = useApi<any>('/dashboard/admin');

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading dashboard...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-red-600">{error}</p><button onClick={refetch} className="border rounded-lg px-4 py-2">Retry</button></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between h-32 hover:border-red-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Total Clients</span>
            <FiUsers className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{data?.totalClients || 0}</div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between h-32 hover:border-red-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Pending Tasks</span>
            <FiCheckSquare className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{data?.pendingTasks || 0}</div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between h-32 hover:border-red-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Active Claims</span>
            <FiAlertCircle className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{data?.activeClaims || 0}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">My Tasks Today</h2>
        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data?.leadFunnel || []}><CartesianGrid strokeDasharray="3 3" stroke="#eee" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#d92820" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  );
};
