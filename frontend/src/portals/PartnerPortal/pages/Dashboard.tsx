import { FiUsers } from 'react-icons/fi';

export const PartnerDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Partner Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Simple Google-like metric card */}
        <div className="border border-gray-200 rounded-xl p-6 flex flex-col justify-between h-32 hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-gray-500">Total Clients in System</span>
            <FiUsers className="text-gray-400 text-xl" />
          </div>
          <div className="text-4xl font-light text-gray-900">
            124
          </div>
        </div>
      </div>
    </div>
  );
};
