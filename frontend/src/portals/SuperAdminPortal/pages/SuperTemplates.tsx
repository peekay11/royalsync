import { useState, useMemo } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import {
  FiPlus,
  FiCopy,
  FiSearch,
  FiCheck
} from 'react-icons/fi';
import { toast } from 'sonner';

interface MasterTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  isGlobal?: boolean;
}

const MASTER_TEMPLATES: MasterTemplate[] = [
  {
    id: 'gtpl_1',
    title: 'FAIS Statutory Intermediary Mandate',
    category: 'Legal Mandates',
    description: 'Master brokerage mandate authorizing intermediary advice and policy inception under FAIS Licence 29370.',
    content: `STATUTORY BROKERAGE MANDATE AND APPOINTMENT

Between: Royal Square Financial (Pty) Ltd (FSP Licence 29370)
And: {{client_name}} (RSA ID: {{id_number}})

1. APPOINTMENT: The Client hereby appoints Royal Square Financial as their non-exclusive financial intermediary for short-term insurance, life risk, and investment products.
2. AUTHORITY: The Intermediary is authorized to obtain underwriting quotes, submit claims notifications, and advocate on the Client's behalf.
3. REMUNERATION: Standard intermediary commissions are disclosed in the statutory Record of Advice and comply with the FAIS Regulations.
4. CONFIDENTIALITY: Personal information is processed in strict compliance with the Protection of Personal Information Act (POPIA).`,
    isGlobal: true
  },
  {
    id: 'gtpl_2',
    title: 'Statutory Record of Advice (RoA)',
    category: 'Compliance',
    description: 'Mandatory Section 8 FAIS Record of Advice documenting product comparison, risk analysis, and client selection rationale.',
    content: `FAIS SECTION 8 STATUTORY RECORD OF ADVICE

Client: {{client_name}}
Date: {{current_date}}
Adviser: Qiniso Thulani Ntuli (Key Individual)

1. FINANCIAL NEEDS ANALYSIS:
Client required comprehensive motor and household asset protection against accident, fire, theft, and third-party liabilities.

2. PRODUCT COMPARISON:
- Santam Comprehensive: R 2,850/mo · Standard Excess R 3,500 · Full territory extension.
- Discovery Insure: R 3,100/mo · Dynamic Excess with Vitality Drive.

3. MOTIVATION & SELECTION:
Selected Santam Comprehensive due to superior cross-border cover and favorable excess structure.`,
    isGlobal: true
  }
];

export const SuperTemplates = () => {
  const { data: apiTemplates, refetch } = useApi<MasterTemplate[]>('/templates');
  const [selectedTemplate, setSelectedTemplate] = useState<MasterTemplate>(MASTER_TEMPLATES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Legal Mandates');
  const [newDesc, setNewDesc] = useState('');
  const [newContent, setNewContent] = useState('');
  const [copied, setCopied] = useState(false);

  const templates = useMemo(() => {
    const combined = [...MASTER_TEMPLATES];
    if (apiTemplates && Array.isArray(apiTemplates)) {
      apiTemplates.forEach(t => {
        if (!combined.some(c => c.id === t.id || c.title === t.title)) {
          combined.push({ ...t, isGlobal: true });
        }
      });
    }
    return combined.filter(
      t =>
        (t.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (t.category || '').toLowerCase().includes((searchQuery || '').toLowerCase())
    );
  }, [apiTemplates, searchQuery]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      await apiRequest('/templates', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory.trim(),
          description: newDesc.trim() || 'Global Master Template',
          content: newContent.trim(),
          isGlobal: true
        })
      });
      toast.success('Global Master Template saved!');
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
      setNewDesc('');
      refetch();
    } catch {
      toast.error('Failed to create global template');
    }
  };

  const handleCopy = () => {
    if (!selectedTemplate) return;
    navigator.clipboard.writeText(selectedTemplate.content);
    setCopied(true);
    toast.success('Template content copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Global Compliance Master Templates</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage global statutory mandates, Record of Advice (RoA) formats, and disclosure standards across all tenants
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> Create Global Master Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Template List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search master templates..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-sm"
            />
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {templates.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedTemplate?.id === t.id
                    ? 'bg-red-50/60 dark:bg-red-950/30 border-red-500 dark:border-red-600 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                    {t.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">Global Mandate</span>
                </div>
                <h3 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{t.title}</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Master Template Preview */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{selectedTemplate?.title}</h2>
              <p className="text-xs text-gray-400">{selectedTemplate?.description}</p>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
            >
              {copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
              {copied ? 'Copied' : 'Copy Master'}
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto">
            {selectedTemplate?.content}
          </div>
        </div>
      </div>

      {/* Create Global Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Create Global Compliance Template</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Master Template Title</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. FAIS Intermediary Disclosure Annexure"
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="Legal Mandates">Legal Mandates</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Claims">Claims</option>
                    <option value="Disclosures">Disclosures</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Short Description</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Brief description of statutory purpose"
                    className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Master Content</label>
                <textarea
                  required
                  rows={8}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Enter statutory wording with {{placeholders}}..."
                  className="w-full mt-1 p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
                >
                  Publish Global Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

