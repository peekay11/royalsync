import { useMemo, useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest, downloadDocument } from '../../../lib/api';
import { toast } from 'sonner';
import { FiFileText, FiX, FiDownload } from 'react-icons/fi';

const channelColors: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  sms: 'bg-green-100 text-green-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  in_app: 'bg-purple-100 text-purple-700',
};

type Client = { id: string; firstName: string; lastName: string; mobile: string; email?: string };

export const AdminTemplates = () => {
  const { data: templates, loading, error, refetch } = useApi<any[]>('/templates');
  const { data: clients } = useApi<Client[]>('/crm/clients');
  const [useTemplate, setUseTemplate] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const docTemplates = useMemo(() => (templates ?? []).filter((t: any) => t.format === 'document'), [templates]);
  const commsTemplates = useMemo(() => (templates ?? []).filter((t: any) => (t.format || 'communication') !== 'document'), [templates]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = clients ?? [];
    if (!q) return list;
    return list.filter(c => `${c.firstName} ${c.lastName} ${c.mobile} ${c.email ?? ''}`.toLowerCase().includes(q));
  }, [clients, search]);

  const generate = async (client: Client) => {
    if (!useTemplate) return;
    setGeneratingId(client.id);
    try {
      const doc = await apiRequest<{ id: string; name: string }>(`/templates/${useTemplate.id}/generate`, {
        method: 'POST',
        body: JSON.stringify({ clientId: client.id }),
      });
      toast.success('Document generated');
      await downloadDocument(doc.id, doc.name || useTemplate.name);
      setUseTemplate(null);
      setSearch('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate document');
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading templates...</div>;
  if (error) return (
    <div className="p-8 space-y-3">
      <p className="text-red-600">{error}</p>
      <button onClick={refetch} className="border rounded-lg px-4 py-2 text-sm">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-normal text-gray-800">Templates</h1>
        <span className="text-sm text-gray-500">{(templates ?? []).length} templates</span>
      </div>

      {/* Document templates — generate a filled PDF for a client */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><FiFileText /> Document Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docTemplates.map((t: any) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{t.name}</span>
                {t.company && <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">{t.company}</span>}
              </div>
              {t.subject && <div className="text-sm text-gray-500 mb-3">{t.subject}</div>}
              <button
                onClick={() => { setUseTemplate(t); setSearch(''); }}
                className="mt-auto self-start bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <FiFileText size={14} /> Use this template
              </button>
            </div>
          ))}
          {docTemplates.length === 0 && (
            <div className="md:col-span-2 text-center py-10 text-gray-400 bg-white border border-gray-200 rounded-xl">
              No document templates configured. Super Admin can add them under Global Templates.
            </div>
          )}
        </div>
      </div>

      {/* Communication templates — reference only */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Message Templates</h2>
        <div className="grid grid-cols-1 gap-3">
          {commsTemplates.map((t: any) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-gray-900">{t.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${channelColors[t.channel] ?? 'bg-gray-100 text-gray-600'}`}>{t.channel}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500 capitalize">{t.type}</span>
                  </div>
                  {t.subject && <div className="text-sm text-gray-600 mb-1">Subject: {t.subject}</div>}
                  <div className="text-sm text-gray-400 line-clamp-2">{t.body}</div>
                </div>
                <button onClick={() => window.alert(`Template body:\n\n${t.body}`)} className="ml-4 text-sm text-red-600 hover:underline whitespace-nowrap">Preview</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client picker modal for generating a document */}
      {useTemplate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setUseTemplate(null)}>
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <div className="font-medium text-gray-900">{useTemplate.name}</div>
                <div className="text-xs text-gray-500">Choose a client to generate this document</div>
              </div>
              <button onClick={() => setUseTemplate(null)} className="text-gray-400 hover:text-gray-700"><FiX /></button>
            </div>
            <div className="p-4">
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients by name, mobile, email…" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
              {filteredClients.map(c => (
                <button key={c.id} disabled={generatingId !== null} onClick={() => generate(c)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 flex items-center justify-between disabled:opacity-50">
                  <div>
                    <div className="text-sm text-gray-900">{c.firstName} {c.lastName}</div>
                    <div className="text-xs text-gray-500">{c.mobile}{c.email ? ` · ${c.email}` : ''}</div>
                  </div>
                  {generatingId === c.id
                    ? <span className="text-xs text-gray-400 animate-pulse">Generating…</span>
                    : <FiDownload className="text-gray-400" size={14} />}
                </button>
              ))}
              {filteredClients.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No clients found.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
