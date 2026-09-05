import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

export const PartnerMessages = () => {
  const [messages] = useState([
    { id: 1, sender: 'Admin', text: 'Please upload the latest compliance documents.', time: '10:00 AM', isMe: false },
    { id: 2, sender: 'You', text: 'Sure, I will upload them by EOD.', time: '10:30 AM', isMe: true }
  ]);

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50">
        <h2 className="text-lg font-medium text-gray-800">Messages</h2>
        <p className="text-xs text-gray-500">Communicate with our team for updates</p>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col max-w-[70%] ${msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
            <span className="text-xs text-gray-400 mb-1 px-1">{msg.sender} • {msg.time}</span>
            <div className={`px-4 py-2.5 rounded-2xl text-sm ${
              msg.isMe 
                ? 'bg-red-600 text-white rounded-br-sm' 
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <button className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors">
            <FiSend className="text-sm -ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
