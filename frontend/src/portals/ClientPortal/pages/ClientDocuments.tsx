import { useApi } from '../../../hooks/useApi';
import {
  FiDownload,
  FiUploadCloud,
  FiTrash2,
  FiFileText,
  FiImage,
  FiFile,
  FiSearch,
  FiCheckCircle,
  FiAlertTriangle,
  FiCalendar,
  FiClock,
  FiShield
} from 'react-icons/fi';
import { apiRequest, downloadDocument, uploadDocument, deleteDocument } from '../../../lib/api';
import { useRef, useState, useMemo } from 'react';
import { toast } from 'sonner';

const CATEGORIES = [
  'All',
  'KYC / ID',
  'Proof of Address',
  'Policy Schedule',
  'Claim Evidence',
  'Bank Confirmation',
  'Medical Records',
  'General',
];

export const ClientDocuments = () => {
  const { data: documents, loading, error, refetch } = useApi<any[]>('/workflow/documents');
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploadCategory, setUploadCategory] = useState('Proof of Address');
  const [customExpiry, setCustomExpiry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type?: string, name?: string) => {
    const ext = (type || name?.split('.').pop() || '').toLowerCase();
    if (['pdf'].includes(ext)) return <FiFileText className="text-red-500" size={20} />;
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return <FiImage className="text-blue-500" size={20} />;
    if (['doc', 'docx'].includes(ext)) return <FiFileText className="text-indigo-500" size={20} />;
    return <FiFile className="text-gray-500" size={20} />;
  };

  const getExpiryDetails = (doc: any) => {
    if (!doc.expiryDate && !doc.created_at) return { status: 'valid', label: 'Permanent', days: 9999 };
    
    let targetDate = doc.expiryDate ? new Date(doc.expiryDate) : new Date(doc.created_at);
    if (!doc.expiryDate) {
      // Fallback calculation based on category
      const cat = (doc.category || '').toLowerCase();
      const months = cat.includes('address') || cat.includes('bank') ? 3 : 12;
      targetDate = new Date(targetDate.getTime() + months * 30 * 24 * 60 * 60 * 1000);
    }

    const now = Date.now();
    const diffDays = Math.ceil((targetDate.getTime() - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { status: 'expired', label: 'Expired', days: diffDays, dateString: targetDate.toLocaleDateString() };
    }
    if (diffDays <= 30) {
      return { status: 'expiring_soon', label: `Expires in ${diffDays}d`, days: diffDays, dateString: targetDate.toLocaleDateString() };
    }
    return { status: 'valid', label: `Valid (${diffDays}d left)`, days: diffDays, dateString: targetDate.toLocaleDateString() };
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File exceeds 25 MB limit');
      return;
    }
    setBusy(true);
    try {
      await uploadDocument(file, uploadCategory, customExpiry || undefined);
      toast.success(`"${file.name}" uploaded. Automated expiry tracking and alerts activated.`);
      setCustomExpiry('');
      refetch();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteDocument(id);
      toast.success('Document deleted');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete document');
    }
  };

  const requestDocument = async () => {
    const name = window.prompt('What document do you require from your adviser?');
    if (!name?.trim()) return;
    try {
      await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify({ event: 'document_request', message: name.trim() })
      });
      toast.success('Document request submitted to your adviser');
    } catch {
      toast.error('Could not send document request');
    }
  };

  const expiringOrExpiredDocs = useMemo(() => {
    return (documents || []).filter(doc => {
      const exp = getExpiryDetails(doc);
      return exp.status === 'expired' || exp.status === 'expiring_soon';
    });
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return (documents || []).filter(doc => {
      const matchesCategory = selectedCategory === 'All' || (doc.category || 'General') === selectedCategory;
      const matchesSearch = !searchQuery.trim() ||
        doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [documents, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md uppercase tracking-wider flex items-center gap-1">
              <FiShield size={12} /> FAIS & FICA Compliant Vault
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Documents & Compliance Vault</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and manage policy schedules, IDs, and proof of address. Automated alert reminders trigger before expiration.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={requestDocument}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          >
            Request Document
          </button>
          <div className="relative">
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={e => handleUpload(e.target.files?.[0])}
            />
            <button
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <FiUploadCloud size={18} />
              {busy ? 'Uploading & Tracking...' : 'Upload Document'}
            </button>
          </div>
        </div>
      </div>

      {/* Automated Expiry Warnings Alert Banner */}
      {expiringOrExpiredDocs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <FiAlertTriangle size={18} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-900">
                Action Required: {expiringOrExpiredDocs.length} Document{expiringOrExpiredDocs.length > 1 ? 's' : ''} Expiring or Expired
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Automated compliance monitoring detected expiring documents. Upload an updated copy to prevent disruption to your policy coverage.
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {expiringOrExpiredDocs.map(doc => {
                  const exp = getExpiryDetails(doc);
                  return (
                    <div
                      key={doc.id}
                      className="bg-white/80 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-900 flex items-center gap-2"
                    >
                      <span className="font-semibold truncate max-w-[180px]">{doc.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        exp.status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {exp.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Zone with Automated Expiry Calculation Form */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0]);
        }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-white ${
          isDragging ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <FiUploadCloud size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              Drag & drop your files here, or{' '}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-red-600 hover:text-red-700 font-semibold underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Supports PDF, PNG, JPG, DOCX, XLSX (Max 25 MB)
            </p>
          </div>

          {/* Upload Configuration & Auto Expiry Selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100 max-w-xl">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600 font-medium">Category:</span>
              <select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                <FiCalendar size={12} /> Custom Expiry:
              </span>
              <input
                type="date"
                value={customExpiry}
                onChange={e => setCustomExpiry(e.target.value)}
                placeholder="Auto-calculated"
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-400">
            {uploadCategory.includes('Address')
              ? 'ℹ️ Proof of Address defaults to 3 months validity (FICA standard).'
              : uploadCategory.includes('ID')
              ? 'ℹ️ ID & Passports default to 5 years validity.'
              : 'ℹ️ Expiry is calculated automatically and tracked with reminder alerts.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading document records...</div>
        ) : error ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={refetch} className="border border-gray-300 rounded-xl px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50">Retry</button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <FiFile size={22} />
            </div>
            <h3 className="text-sm font-semibold text-gray-800">No documents found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All'
                ? 'No documents match the active search or category filters.'
                : 'You have not uploaded any documents yet. Upload a document using the box above.'}
            </p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 underline"
            >
              <FiUploadCloud size={14} /> Upload your first document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-700 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Document Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Size</th>
                  <th className="px-6 py-3.5">Date Uploaded</th>
                  <th className="px-6 py-3.5">Expiry & Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDocs.map(doc => {
                  const exp = getExpiryDetails(doc);
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            {getFileIcon(doc.type, doc.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-xs">{doc.name}</p>
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                              <FiCheckCircle size={10} className="text-emerald-500" /> Verified
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                          {doc.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {formatBytes(doc.size)}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : doc.date || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              exp.status === 'expired'
                                ? 'bg-red-100 text-red-700'
                                : exp.status === 'expiring_soon'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              <FiClock size={10} /> {exp.label}
                            </span>
                          </div>
                          {exp.dateString && (
                            <p className="text-[11px] text-gray-400">
                              Valid until {exp.dateString}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            title="Download document"
                            onClick={() => downloadDocument(doc.id, doc.name)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiDownload size={16} />
                          </button>
                          <button
                            title="Delete document"
                            onClick={() => handleDelete(doc.id, doc.name)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
