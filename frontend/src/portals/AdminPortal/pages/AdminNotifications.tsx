import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { FiSend, FiBell, FiUsers, FiCheckCircle, FiTrash2, FiRadio } from 'react-icons/fi';
import { toast } from 'sonner';

export const AdminNotifications = () => {
  const { data: notifications, loading, refetch } = useApi<any[]>('/notifications');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'policy' | 'claim' | 'document' | 'system' | 'advisory'>('system');
  const [priority, setPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [audience, setAudience] = useState('All Policyholders & Mobile Clients');
  const [channel, setChannel] = useState('Push Notification & In-App Alert');
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Please enter both an alert title and message content');
      return;
    }

    setSending(true);
    try {
      await apiRequest('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          category,
          priority,
          audience,
          channel,
          author: 'Admin Office',
          created_at: new Date().toISOString(),
          badgeText: priority === 'Urgent' ? 'URGENT ADMIN ALERT' : 'ADMIN NOTICE'
        })
      });

      toast.success('Alert broadcast dispatched to all client devices and portals!');
      setTitle('');
      setMessage('');
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this alert broadcast?')) return;
    try {
      await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
      toast.success('Alert removed');
      refetch();
    } catch {
      toast.error('Failed to remove alert');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-800 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <FiRadio className="animate-pulse" /> Live Admin Broadcast Console
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Alerts & Push Notifications</h1>
          <p className="text-sm text-red-100 max-w-xl">
            Publish real-time push alerts, compliance notices, and policy updates directly to client smartphone apps and web portals.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-center min-w-[140px]">
          <p className="text-2xl font-black">{notifications?.length || 0}</p>
          <p className="text-xs font-medium text-red-100">Dispatched Alerts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Broadcast Form */}
        <div className="lg:col-span-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100 mb-5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <FiBell size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Compose New Broadcast</h2>
              <p className="text-xs text-gray-400">Send an instant alert to clients</p>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Target Audience
              </label>
              <select
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-800"
              >
                <option value="All Policyholders & Mobile Clients">All Policyholders & Mobile Clients (Global)</option>
                <option value="Active Policyholders">Active Policyholders Only</option>
                <option value="Pending KYC / FICA Clients">Pending KYC / FICA Verification</option>
                <option value="Clients with Open Claims">Clients with Open Accident Claims</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-800"
                >
                  <option value="system">System Notice</option>
                  <option value="policy">Policy / Premium</option>
                  <option value="claim">Claim Updates</option>
                  <option value="document">FICA / Document Alert</option>
                  <option value="advisory">Advisory Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-800"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent / Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Delivery Channel
              </label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-800"
              >
                <option value="Push Notification & In-App Alert">Push Notification + In-App Notification</option>
                <option value="In-App Banner Only">In-App Banner Only</option>
                <option value="SMS Broadcast">SMS Alert</option>
                <option value="Email Newsletter">Email Notification</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Alert Title
              </label>
              <input
                type="text"
                placeholder="e.g. Annual Policy Schedule Available or Severe Weather Alert"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Message Content
              </label>
              <textarea
                rows={4}
                placeholder="Write the alert message that will display on client mobile lock screens and portal banners..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-800 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <FiSend />
              {sending ? 'Broadcasting Alert...' : 'Dispatch Alert to Clients'}
            </button>
          </form>
        </div>

        {/* Live Broadcast Feed */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Broadcast History</h2>
            <button
              onClick={refetch}
              className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">
              Loading broadcast history...
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-200 space-y-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <FiBell size={18} />
              </div>
              <p className="text-sm font-medium text-gray-700">No active broadcasts</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Dispatched alerts and notifications from the form on the left will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {notifications.map(item => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-gray-300 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        item.priority === 'Urgent'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {item.priority || 'Normal'}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete alert"
                      className="text-gray-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{item.title || item.message}</h3>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.message}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <FiUsers size={12} /> {item.audience || 'All Clients'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <FiCheckCircle size={12} /> Sent from Admin
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
