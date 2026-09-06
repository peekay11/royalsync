import { useState, useMemo } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import {
  FiCopy,
  FiDownload,
  FiPlus,
  FiCheck,
  FiEdit3,
  FiSearch
} from 'react-icons/fi';
import { toast } from 'sonner';

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

const DEFAULT_TEMPLATES: TemplateItem[] = [
  {
    id: 'tpl_1',
    title: 'Cross-Border Vehicle Travel Letter',
    category: 'Motor Insurance',
    description: 'Official authorization letter confirming comprehensive cross-border vehicle cover for SADC travel (Mozambique, Botswana, Zimbabwe, Namibia).',
    content: `TO WHOM IT MAY CONCERN / BORDER CONTROL AUTHORITIES

RE: CONFIRMATION OF COMPREHENSIVE MOTOR VEHICLE INSURANCE COVER FOR CROSS-BORDER TRAVEL

Policyholder: {{client_name}}
RSA ID Number: {{id_number}}
Policy Reference: {{policy_number}}
Insurer: Santam Insurance Limited
Vehicle Make / Model: {{vehicle_model}}
Registration Number: {{vehicle_reg}}
Engine / VIN Number: {{vin_number}}

We hereby confirm that the above-mentioned vehicle is comprehensively insured under the above policy, which includes territory extension cover for private use in the following SADC territories:
- Republic of Botswana
- Republic of Namibia
- Kingdom of Eswatini
- Kingdom of Lesotho
- Republic of Mozambique
- Republic of Zimbabwe

Cover is subject to terms, exceptions, and conditions of the standard Santam Policy Schedule.

Yours faithfully,
Qiniso Thulani Ntuli (Key Individual)
Royal Square Financial (Pty) Ltd · FSP Licence 29370`
  },
  {
    id: 'tpl_2',
    title: 'New Client Welcome & FAIS Disclosure',
    category: 'Onboarding',
    description: 'Statutory FAIS disclosure notice, intermediary mandate confirmation, and appointed adviser details.',
    content: `Dear {{client_name}},

WELCOME TO ROYAL SQUARE FINANCIAL (PTY) LTD · FSP LICENCE 29370

We are pleased to welcome you as a valued client. As an authorized Financial Services Provider under the Financial Advisory and Intermediary Services Act 37 of 2002 (FAIS), we are committed to providing you with independent, professional advice.

Your Appointed Adviser:
Name: Qiniso Thulani Ntuli
Direct Contact: +27 11 555 0192 / qiniso@royalsquare.co.za
Physical Address: Johannesburg, South Africa

Your Client Portal Access:
You can manage your policy schedules, track claims, upload FICA verification documents, and monitor your total portfolio wealth 24/7 via the RoyalSync Client Portal.

Please review your attached advisory mandate and policy schedules.

Warm regards,
Royal Square Financial Team`
  },
  {
    id: 'tpl_3',
    title: 'Claims Acknowledgment & Requirements Notice',
    category: 'Claims',
    description: 'Formal acknowledgment of lodged claim with required supporting documents and assessor SLA guidelines.',
    content: `Dear {{client_name}},

RE: ACKNOWLEDGMENT OF CLAIM LODGMENT · CLAIM REF: {{claim_reference}}

We have successfully received your claim notification for incident date {{incident_date}}.

Your claim has been assigned to our claims advocacy team and submitted to the underwriting insurer.

REQUIRED SUPPORTING DOCUMENTATION:
1. Completed and signed Claim Form
2. SAPS Police Case Reference (where applicable)
3. Copy of Driver's Licence (for motor claims)
4. Minimum 2 comparative repair quotations
5. High-resolution photographs of physical damage

Please upload the outstanding documents directly into your RoyalSync Portal under the Claims tab.

Estimated Initial Assessor Turnaround: 2 business days.

Kind regards,
Claims Department · Royal Square Financial`
  },
  {
    id: 'tpl_4',
    title: 'FICA Compliance Document Checklist & Renewal',
    category: 'Compliance',
    description: 'Standard statutory request for updated proof of residence and identification in accordance with the FIC Act.',
    content: `Dear {{client_name}},

STATUTORY NOTICE: FICA DOCUMENT RENEWAL (FINANCIAL INTELLIGENCE CENTRE ACT)

In compliance with the Financial Intelligence Centre Act (Act 38 of 2001, as amended) and FAIS anti-money laundering regulations, we are required to maintain up-to-date customer due diligence verification for your active accounts.

Please provide the following current documents:
1. Valid South African Identity Document / Smart ID Card / Passport (Certified copy)
2. Proof of Residential Address (Utility bill, rates account, or bank statement not older than 3 months)
3. Confirmation of Banking Details (Bank-stamped letter not older than 3 months)

You can securely scan and upload these documents via your RoyalSync Portal under the Documents tab with real-time OCR validation.

Thank you for your ongoing cooperation.

Compliance Officer · Royal Square Financial (FSP 29370)`
  }
];

export const AdminTemplates = () => {
  const { data: apiTemplates, refetch } = useApi<TemplateItem[]>('/templates');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem>(DEFAULT_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientName, setClientName] = useState('Sipho Dlamini');
  const [policyNumber, setPolicyNumber] = useState('SAN-AUTO-8921');
  const [vehicleReg, setVehicleReg] = useState('ND 492-108');
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newContent, setNewContent] = useState('');

  const allTemplates = useMemo(() => {
    const combined = [...DEFAULT_TEMPLATES];
    if (apiTemplates && Array.isArray(apiTemplates)) {
      apiTemplates.forEach(t => {
        if (!combined.some(c => c.id === t.id || c.title === t.title)) {
          combined.push(t);
        }
      });
    }
    return combined.filter(
      t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [apiTemplates, searchQuery]);

  const renderedContent = useMemo(() => {
    if (!selectedTemplate) return '';
    return selectedTemplate.content
      .replace(/{{client_name}}/g, clientName || '[CLIENT NAME]')
      .replace(/{{policy_number}}/g, policyNumber || '[POLICY NUMBER]')
      .replace(/{{vehicle_reg}}/g, vehicleReg || '[VEHICLE REG]')
      .replace(/{{vehicle_model}}/g, '2024 Toyota Fortuner 2.8 GD-6')
      .replace(/{{id_number}}/g, '9001015009087')
      .replace(/{{vin_number}}/g, 'AHTFR22G908129381')
      .replace(/{{claim_reference}}/g, 'CLM-2026-8902')
      .replace(/{{incident_date}}/g, '2026-09-02');
  }, [selectedTemplate, clientName, policyNumber, vehicleReg]);

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedContent);
    setCopied(true);
    toast.success('Template text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([renderedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTemplate.title.replace(/\s+/g, '_')}_${clientName.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Template document downloaded');
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
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
          description: 'Custom broker template',
          content: newContent.trim()
        })
      });
      toast.success('New template saved successfully!');
      setIsCreating(false);
      setNewTitle('');
      setNewContent('');
      refetch();
    } catch {
      toast.error('Failed to save template');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document & Communication Templates</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Standard operating templates with automatic client variable interpolation (FSP 29370)
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> Create Custom Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Templates Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-3 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500 shadow-sm"
            />
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {allTemplates.map(t => (
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/60 px-2 py-0.5 rounded">
                    {t.category}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{t.title}</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Template Preview & Live Interpolation */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Interpolation Variable Inputs */}
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-200 dark:border-zinc-700/60 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <FiEdit3 className="w-3.5 h-3.5 text-red-500" /> Live Client Variables
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-500">Client Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500">Policy Number</label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={e => setPolicyNumber(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-500">Vehicle Reg / Extra</label>
                <input
                  type="text"
                  value={vehicleReg}
                  onChange={e => setVehicleReg(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Template Document Body */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{selectedTemplate?.title}</h2>
                <p className="text-xs text-gray-400">Category: {selectedTemplate?.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {copied ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <FiDownload /> Download Document
                </button>
              </div>
            </div>

            <div className="p-5 bg-gray-50 dark:bg-zinc-950 rounded-xl border border-gray-200 dark:border-zinc-800 font-mono text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {renderedContent}
            </div>
          </div>
        </div>
      </div>

      {/* Create Template Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Create New Intermediary Template</h3>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Template Title</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Policy Endorsement Notice"
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="Motor Insurance">Motor Insurance</option>
                  <option value="Life & Risk">Life & Risk</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Claims">Claims</option>
                  <option value="Compliance">Compliance</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Template Content (Use tokens like {'{{client_name}}'}, {'{{policy_number}}'})
                </label>
                <textarea
                  required
                  rows={8}
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Enter template text with {{placeholders}}..."
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
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

