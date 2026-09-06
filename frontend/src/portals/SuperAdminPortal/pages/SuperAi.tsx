import { useApi } from '../../../hooks/useApi';
import { FiCpu, FiAlertCircle } from 'react-icons/fi';

export const SuperAi = () => {
  const { data: status } = useApi<any>('/integrations/status');
  const aiEnabled = Boolean(status?.ai);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">AI Management</h1>

      {/* Status card */}
      <div className={`border rounded-xl p-5 flex items-center gap-4 ${aiEnabled ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <FiCpu className={`text-2xl ${aiEnabled ? 'text-green-600' : 'text-amber-600'}`} />
        <div>
          <div className={`font-medium ${aiEnabled ? 'text-green-700' : 'text-amber-700'}`}>
            {aiEnabled ? 'AI Provider Connected' : 'AI Provider Not Configured'}
          </div>
          <div className={`text-sm ${aiEnabled ? 'text-green-600' : 'text-amber-600'}`}>
            {aiEnabled
              ? 'The AI endpoint is active. Clients and advisers can use AI Insights.'
              : 'Set the AI_PROVIDER_URL environment variable to enable AI features.'}
          </div>
        </div>
      </div>

      {/* Vector corpus */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-2">Vector Document Corpus</h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload policy wordings, product disclosure statements, and FAIS guidelines for RAG-based AI advice assistance.
        </p>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <FiAlertCircle className="mx-auto text-3xl text-gray-300 mb-2" />
          <p className="text-sm text-gray-400">Document upload requires storage integration (Cloudflare R2 / S3).</p>
          <p className="text-xs text-gray-400 mt-1">Configure storage in System Config to enable this feature.</p>
        </div>
      </div>

      {/* Prompt guidelines */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-medium text-gray-900 mb-2">System Prompt Template</h3>
        <p className="text-sm text-gray-500 mb-3">Base instructions given to the AI for all client conversations.</p>
        <textarea
          rows={5}
          readOnly
          defaultValue="You are a knowledgeable South African financial adviser assistant for Royal Square Financial. You help clients understand their insurance policies, goals, and financial planning. Always recommend consulting a licensed human adviser for specific advice. Do not make specific product recommendations without human review."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-gray-50 resize-none"
        />
        <p className="text-xs text-gray-400 mt-2">Contact your system administrator to update the system prompt.</p>
      </div>
    </div>
  );
};
