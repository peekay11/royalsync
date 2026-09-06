import React, { useState, useEffect } from 'react';
import {
  FiShield,
  FiCheck,
  FiX,
  FiCheckCircle,
  FiRefreshCw
} from 'react-icons/fi';
import { apiRequest } from '../../lib/api';
import { toast } from 'sonner';

interface LegalPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFramework?: 'POPIA' | 'GDPR' | 'HYBRID_EU';
  onFrameworkUpdated?: (newFramework: 'POPIA' | 'GDPR' | 'HYBRID_EU') => void;
}

const EU_COUNTRIES = [
  'Germany',
  'France',
  'Netherlands',
  'Ireland',
  'Spain',
  'Italy',
  'Portugal',
  'Belgium',
  'Austria',
  'Sweden',
  'Denmark',
  'Finland',
  'Poland',
  'Other EU / EEA Member State'
];

export const LegalPrivacyModal: React.FC<LegalPrivacyModalProps> = ({
  isOpen,
  onClose,
  currentFramework = 'POPIA',
  onFrameworkUpdated
}) => {
  const [selectedFramework, setSelectedFramework] = useState<'POPIA' | 'GDPR' | 'HYBRID_EU'>(currentFramework);
  const [selectedCountry, setSelectedCountry] = useState('Germany');
  const [crossBorderOptIn, setCrossBorderOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'switch' | 'rights' | 'transfer'>('switch');

  useEffect(() => {
    setSelectedFramework(currentFramework);
  }, [currentFramework, isOpen]);

  if (!isOpen) return null;

  const handleSaveFramework = async () => {
    setSubmitting(true);
    try {
      const res = await apiRequest<{ success: boolean; message: string; data: any }>('/user/privacy-framework', {
        method: 'PUT',
        body: JSON.stringify({
          framework: selectedFramework,
          crossBorderTransferOptIn: crossBorderOptIn,
          euCountry: selectedFramework !== 'POPIA' ? selectedCountry : undefined
        })
      });

      toast.success(res.message || 'Legal policy updated successfully!');
      if (onFrameworkUpdated) {
        onFrameworkUpdated(selectedFramework);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update privacy framework');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center border border-red-600/20">
              <FiShield size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Legal & Data Privacy Framework</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                  EU & ZA Compliant
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Switch or upgrade your statutory data protection policy to accompany European Union jurisdictions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('switch')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'switch'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            Choose Policy Jurisdiction
          </button>
          <button
            onClick={() => setActiveTab('rights')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'rights'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            Statutory Rights & DPO
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'transfer'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            EU Cross-Border Safeguards (SCC)
          </button>
        </div>

        {/* Tab 1: Framework Selection */}
        {activeTab === 'switch' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Select the data protection governance model that applies to your policyholder profile. All changes take effect immediately across all underwriting data and encrypted document vaults.
            </p>

            <div className="space-y-3">
              {/* Option 1: South Africa POPIA */}
              <div
                onClick={() => setSelectedFramework('POPIA')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedFramework === 'POPIA'
                    ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇿🇦</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      POPIA — Protection of Personal Information Act
                    </span>
                  </div>
                  {selectedFramework === 'POPIA' && (
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                      <FiCheck />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                  Statutory South African standard (Act No. 4 of 2013). Governs local FAIS financial advisory, FICA KYC record-keeping, and local Insurer underwriting.
                </p>
              </div>

              {/* Option 2: EU GDPR Policy */}
              <div
                onClick={() => setSelectedFramework('GDPR')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedFramework === 'GDPR'
                    ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇪🇺</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      EU GDPR — General Data Protection Regulation
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      Recommended for EU Expats & Residents
                    </span>
                  </div>
                  {selectedFramework === 'GDPR' && (
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                      <FiCheck />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                  European Union Regulation (EU) 2016/679. Provides EU Chapter III rights (Right to Erasure / Right to be Forgotten, Right to Data Portability, 72-hour breach alerts, and EU Representative oversight).
                </p>
              </div>

              {/* Option 3: Dual Transborder Accord */}
              <div
                onClick={() => setSelectedFramework('HYBRID_EU')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedFramework === 'HYBRID_EU'
                    ? 'border-red-600 bg-red-50/40 dark:bg-red-950/20'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌍</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Dual Accord — POPIA (ZA) + EU GDPR International Bridge
                    </span>
                  </div>
                  {selectedFramework === 'HYBRID_EU' && (
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs">
                      <FiCheck />
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                  Unified dual protection package for international policyholders with dual citizenship or multi-jurisdictional assets.
                </p>
              </div>
            </div>

            {/* EU Country Selector if EU GDPR or Hybrid selected */}
            {selectedFramework !== 'POPIA' && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 space-y-3 animate-in fade-in duration-200">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
                  Applicable European Union / EEA Country of Residence
                </label>
                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  {EU_COUNTRIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="crossBorderOptIn"
                    checked={crossBorderOptIn}
                    onChange={e => setCrossBorderOptIn(e.target.checked)}
                    className="mt-0.5 accent-red-600 rounded"
                  />
                  <label htmlFor="crossBorderOptIn" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    Enable encrypted cross-border telemetry with EU Standard Contractual Clauses (SCC Article 46) for insurance settlement processing.
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Statutory Rights */}
        {activeTab === 'rights' && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs mb-2 flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-500" /> EU GDPR Data Subject Rights (Articles 15-22)
              </h4>
              <ul className="space-y-1.5 text-gray-600 dark:text-gray-300 pl-4 list-disc">
                <li><strong>Article 15 (Right of Access):</strong> Obtain confirmation and copy of all personal telemetry.</li>
                <li><strong>Article 16 (Right to Rectification):</strong> Immediate correction of inaccurate profile attributes.</li>
                <li><strong>Article 17 (Right to Erasure):</strong> Request deletion of non-statutory underwriting data ("Right to be Forgotten").</li>
                <li><strong>Article 20 (Data Portability):</strong> Export your complete portfolio in machine-readable JSON/CSV format.</li>
                <li><strong>Article 77 (Lodging a Complaint):</strong> Lodge inquiries directly with your local EU Data Protection Authority (DPA).</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs mb-1">
                Data Protection Officer (DPO) Contact
              </h4>
              <p className="text-gray-500 dark:text-gray-400">
                EU Representative & DPO: <span className="text-red-600 font-mono">dpo-eu@royalsync.co.za</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Physical Representation: RoyalSync EU Privacy Liaison, Dublin 2, Ireland / Brussels, Belgium.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Cross-border Transfers */}
        {activeTab === 'transfer' && (
          <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300">
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 space-y-1.5">
              <span className="font-bold text-blue-900 dark:text-blue-300 block text-xs">
                EU Standard Contractual Clauses (SCCs) Active
              </span>
              <p className="text-[11px] text-blue-800 dark:text-blue-200">
                When transferring policy data between the Republic of South Africa and the European Union, RoyalSync enforces European Commission Implementing Decision (EU) 2021/914 Standard Contractual Clauses with end-to-end TLS 1.3 AES-256 GCM encryption.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-gray-900 dark:text-white block">Statutory FSP Compliance Notice</span>
              <p className="text-[11px] text-gray-500">
                Financial Advisory and Intermediary Services Act (FAIS) and Financial Intelligence Centre Act (FICA) require statutory retention of transaction records for 5 years. GDPR erasure requests apply to auxiliary data without overriding mandatory statutory insurance records.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-zinc-800">
          <div className="text-[11px] text-gray-400">
            Current Active: <strong className="text-gray-700 dark:text-gray-200">{currentFramework}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveFramework}
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <FiRefreshCw className="animate-spin" /> Updating Policy...
                </>
              ) : (
                <>
                  <FiCheck /> Confirm & Apply Legal Policy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
