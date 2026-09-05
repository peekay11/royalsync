export const AdminReports = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-normal text-gray-800">Reports & Analytics</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {['Portfolio Health', 'Commission Summary', 'KYC Compliance', 'SLA Performance'].map(r => (
        <div key={r} className="bg-white border border-gray-200 rounded-xl p-6 h-48 flex flex-col justify-between">
          <h3 className="font-medium text-gray-900">{r}</h3>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Last updated: Today</span>
            <button className="text-red-600 font-medium hover:underline">Export CSV</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
