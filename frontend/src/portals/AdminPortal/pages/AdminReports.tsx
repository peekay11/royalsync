import { useApi } from '../../../hooks/useApi';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export const AdminReports = () => {
  const { data, loading, error, refetch } = useApi<any>('/reports/summary');
  if (loading) return <div className="p-8 text-gray-500">Loading reports...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-red-600">{error}</p><button onClick={refetch} className="border rounded-lg px-4 py-2">Retry</button></div>;
  return <div className="space-y-6"><h1 className="text-2xl font-normal text-gray-800">Reports & Analytics</h1><div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[['Lead conversion', data?.leadsByStatus], ['Claims status', data?.claimsByStatus], ['Applications', data?.applicationsByStatus], ['Policies', data?.policiesByStatus]].map(([title, values]) => <div key={String(title)} className="bg-white border border-gray-200 rounded-xl p-6"><h2 className="font-medium text-gray-900 mb-4">{title}</h2><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={values || []}><CartesianGrid strokeDasharray="3 3" stroke="#eee" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#d92820" /></BarChart></ResponsiveContainer></div></div>)}</div></div>;
};
