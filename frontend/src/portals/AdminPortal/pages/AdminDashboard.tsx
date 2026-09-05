import { useApi } from '../../../hooks/useApi';
import { FiUsers, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';

export const AdminDashboard = () => {
  const { data: clients, loading: cLoad } = useApi<any[]>('/crm/clients');
  const { data: tasks, loading: tLoad } = useApi<any[]>('/workflow/tasks');
  const { data: claims, loading: clLoad } = useApi<any[]>('/claims');

  if (cLoad || tLoad || clLoad) return <div className="p-8 text-gray-500 animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between h-32 hover:border-red-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Total Clients</span>
            <FiUsers className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{clients?.length || 0}</div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between h-32 hover:border-red-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Pending Tasks</span>
            <FiCheckSquare className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{tasks?.length || 0}</div>
        </div>

        <div className="border border-gray-200 rounded-xl p-6 bg-white flex flex-col justify-between h-32 hover:border-red-200 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Active Claims</span>
            <FiAlertCircle className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">{claims?.length || 0}</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">My Tasks Today</h2>
        <div className="space-y-3">
          {tasks?.map(task => (
            <div key={task.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500" />
                <span className="text-sm font-medium text-gray-700">{task.title}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                {task.priority} Priority
              </span>
            </div>
          ))}
          {(!tasks || tasks.length === 0) && (
            <p className="text-sm text-gray-500">No tasks due today. Great job!</p>
          )}
        </div>
      </div>
    </div>
  );
};
