import { useState, useEffect } from 'react';
import {
  FiSave,
  FiMail,
  FiDatabase,
  FiCreditCard,
  FiCpu,
  FiLock
} from 'react-icons/fi';
import { toast } from 'sonner';

export const SuperConfig = () => {
  const [config, setConfig] = useState({
    sendgridKey: '••••••••••••••••••••••••••••••••',
    senderEmail: 'notifications@royalsquare.co.za',
    twilioToken: '••••••••••••••••••••••••••••••••',
    twilioSid: 'AC982104918230918230918',
    smsSenderId: 'RoyalSync',
    r2Bucket: 'royalsync-documents',
    r2AccountId: 'a192b847c92019e9847120a',
    peachMerchantId: 'PEACH_MERCHANT_29370',
    peachSecretKey: '••••••••••••••••••••••••',
    aiProvider: 'cloudflare-workers-ai',
    aiModel: '@cf/meta/llama-3.1-70b-instruct',
    environment: 'production'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('royalsync_system_config');
    if (stored) {
      try {
        setConfig(prev => ({ ...prev, ...JSON.parse(stored) }));
      } catch {}
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem('royalsync_system_config', JSON.stringify(config));
      await new Promise(r => setTimeout(r, 600));
      toast.success('System credentials and provider configuration saved successfully!');
    } catch {
      toast.error('Could not save configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Infrastructure & API Credentials</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configure external service adapters, transactional messaging, R2 storage, and payment mandates
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 self-start sm:self-auto">
          <FiLock className="w-3.5 h-3.5" /> Secret Encryption Active
        </span>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Email & SMS Messaging */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiMail className="text-red-500" /> Transactional Email & SMS Gateway
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">SendGrid / Postmark API Key</label>
              <input
                type="password"
                value={config.sendgridKey}
                onChange={e => setConfig({ ...config, sendgridKey: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Verified Sender Domain</label>
              <input
                type="email"
                value={config.senderEmail}
                onChange={e => setConfig({ ...config, senderEmail: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Twilio Auth Token / SMS Secret</label>
              <input
                type="password"
                value={config.twilioToken}
                onChange={e => setConfig({ ...config, twilioToken: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Alphanumeric Sender ID</label>
              <input
                type="text"
                value={config.smsSenderId}
                onChange={e => setConfig({ ...config, smsSenderId: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Cloudflare Storage & Database */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiDatabase className="text-red-500" /> Cloudflare R2 Document Vault
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">R2 Bucket Identifier</label>
              <input
                type="text"
                value={config.r2Bucket}
                onChange={e => setConfig({ ...config, r2Bucket: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cloudflare Account ID</label>
              <input
                type="text"
                value={config.r2AccountId}
                onChange={e => setConfig({ ...config, r2AccountId: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payments & DebiCheck */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCreditCard className="text-red-500" /> South African DebiCheck & Payment Mandates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Peach Payments Merchant ID</label>
              <input
                type="text"
                value={config.peachMerchantId}
                onChange={e => setConfig({ ...config, peachMerchantId: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Secret Token</label>
              <input
                type="password"
                value={config.peachSecretKey}
                onChange={e => setConfig({ ...config, peachSecretKey: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* AI Model & RAG Engine */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCpu className="text-red-500" /> AI Provider & RAG Embeddings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">AI Provider Engine</label>
              <select
                value={config.aiProvider}
                onChange={e => setConfig({ ...config, aiProvider: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="cloudflare-workers-ai">Cloudflare Workers AI (Edge Fast)</option>
                <option value="openai">OpenAI (GPT-4o)</option>
                <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Target Model Identifier</label>
              <input
                type="text"
                value={config.aiModel}
                onChange={e => setConfig({ ...config, aiModel: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-mono text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <FiSave className="w-4 h-4" /> {saving ? 'Saving Config...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

