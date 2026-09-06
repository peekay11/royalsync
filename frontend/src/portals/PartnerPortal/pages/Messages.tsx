import { useState, useEffect, useRef } from 'react';
import { 
  FiSend, 
  FiPaperclip, 
  FiSearch, 
  FiCheck, 
  FiMessageSquare,
  FiZap,
  FiFileText
} from 'react-icons/fi';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  attachment?: {
    name: string;
    size: string;
  };
}

interface Channel {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'ch-underwriting',
    name: 'Brokerage Underwriting Desk',
    role: 'Commercial Lines Team',
    avatar: 'UD',
    lastMessage: 'Sure, I will upload the fleet telematics schedule by EOD.',
    lastMessageTime: '10:30 AM',
    unreadCount: 0
  },
  {
    id: 'ch-claims',
    name: 'Claims Settlement Liaison',
    role: 'First Notification of Loss',
    avatar: 'CL',
    lastMessage: 'Assessor report approved for CLM-2026-042.',
    lastMessageTime: 'Yesterday',
    unreadCount: 1
  },
  {
    id: 'ch-compliance',
    name: 'FAIS & Compliance Office',
    role: 'Regulatory & FSP Audits',
    avatar: 'CO',
    lastMessage: 'Annual intermediary SLA agreement review due in 30 days.',
    lastMessageTime: '02 Sep',
    unreadCount: 0
  }
];

const INITIAL_MESSAGES_MAP: Record<string, Message[]> = {
  'ch-underwriting': [
    {
      id: 'm-1',
      sender: 'Underwriting Desk',
      text: 'Good morning! Please provide the latest risk inspection schedule for REQ-8902 (Apex Logistics Ltd).',
      time: '09:15 AM',
      isMe: false
    },
    {
      id: 'm-2',
      sender: 'You',
      text: 'We have received the request. We are reviewing the past 3-year loss ratios before quoting binding terms.',
      time: '09:45 AM',
      isMe: true
    },
    {
      id: 'm-3',
      sender: 'Underwriting Desk',
      text: 'Great, client is requesting an expedited turnaround to meet board approval.',
      time: '10:00 AM',
      isMe: false
    },
    {
      id: 'm-4',
      sender: 'You',
      text: 'Sure, I will upload the fleet telematics schedule and final binding quote by EOD.',
      time: '10:30 AM',
      isMe: true
    }
  ],
  'ch-claims': [
    {
      id: 'm-10',
      sender: 'Claims Liaison',
      text: 'Third-party recovery on claim CLM-2026-042 has completed. Subrogation proceeds R 45,000 received.',
      time: 'Yesterday 15:10',
      isMe: false
    }
  ],
  'ch-compliance': [
    {
      id: 'm-20',
      sender: 'Compliance Office',
      text: 'Please ensure your FSP license number and statutory disclosure annexures remain updated in your Setup tab.',
      time: '02 Sep 11:20',
      isMe: false
    }
  ]
};

export const PartnerMessages = () => {
  const [channels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState<string>('ch-underwriting');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('royalsync_partner_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_MESSAGES_MAP;
      }
    }
    return INITIAL_MESSAGES_MAP;
  });

  const [inputText, setInputText] = useState('');
  const [searchChannel, setSearchChannel] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('royalsync_partner_messages', JSON.stringify(messagesMap));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesMap, activeChannelId]);

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const currentMessages = messagesMap[activeChannelId] || [];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !attachedFile) return;

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: 'You',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      attachment: attachedFile || undefined
    };

    setMessagesMap(prev => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] || []), newMsg]
    }));

    setInputText('');
    setAttachedFile(null);

    // Simulate instant automated acknowledgements if it was an inquiry
    if (text.toLowerCase().includes('quote') || text.toLowerCase().includes('schedule') || text.toLowerCase().includes('kyc')) {
      setTimeout(() => {
        const autoReply: Message = {
          id: `m-reply-${Date.now()}`,
          sender: activeChannel.name,
          text: `Acknowledged. The broker representative assigned to ${activeChannel.name} has received this update.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false
        };
        setMessagesMap(prev => ({
          ...prev,
          [activeChannelId]: [...(prev[activeChannelId] || []), autoReply]
        }));
      }, 1200);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setAttachedFile({
        name: file.name,
        size: `${sizeMb} MB`
      });
      toast.success(`Attached ${file.name}`);
    }
  };

  const filteredChannels = channels.filter(c => 
    (c.name || '').toLowerCase().includes((searchChannel || '').toLowerCase()) ||
    (c.role || '').toLowerCase().includes((searchChannel || '').toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8.5rem)] flex border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm animate-fade-in">
      {/* Channels Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-850/50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">Partner Channels</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={searchChannel}
              onChange={e => setSearchChannel(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {filteredChannels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setActiveChannelId(ch.id)}
              className={`w-full p-3.5 text-left transition flex items-start gap-3 ${
                activeChannelId === ch.id 
                  ? 'bg-red-50/70 dark:bg-red-950/30 border-l-4 border-red-600' 
                  : 'hover:bg-gray-100/60 dark:hover:bg-gray-800'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                {ch.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate">{ch.name}</h4>
                  <span className="text-[10px] text-gray-400">{ch.lastMessageTime}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{ch.role}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-1">{ch.lastMessage}</p>
              </div>
              {ch.unreadCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {ch.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active Conversation Thread */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {/* Thread Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-xs">
              {activeChannel.avatar}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">{activeChannel.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                Active SLA Line • Standard turnaround &lt; 2 hours
              </p>
            </div>
          </div>
        </div>

        {/* Quick Quick Actions Bar */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-gray-400 font-semibold uppercase text-[10px] flex items-center gap-1">
            <FiZap className="text-amber-500" /> Quick:
          </span>
          <button
            onClick={() => handleQuickPrompt('Could you please furnish the full 3-year claims loss history?')}
            className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-200 hover:border-red-500 whitespace-nowrap transition"
          >
            Request 3-Yr Loss History
          </button>
          <button
            onClick={() => handleQuickPrompt('Binding quote terms submitted in portal for broker review.')}
            className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-200 hover:border-red-500 whitespace-nowrap transition"
          >
            Terms Submitted Notice
          </button>
          <button
            onClick={() => handleQuickPrompt('Please confirm tracker verification certificate status.')}
            className="px-2.5 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-200 hover:border-red-500 whitespace-nowrap transition"
          >
            Request Telematics Certificate
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentMessages.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiMessageSquare className="mx-auto text-3xl mb-2" />
              No messages in this conversation yet. Send a message below.
            </div>
          ) : (
            currentMessages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[75%] ${msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <span className="text-[11px] text-gray-400 mb-1 px-1">{msg.sender} • {msg.time}</span>
                <div 
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.isMe 
                      ? 'bg-red-600 text-white rounded-br-sm' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.text}

                  {msg.attachment && (
                    <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-xs ${
                      msg.isMe ? 'bg-red-700 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white'
                    }`}>
                      <FiFileText className="text-sm" />
                      <span className="font-medium truncate">{msg.attachment.name}</span>
                      <span className="opacity-80 text-[10px]">({msg.attachment.size})</span>
                    </div>
                  )}
                </div>
                {msg.isMe && (
                  <span className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-0.5 pr-1">
                    Delivered <FiCheck className="text-blue-500" />
                  </span>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Attached file preview chip */}
        {attachedFile && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-750 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
              <FiPaperclip className="text-red-500" />
              <span className="font-semibold">{attachedFile.name}</span>
              <span className="text-gray-400">({attachedFile.size})</span>
            </div>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-xs text-red-600 hover:underline font-medium"
            >
              Remove
            </button>
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <form 
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="Attach Document"
            >
              <FiPaperclip className="text-lg" />
            </button>

            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`Message ${activeChannel.name}...`} 
              className="flex-1 bg-gray-50 dark:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-full px-5 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />

            <button 
              type="submit"
              disabled={!inputText.trim() && !attachedFile}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white flex items-center justify-center transition shadow-sm"
            >
              <FiSend className="text-sm -ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
