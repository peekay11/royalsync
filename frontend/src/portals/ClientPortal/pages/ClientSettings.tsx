export const ClientSettings = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-normal text-gray-800">Settings</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Policy Updates (Email & WhatsApp)</span>
            <input type="checkbox" defaultChecked className="text-red-600 rounded border-gray-300 focus:ring-red-500" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Marketing & Offers</span>
            <input type="checkbox" className="text-red-600 rounded border-gray-300 focus:ring-red-500" />
          </label>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Security</h2>
        <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors mr-3">Change Password</button>
        <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Enable MFA</button>
      </div>
    </div>
  );
};
