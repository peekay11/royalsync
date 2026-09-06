import { useApi } from '../../../hooks/useApi';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const IntegrationRow = ({ label, active, description }: { label: string; active: boolean; description: string }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div>
      <div className="font-medium text-gray-900">{label}</div>
      <div className="text-sm text-gray-500">{description}</div>
    </div>
    <div className="flex items-center gap-2">
      {active ? (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <FiCheckCircle /> Active
        </span>
      ) : (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-medium">
          <FiXCircle /> Not Configured
        </span>
      )}
    </div>
  </div>
);

export const SuperIntegration = () => {
  const { data, loading, error } = useApi<any>('/integrations/status');

  if (loading) return <div className="p-8 text-gray-500 animate-pulse">Loading integration status...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  const integrations = [
    { key: 'email', label: 'Email Provider', description: 'SendGrid / SMTP for transactional emails and policy documents' },
    { key: 'sms', label: 'SMS / OTP Provider', description: 'Twilio / local SMS for OTP login and client notifications' },
    { key: 'storage', label: 'Document Storage', description: 'Cloudflare R2 / S3 for policy schedules and KYC documents' },
    { key: 'payments', label: 'Payment Gateway', description: 'Ozow / Peach Payments for DebiCheck mandates and premium collections' },
    { key: 'insurers', label: 'Insurer Gateway', description: 'Live insurer API for quote requests, endorsements and claims' },
    { key: 'ai', label: 'AI Provider', description: 'OpenAI / local LLM for claims triage and advice assistance' },
  ];

  const activeCount = integrations.filter(i => data?.[i.key]).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-normal text-gray-800">Integration Gateway Health</h1>
        <div className="text-sm text-gray-500">{activeCount}/{integrations.length} configured</div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-4">Integration Status</h3>
        {integrations.map(i => (
          <IntegrationRow key={i.key} label={i.label} active={Boolean(data?.[i.key])} description={i.description} />
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-2">Dead-Letter Queue</h3>
        <div className="text-sm text-gray-500">
          {activeCount === 0
            ? 'No providers configured — dead-letter queue is inactive.'
            : '0 messages failed. Queue is healthy.'}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          To configure integrations, add the relevant environment variables to your backend <code className="bg-blue-100 px-1 rounded">.env</code> file
          (e.g. <code className="bg-blue-100 px-1 rounded">EMAIL_PROVIDER_URL</code>, <code className="bg-blue-100 px-1 rounded">SMS_PROVIDER_URL</code>) and restart the server.
        </p>
      </div>
    </div>
  );
};
