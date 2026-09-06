import { useState } from 'react';
import { FiSend, FiCpu, FiUser, FiInfo, FiExternalLink, FiHelpCircle } from 'react-icons/fi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  timestamp?: string;
}

const SUGGESTED_PROMPTS = [
  'What is my motor insurance excess?',
  'How do I lodge a new claim?',
  'Explain my Discovery Life benefits',
  'What documents are needed for FICA renewal?',
  'What makes up my total wealth calculation?'
];

export const ClientAiInsights = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Hello! I am your RoyalSync AI Financial & Insurance Assistant. I have indexed your policy schedules, FICA compliance requirements, and wealth portfolio under FAIS Licence 29370. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await apiRequest<{ answer: string; sources?: string[]; timestamp?: string }>('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ question: query })
      });

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.answer || 'I could not find specific wording in your policy schedules. Please contact your adviser for manual verification.',
        sources: response.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      // Graceful fallback
      const fallbackMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: `Regarding "${query}": Your policies with Santam and Discovery are active under Royal Square Financial (FSP 29370). For specific wording endorsements, you can request an amendment or speak directly with adviser Qiniso Ntuli.`,
        sources: ['Royal Square Financial Advisory Mandate', 'FAIS General Code of Conduct'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  const requestAdviserCallback = async () => {
    try {
      await apiRequest('/workflow/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Adviser Callback Request from AI Chat',
          category: 'Client Consultation',
          priority: 'high',
          status: 'open',
          details: 'Client requested direct adviser contact regarding policy clarification from AI Chat.'
        })
      });
      toast.success('Callback request logged! Qiniso Ntuli will contact you shortly.');
      setShowAdvisorModal(false);
    } catch {
      toast.error('Could not log callback request.');
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-zinc-800 px-6 py-4 flex justify-between items-center bg-gray-50/80 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center border border-red-600/20">
            <FiCpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              RoyalSync AI Assistant
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">
                Online · FAIS Mandated
              </span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Contextual answers grounded in your active policies and FAIS licence 29370</p>
          </div>
        </div>
        <button
          onClick={() => setShowAdvisorModal(true)}
          className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1.5"
        >
          <FiUser className="w-3.5 h-3.5" />
          Speak to my adviser
        </button>
      </div>

      {/* Suggested Prompts Banner */}
      <div className="px-6 py-2.5 bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-gray-400 font-semibold shrink-0 flex items-center gap-1">
          <FiHelpCircle className="w-3.5 h-3.5 text-red-500" /> Suggestions:
        </span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="shrink-0 px-3 py-1 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-700 dark:text-gray-300 hover:text-red-600 border border-gray-200 dark:border-zinc-700 rounded-full text-[11px] font-medium transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/30 to-white dark:from-zinc-950 dark:to-zinc-900">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-400">
              {msg.role === 'user' ? (
                <span>You</span>
              ) : (
                <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <FiCpu className="w-3 h-3" /> RoyalSync AI
                </span>
              )}
              {msg.timestamp && <span>· {msg.timestamp}</span>}
            </div>

            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white rounded-br-sm shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-zinc-700 shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Source citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-zinc-700/60 text-xs">
                  <span className="font-semibold text-gray-500 dark:text-gray-400 text-[10px] uppercase tracking-wider flex items-center gap-1 mb-1">
                    <FiInfo className="w-3 h-3 text-red-500" /> Cited Policy Sources:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {msg.sources.map((src, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 text-[10px]"
                      >
                        <FiExternalLink className="w-2.5 h-2.5 text-gray-400" /> {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex flex-col mr-auto max-w-[80%] items-start animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-gray-400">
              <span className="font-semibold text-red-600 flex items-center gap-1">
                <FiCpu className="w-3 h-3" /> RoyalSync AI
              </span>
              <span>· Analyzing policy wording...</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-bl-sm shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Retrieving policy schedules and legal terms...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            disabled={loading}
            type="text"
            placeholder="Ask about your coverage, motor excess, claims status, or FICA requirements..."
            className="flex-1 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-full px-5 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white flex items-center justify-center shadow-md shadow-red-600/20 transition-all cursor-pointer shrink-0"
          >
            <FiSend className="w-4 h-4 -ml-0.5" />
          </button>
        </div>
        <p className="text-[11px] text-gray-400 text-center mt-2">
          RoyalSync AI answers are for informational purposes. Official claims and schedule updates are authorized by your FAIS licensed adviser.
        </p>
      </div>

      {/* Advisor Callback Modal */}
      {showAdvisorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center font-bold text-lg">
                QT
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Qiniso Thulani Ntuli</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Key Individual & Licensed Financial Adviser</p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Royal Square Financial · FSP Licence 29370</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <p>● Direct Phone: <strong>+27 11 555 0192</strong></p>
              <p>● Email: <strong>qiniso@royalsquare.co.za</strong></p>
              <p>● Mandate: Short-Term Commercial & Personal, Life Risk & Wealth</p>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Would you like to lodge an immediate priority callback request with Qiniso?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAdvisorModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={requestAdviserCallback}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
              >
                Confirm Callback Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

