import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { useState } from 'react';
import { toast } from 'sonner';
export const SuperIam = () => {
  const { data: users, loading } = useApi<any[]>('/iam/users');
  const [items, setItems] = useState<any[]>([]);
  const currentUsers = items.length ? items : users || [];
  const createUser = async () => {
    const email = window.prompt('User email');
    const password = window.prompt('Temporary password (minimum 12 characters)');
    const role = window.prompt('Role: ADMIN, ADVISER, CLIENT, PARTNER, or SUPER_ADMIN');
    if (!email || !password || !role) return;
    try {
      const user = await apiRequest<any>('/iam/users', { method: 'POST', body: JSON.stringify({ email, password, role }) });
      setItems(current => [user, ...current]);
      toast.success('User created');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    }
  };
  const updateRole = async (user: any, role: string) => {
    try {
      const updated = await apiRequest<any>(`/iam/users/${user.id}`, { method: 'PUT', body: JSON.stringify({ role }) });
      setItems(currentUsers.map(item => item.id === user.id ? { ...item, ...updated } : item));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };
  const deactivate = async (user: any) => {
    try {
      await apiRequest(`/iam/users/${user.id}`, { method: 'DELETE' });
      setItems(currentUsers.map(item => item.id === user.id ? { ...item, status: 'deactivated' } : item));
      toast.success('User deactivated');
    } catch { toast.error('Failed to deactivate user'); }
  };
  if(loading) return <div className="p-8 text-gray-500">Loading IAM...</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-normal text-gray-800">Identity & Access Management</h1><button onClick={createUser} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm">Create User</button></div>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr><th className="px-6 py-3 font-medium">Email</th><th className="px-6 py-3 font-medium">Role</th><th className="px-6 py-3 font-medium text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentUsers.map(u => (
              <tr key={u.id} className="hover:bg-gray-50"><td className="px-6 py-4">{u.email}</td><td className="px-6 py-4"><select value={u.role} onChange={event => updateRole(u, event.target.value)} className="border rounded px-2 py-1 text-xs">{['SUPER_ADMIN', 'ADMIN', 'ADVISER', 'CLIENT', 'PARTNER'].map(role => <option key={role}>{role}</option>)}</select></td><td className="px-6 py-4 text-right"><button onClick={() => deactivate(u)} disabled={u.status === 'deactivated'} className="text-red-600 hover:underline font-medium disabled:text-gray-400">{u.status === 'deactivated' ? 'Deactivated' : 'Deactivate'}</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
