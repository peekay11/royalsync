export const SuperCompliance = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-normal text-gray-800">Tenant Compliance</h1>
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-2">POPIA Consent Register</h3>
        <button className="text-sm text-red-600 font-medium hover:underline">Export Register (CSV)</button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-2">FICA Screening (PEP/Sanctions)</h3>
        <button className="text-sm text-red-600 font-medium hover:underline">View Flagged Accounts</button>
      </div>
    </div>
  </div>
);
