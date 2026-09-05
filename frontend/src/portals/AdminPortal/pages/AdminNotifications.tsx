import { FiSend } from 'react-icons/fi';
export const AdminNotifications = () => (
  <div className="space-y-6 max-w-3xl">
    <h1 className="text-2xl font-normal text-gray-800">Broadcast Notifications</h1>
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
          <select className="w-full border-gray-300 rounded-md text-sm"><option>Email</option><option>WhatsApp</option></select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipients (Bulk)</label>
          <select className="w-full border-gray-300 rounded-md text-sm"><option>All Clients with Active Policies</option></select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea rows={4} className="w-full border-gray-300 rounded-md text-sm" placeholder="Write your message..."></textarea>
        </div>
        <button className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
          <FiSend /> Send Broadcast
        </button>
      </div>
    </div>
  </div>
);
