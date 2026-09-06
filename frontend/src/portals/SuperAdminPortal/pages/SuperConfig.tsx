import { useState, useEffect } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';
import { FiSave } from 'react-icons/fi';

const CONFIG_LABELS: Record<string, { label: string; description: string; type?: string }> = {
  email_provider: { label: 'Email Provider', description: 'sendgrid, smtp, mailgun' },
  sms_provider: { label: 'SMS Provider', description: 'twilio, local-sms, bulksms' },
  ai_provider: { label: 'AI Provider', description: 'openai, anthropic, local' },
  storage_provider: { label: 'Storage Provider', description: 'cloudflare_r2, aws_s3' },
  payment_gateway: { label: 'Payment Gateway', description: 'ozow, peachpayments, payfast' },
  default_currency: { label: 'Default Currency', description: 'ZAR, USD, EUR' },
  platform_name: { label: 'Platform Name', description: 'Displayed in the UI' },
  support_email: { label: 'Support Email', description: 'Support contact address', type: 'email' },
};

export const SuperConfig = () => {
  const { data: settings, loading, error, refetch } = useApi<any[]>('/settings');
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s: any) => { map[s.key] = s.value; });
      setValues(map);
    }
  }, [settings]);

  const save = async (key: string) => {
    setSaving(key);
    try {
      await apiRequest(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value: values[key] }) });
      toast.success(`${CONFIG_LABELS[key]?.label ?? key} saved`);
      refetch();
    } catch {
      toast.error('Failed to save setting');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading config...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const knownKeys = Object.keys(CONFIG_LABELS);
  const allKeys = [...new Set([...knownKeys, ...(settings?.map((s: any) => s.key) ?? [])])];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-normal text-gray-800">System Configuration</h1>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {allKeys.map(key => {
          const meta = CONFIG_LABELS[key];
          return (
            <div key={key} className="p-5 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-800">{meta?.label ?? key}</label>
                {meta?.description && <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type={meta?.type ?? 'text'}
                  value={values[key] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-52"
                  placeholder={`Enter ${meta?.label ?? key}...`}
                />
                <button
                  onClick={() => save(key)}
                  disabled={saving === key}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 disabled:opacity-50 transition-colors"
                  title="Save"
                >
                  <FiSave size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-700">
          These values configure the platform display and integration references. Actual credentials and API keys must be set as environment variables on the server — never stored here.
        </p>
      </div>
    </div>
  );
};
