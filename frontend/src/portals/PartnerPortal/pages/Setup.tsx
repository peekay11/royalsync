import { useState, useEffect } from 'react';
import { 
  FiSave, 
  FiRefreshCw, 
  FiCheck, 
  FiShield, 
  FiDollarSign, 
  FiCpu, 
  FiUserCheck 
} from 'react-icons/fi';
import { toast } from 'sonner';

interface PartnerConfig {
  companyName: string;
  fspNumber: string;
  companyReg: string;
  vatNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  webhookUrl: string;
  webhookSecret: string;
  autoQuoteEnabled: boolean;
  activeLines: {
    commercialFleet: boolean;
    propertyAssets: boolean;
    cyberLiability: boolean;
    executiveLife: boolean;
    agribusiness: boolean;
    professionalIndemnity: boolean;
  };
  lineLimits: {
    commercialFleet: number;
    propertyAssets: number;
    cyberLiability: number;
    executiveLife: number;
    agribusiness: number;
    professionalIndemnity: number;
  };
}

const DEFAULT_PARTNER_CONFIG: PartnerConfig = {
  companyName: 'Apex Underwriting Managers (Pty) Ltd',
  fspNumber: 'FSP-49812',
  companyReg: '2018/482910/07',
  vatNumber: '4920192847',
  contactName: 'Johan van der Merwe',
  contactEmail: 'underwriting@apexuma.co.za',
  contactPhone: '+27 11 884 9200',
  bankName: 'First National Bank (FNB)',
  accountHolder: 'Apex Underwriting Trust Acc',
  accountNumber: '62849201948',
  branchCode: '250655',
  accountType: 'Cheque / Current',
  webhookUrl: 'https://api.apexuma.co.za/v1/royalsync/webhook',
  webhookSecret: 'whsec_9a8f7c6e5d4b3a21',
  autoQuoteEnabled: true,
  activeLines: {
    commercialFleet: true,
    propertyAssets: true,
    cyberLiability: true,
    executiveLife: false,
    agribusiness: true,
    professionalIndemnity: true
  },
  lineLimits: {
    commercialFleet: 50000000,
    propertyAssets: 100000000,
    cyberLiability: 20000000,
    executiveLife: 15000000,
    agribusiness: 75000000,
    professionalIndemnity: 30000000
  }
};

export const PartnerSetup = () => {
  const [config, setConfig] = useState<PartnerConfig>(DEFAULT_PARTNER_CONFIG);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'underwriting' | 'settlement' | 'integrations'>('profile');

  useEffect(() => {
    const saved = localStorage.getItem('royalsync_partner_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch {
        // use default
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('royalsync_partner_config', JSON.stringify(config));
      setLoading(false);
      toast.success('Partner underwriting profile and integration settings saved successfully!');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in pb-12">
      {/* Top Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Partner Underwriting Setup</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your underwriting authority parameters, product appetite, banking, and real-time webhook endpoints.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
        >
          {loading ? <FiRefreshCw className="animate-spin text-sm" /> : <FiSave className="text-sm" />}
          Save All Settings
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto pb-1 text-sm font-medium">
        {[
          { id: 'profile', label: 'Company & Contact', icon: FiUserCheck },
          { id: 'underwriting', label: 'Underwriting Lines & Appetite', icon: FiShield },
          { id: 'settlement', label: 'Banking & Settlement', icon: FiDollarSign },
          { id: 'integrations', label: 'Webhooks & Gateway API', icon: FiCpu }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold border-b-2 border-red-600'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="text-base" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Company & Contact */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
              Corporate & Regulatory Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Company Legal Entity Name
                </label>
                <input
                  type="text"
                  required
                  value={config.companyName}
                  onChange={e => setConfig({ ...config, companyName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  FSCA FSP License Number
                </label>
                <input
                  type="text"
                  required
                  value={config.fspNumber}
                  onChange={e => setConfig({ ...config, fspNumber: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Company Registration Number
                </label>
                <input
                  type="text"
                  value={config.companyReg}
                  onChange={e => setConfig({ ...config, companyReg: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  VAT Registration Number
                </label>
                <input
                  type="text"
                  value={config.vatNumber}
                  onChange={e => setConfig({ ...config, vatNumber: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 pt-2">
              Primary Underwriting Liaison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Principal Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={config.contactName}
                  onChange={e => setConfig({ ...config, contactName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  value={config.contactEmail}
                  onChange={e => setConfig({ ...config, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Direct Telephone Number
                </label>
                <input
                  type="text"
                  value={config.contactPhone}
                  onChange={e => setConfig({ ...config, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Underwriting Lines & Capacity */}
        {activeTab === 'underwriting' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Product Lines & Treaty Capacity</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Enable lines your underwriting team is licensed to quote, and configure maximum sum insured per risk.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { key: 'commercialFleet', label: 'Commercial Fleet & Goods In Transit', defaultLimit: 50000000 },
                { key: 'propertyAssets', label: 'Commercial Property & Business Interruption', defaultLimit: 100000000 },
                { key: 'cyberLiability', label: 'Cyber Liability & Data Breach Response', defaultLimit: 20000000 },
                { key: 'executiveLife', label: 'Key-Person & Executive Life / Disability', defaultLimit: 15000000 },
                { key: 'agribusiness', label: 'Agribusiness, Crop Hail & Livestock', defaultLimit: 75000000 },
                { key: 'professionalIndemnity', label: 'Directors & Officers / Professional Indemnity', defaultLimit: 30000000 },
              ].map(line => {
                const isActive = config.activeLines[line.key as keyof typeof config.activeLines];
                const currentLimit = config.lineLimits[line.key as keyof typeof config.lineLimits] || line.defaultLimit;

                return (
                  <div 
                    key={line.key}
                    className={`p-4 rounded-xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isActive 
                        ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60' 
                        : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={e => {
                          setConfig({
                            ...config,
                            activeLines: {
                              ...config.activeLines,
                              [line.key]: e.target.checked
                            }
                          });
                        }}
                        className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{line.label}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {isActive ? 'Active Appetite • Routing Inbound Requests' : 'Disabled / No Appetite'}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Treaty Line Limit:</span>
                        <div className="relative w-44">
                          <span className="absolute left-2.5 top-1.5 text-xs text-gray-400 font-mono">R</span>
                          <input
                            type="number"
                            value={currentLimit}
                            onChange={e => {
                              setConfig({
                                ...config,
                                lineLimits: {
                                  ...config.lineLimits,
                                  [line.key]: Number(e.target.value) || 0
                                }
                              });
                            }}
                            className="w-full pl-7 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-mono text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Banking & Settlement */}
        {activeTab === 'settlement' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Intermediary Commission & Premium Settlement</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Designated trust or corporate bank account for net premium remittances and commission payouts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Financial Institution / Bank
                </label>
                <input
                  type="text"
                  required
                  value={config.bankName}
                  onChange={e => setConfig({ ...config, bankName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  required
                  value={config.accountHolder}
                  onChange={e => setConfig({ ...config, accountHolder: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  required
                  value={config.accountNumber}
                  onChange={e => setConfig({ ...config, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Universal Branch Code
                </label>
                <input
                  type="text"
                  value={config.branchCode}
                  onChange={e => setConfig({ ...config, branchCode: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Account Type
                </label>
                <select
                  value={config.accountType}
                  onChange={e => setConfig({ ...config, accountType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                >
                  <option value="Cheque / Current">Cheque / Current</option>
                  <option value="Trust Account">Trust Account</option>
                  <option value="Corporate Savings">Corporate Savings</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Webhooks & API Integration */}
        {activeTab === 'integrations' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Real-Time Webhooks & Gateway API</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Receive instant JSON payloads when quotes are requested or policy terms are accepted by clients.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Partner Webhook Endpoint URL
                </label>
                <input
                  type="url"
                  value={config.webhookUrl}
                  onChange={e => setConfig({ ...config, webhookUrl: e.target.value })}
                  placeholder="https://api.yourcompany.co.za/v1/webhook"
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  HMAC Signing Secret Key
                </label>
                <input
                  type="text"
                  value={config.webhookSecret}
                  onChange={e => setConfig({ ...config, webhookSecret: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase">Subscribed Event Triggers</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    <span>application.created</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    <span>quote.accepted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCheck className="text-green-500" />
                    <span>claim.lodged</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <FiSave className="text-sm" />
            Save Partner Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
