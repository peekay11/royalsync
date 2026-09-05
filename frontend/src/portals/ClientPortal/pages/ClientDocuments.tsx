import { useApi } from '../../../hooks/useApi';
import { FiDownload, FiUpload, FiShare2 } from 'react-icons/fi';
import { apiRequest, downloadDocument, uploadDocument } from '../../../lib/api';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export const ClientDocuments = () => {
  const { data: documents, loading, error, refetch } = useApi<any[]>('/workflow/documents');
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try { await uploadDocument(file); toast.success('Document uploaded'); refetch(); }
    catch (requestError) { toast.error(requestError instanceof Error ? requestError.message : 'Upload failed'); }
    finally { setBusy(false); }
  };

  const requestDocument = async () => {
    const name = window.prompt('What document do you need?');
    if (!name) return;
    try { await apiRequest('/notifications', { method: 'POST', body: JSON.stringify({ event: 'document_request', message: name }) }); toast.success('Document request sent'); }
    catch { toast.error('Could not send document request'); }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading documents...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-red-600">{error}</p><button onClick={refetch} className="border rounded-lg px-4 py-2">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Documents Vault</h1>
        <div className="flex gap-2">
          <button onClick={requestDocument} className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Request Document</button>
          <input ref={inputRef} type="file" className="hidden" onChange={event => handleUpload(event.target.files?.[0])} />
          <button disabled={busy} onClick={() => inputRef.current?.click()} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50">
            <FiUpload /> {busy ? 'Uploading...' : 'Upload'}
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
                <td className="px-6 py-4">{doc.date || doc.created_at || '—'}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button title="Share document" className="text-gray-400 hover:text-red-600"><FiShare2 size={16} /></button>
                  <button title="Download document" onClick={() => downloadDocument(doc.id, doc.name)} className="text-gray-400 hover:text-red-600"><FiDownload size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
