import { useState, useRef } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';
import { FiPlus, FiEdit2, FiFileText, FiMessageSquare } from 'react-icons/fi';
import { renderMerge, sampleContext, documentShell } from '../../../lib/mergeTemplate';

const channelColors: Record<string, string> = {
  email: 'bg-blue-100 text-blue-700',
  sms: 'bg-green-100 text-green-700',
  whatsapp: 'bg-emerald-100 text-emerald-700',
  in_app: 'bg-purple-100 text-purple-700',
};

type MergeGroup = { group: string; fields: { token: string; label: string }[] };

const emptyForm = {
  name: '', type: 'general', format: 'communication', channel: 'email',
  company: '', subject: '', body: '',
};

export const SuperTemplates = () => {
  const { data: templates, loading, error, refetch } = useApi<any[]>('/templates');
  const { data: mergeGroups } = useApi<MergeGroup[]>('/templates/merge-fields');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editing, setEditing] = useState<any | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const isDoc = form.format === 'document';

  const openNew = (format: 'communication' | 'document') => {
    setEditing(null);
    setForm({ ...emptyForm, format });
    setShowForm(true);
  };

  const editTemplate = (t: any) => {
    setEditing(t);
    setForm({
      name: t.name, type: t.type, format: t.format || 'communication', channel: t.channel,
      company: t.company ?? '', subject: t.subject ?? '', body: t.body,
    });
    setShowForm(true);
  };

  const insertToken = (token: string) => {
    const ta = bodyRef.current;
    const snippet = `{{ ${token} }}`;
    if (!ta) { setForm(f => ({ ...f, body: f.body + snippet })); return; }
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const next = ta.value.slice(0, start) + snippet + ta.value.slice(end);
    setForm(f => ({ ...f, body: next }));
    requestAnimationFrame(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + snippet.length; });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name, type: form.type, format: form.format, channel: form.channel,
        company: isDoc ? form.company : null, subject: form.subject, body: form.body,
      };
      if (editing) {
        await apiRequest(`/templates/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast.success('Template updated');
      } else {
        await apiRequest('/templates', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Template created');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ ...emptyForm });
      refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading templates...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const previewHtml = documentShell(
    renderMerge(form.subject || form.name || 'Untitled document', sampleContext(form.company)),
    form.company || 'Santam',
    'Royal Square Financial',
    renderMerge(form.body || '<p style="color:#9aa5b1">Start typing the document body…</p>', sampleContext(form.company)),
  );

  const docTemplates = (templates ?? []).filter((t: any) => t.format === 'document');
  const commsTemplates = (templates ?? []).filter((t: any) => (t.format || 'communication') !== 'document');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-normal text-gray-800">Global Templates</h1>
        <div className="flex gap-2">
          <button onClick={() => openNew('communication')}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
            <FiMessageSquare /> New Message
          </button>
          <button onClick={() => openNew('document')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
            <FiPlus /> New Document Template
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">
              {editing ? 'Edit' : 'Create'} {isDoc ? 'Document Template' : 'Message Template'}
            </h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${isDoc ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {isDoc ? 'PDF document' : 'Communication'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={isDoc ? 'e.g. Quote Request' : 'e.g. Renewal Reminder'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {['general', 'onboarding', 'policy', 'claims', 'payment', 'reminder', 'compliance'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            {isDoc ? (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Company / Insurer</label>
                <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Santam" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ) : (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Channel</label>
                <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="in_app">In-App</option>
                </select>
              </div>
            )}
          </div>

          {(isDoc || form.channel === 'email') && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">{isDoc ? 'Document title' : 'Subject'}</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder={isDoc ? 'e.g. Quote Request for {{ client.fullName }}' : 'Email subject line'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          )}

          {isDoc ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Document body (HTML)</label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50">
                  {(mergeGroups ?? []).map(g => (
                    <div key={g.group} className="w-full">
                      <div className="text-[10px] uppercase tracking-wide text-gray-400 mt-1 mb-0.5">{g.group}</div>
                      <div className="flex flex-wrap gap-1">
                        {g.fields.map(fld => (
                          <button type="button" key={fld.token} onClick={() => insertToken(fld.token)}
                            title={fld.token}
                            className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 hover:border-red-400 hover:text-red-600">
                            {fld.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <textarea ref={bodyRef} required rows={16} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  placeholder={'<p>Dear {{ client.fullName }},</p>\n<p>Please find your quote request below…</p>'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">Live preview <span className="text-gray-400">(sample data)</span></label>
                <iframe title="preview" srcDoc={previewHtml} className="w-full border border-gray-200 rounded-lg bg-white" style={{ height: '30rem' }} />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Body * <span className="text-gray-400 font-normal">(use {'{{firstName}}'}, {'{{policyNumber}}'} etc.)</span></label>
              <textarea required rows={4} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Template body content..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{saving ? 'Saving...' : (editing ? 'Update' : 'Create')}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {/* Document templates */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><FiFileText /> Document Templates (PDF)</h2>
        <div className="grid grid-cols-1 gap-3">
          {docTemplates.map((t: any) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between hover:border-gray-300">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium text-gray-900">{t.name}</span>
                  {t.company && <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">{t.company}</span>}
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500 capitalize">{t.type}</span>
                </div>
                {t.subject && <div className="text-sm text-gray-500 mb-1">Title: {t.subject}</div>}
                <div className="text-xs text-gray-400 line-clamp-2 font-mono">{t.body}</div>
              </div>
              <button onClick={() => editTemplate(t)} className="ml-4 text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50"><FiEdit2 size={14} /></button>
            </div>
          ))}
          {docTemplates.length === 0 && <div className="text-center py-8 text-gray-400 bg-white border border-gray-200 rounded-xl">No document templates yet.</div>}
        </div>
      </div>

      {/* Communication templates */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><FiMessageSquare /> Message Templates</h2>
        <div className="grid grid-cols-1 gap-3">
          {commsTemplates.map((t: any) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between hover:border-gray-300">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium text-gray-900">{t.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${channelColors[t.channel] ?? 'bg-gray-100 text-gray-600'}`}>{t.channel}</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500 capitalize">{t.type}</span>
                </div>
                {t.subject && <div className="text-sm text-gray-500 mb-1">Subject: {t.subject}</div>}
                <div className="text-sm text-gray-400 line-clamp-2">{t.body}</div>
              </div>
              <button onClick={() => editTemplate(t)} className="ml-4 text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50"><FiEdit2 size={14} /></button>
            </div>
          ))}
          {commsTemplates.length === 0 && <div className="text-center py-8 text-gray-400 bg-white border border-gray-200 rounded-xl">No message templates yet.</div>}
        </div>
      </div>
    </div>
  );
};
