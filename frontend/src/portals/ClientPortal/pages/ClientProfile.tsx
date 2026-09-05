export const ClientProfile = () => {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-normal text-gray-800">My Profile</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Personal Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" defaultValue="John" className="w-full border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" defaultValue="Doe" className="w-full border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
            <input type="text" disabled defaultValue="900101****087" className="w-full border-gray-200 bg-gray-50 rounded-md text-sm text-gray-500" />
            <p className="text-xs text-gray-400 mt-1">Requires adviser approval to change.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input type="text" defaultValue="082 123 4567" className="w-full border-gray-300 rounded-md text-sm" />
          </div>
        </div>
        <div className="mt-6">
          <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
