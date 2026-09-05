
export const SuperDashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-normal text-gray-800">Super Admin Dashboard</h1>
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 h-32 flex flex-col justify-between">
        <span className="text-sm font-medium text-gray-500">Platform Tenants</span>
        <div className="text-4xl font-light text-gray-900">4</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 h-32 flex flex-col justify-between">
        <span className="text-sm font-medium text-gray-500">Active Users</span>
        <div className="text-4xl font-light text-gray-900">1,204</div>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 h-32 flex flex-col justify-between">
        <span className="text-sm font-medium text-gray-500">System Status</span>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div><span className="font-medium text-green-700">All Systems Operational</span></div>
      </div>
    </div>
  </div>
);
