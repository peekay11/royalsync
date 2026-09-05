import { useApi } from '../../../hooks/useApi';
import { FiDownload, FiUpload, FiShare2 } from 'react-icons/fi';

export const ClientDocuments = () => {
  const { data: documents, loading } = useApi<any[]>('/workflow/documents');

  if (loading) return <div className="p-8 text-gray-500">Loading documents...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Documents Vault</h1>
        <div className="flex gap-2">
          <button className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Request Document</button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
            <FiUpload /> Upload
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents?.map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{doc.name}</td>
                <td className="px-6 py-4 capitalize">{doc.type}</td>
                <td className="px-6 py-4">{doc.date}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button className="text-gray-400 hover:text-red-600"><FiShare2 size={16} /></button>
                  <button className="text-gray-400 hover:text-red-600"><FiDownload size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
