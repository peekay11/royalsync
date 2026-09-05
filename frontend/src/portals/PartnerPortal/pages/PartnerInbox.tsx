

export const PartnerInbox = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Quotes Inbox</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Request Ref</th>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Date Received</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">REQ-8902</td>
              <td className="px-6 py-4">Comprehensive Motor</td>
              <td className="px-6 py-4">Today, 09:30 AM</td>
              <td className="px-6 py-4 text-right">
                <button className="text-red-600 font-medium hover:underline mr-3">Decline</button>
                <button className="bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-700 transition-colors">Submit Quote</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
