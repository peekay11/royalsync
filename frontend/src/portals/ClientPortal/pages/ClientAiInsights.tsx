import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

export const ClientAiInsights = () => {
  const [messages, setMessages] = useState<{ id: number; role: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if(!input) return;
    setMessages([...messages, { id: Date.now(), role: 'user', text: input }]);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-lg font-medium text-gray-800">Ask AI</h2>
        <button className="text-sm text-gray-600 hover:text-red-600 font-medium">Speak to my adviser</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex max-w-[80%] ${msg.role === 'user' ? 'ml-auto' : 'mr-auto'}`}>
            <div className={`px-4 py-3 rounded-2xl text-sm ${
              msg.role === 'user' ? 'bg-red-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input 
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            type="text" placeholder="Ask about your net worth, policies, or coverage..." 
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2.5 text-sm focus:ring-1 focus:ring-red-500"
          />
          <button onClick={handleSend} className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center">
            <FiSend className="text-sm -ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
