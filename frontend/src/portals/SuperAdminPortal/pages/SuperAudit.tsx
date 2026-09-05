export const SuperAudit = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-normal text-gray-800">Immutable Audit Log</h1>
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
          <tr><th className="px-6 py-3 font-medium">Timestamp</th><th className="px-6 py-3 font-medium">Actor</th><th className="px-6 py-3 font-medium">Action</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr className="hover:bg-gray-50"><td className="px-6 py-4">2026-09-05 10:00:12</td><td className="px-6 py-4">Admin (usr_2)</td><td className="px-6 py-4">UPDATE policy_status</td></tr>
        </tbody>
      </table>
    </div>
  </div>
);
