import { useApi } from '../../../hooks/useApi';
import { FiShield, FiFileText, FiTarget } from 'react-icons/fi';

export const ClientDashboard = () => {
  const { data: policies, loading: pLoad } = useApi<any[]>('/policies');
  const { data: claims, loading: cLoad } = useApi<any[]>('/claims');
  const { data: goals, loading: gLoad } = useApi<any>('/goals');

  if (pLoad || cLoad || gLoad) return <div className="p-8 text-gray-500 animate-pulse">Loading dashboard data...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Good morning, Client</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32 hover:border-red-200 transition-colors bg-white">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Active Policies</span>
            <FiShield className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{policies?.length || 0}</div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32 hover:border-red-200 transition-colors bg-white">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Open Claims</span>
            <FiFileText className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{claims?.length || 0}</div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32 hover:border-red-200 transition-colors bg-white">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Top Goal Progress</span>
            <FiTarget className="text-gray-400 text-xl" />
          </div>
          <div className="text-2xl font-light text-gray-900 mt-2 truncate">
            {goals?.goals?.[0]?.title || 'No goals set'}
          </div>
        </div>
      </div>
    </div>
  );
};
