import { useEffect, useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';

export const ClientProfile = () => {
  const { data: profile, loading } = useApi<any>('/user/profile');
  const [form, setForm] = useState({ firstName: '', lastName: '', mobile: '' });
  useEffect(() => {
    if (profile?.name) {
      const [firstName = '', ...last] = profile.name.split(' ');
      setForm({ firstName, lastName: last.join(' '), mobile: profile.phone || '' });
    }
  }, [profile]);
  const save = async () => {
    try {
      await apiRequest('/user/profile', { method: 'PUT', body: JSON.stringify(form) });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };
  if (loading) return <div className="p-8 text-gray-500">Loading profile...</div>;
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-normal text-gray-800">My Profile</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Personal Details</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" value={form.firstName} onChange={event => setForm({ ...form, firstName: event.target.value })} className="w-full border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" value={form.lastName} onChange={event => setForm({ ...form, lastName: event.target.value })} className="w-full border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
            <input type="text" disabled value={profile?.idNumber || 'Not configured'} className="w-full border-gray-200 bg-gray-50 rounded-md text-sm text-gray-500" />
            <p className="text-xs text-gray-400 mt-1">Requires adviser approval to change.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
            <input type="text" value={form.mobile} onChange={event => setForm({ ...form, mobile: event.target.value })} className="w-full border-gray-300 rounded-md text-sm" />
          </div>
        </div>
        <div className="mt-6">
          <button onClick={save} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
