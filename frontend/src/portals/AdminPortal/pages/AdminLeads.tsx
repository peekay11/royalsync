import { FiPlus } from 'react-icons/fi';

export const AdminLeads = () => {
  const columns = ['New', 'Contacted', 'Qualified', 'Quoted', 'Won', 'Lost'];
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Leads Pipeline</h1>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
          <FiPlus /> Add Lead
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => (
          <div key={col} className="bg-gray-50 border border-gray-200 rounded-xl w-72 flex-shrink-0 flex flex-col">
            <div className="p-3 border-b border-gray-200 font-medium text-gray-700">{col}</div>
            <div className="p-3 flex-1 space-y-3">
              {col === 'New' && (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm cursor-pointer hover:border-red-300">
                  <div className="font-medium text-gray-900">Jane Smith</div>
                  <div className="text-xs text-gray-500 mt-1">Motor • Online Quote</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
