import { useApi } from '../../../hooks/useApi';
export const SuperIam = () => {
  const { data: users, loading } = useApi<any[]>('/iam/users');
  if(loading) return <div className="p-8 text-gray-500">Loading IAM...</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-normal text-gray-800">Identity & Access Management</h1>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr><th className="px-6 py-3 font-medium">Email</th><th className="px-6 py-3 font-medium">Role</th><th className="px-6 py-3 font-medium text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map(u => (
              <tr key={u.id} className="hover:bg-gray-50"><td className="px-6 py-4">{u.email}</td><td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">{u.role}</span></td><td className="px-6 py-4 text-right"><button className="text-red-600 hover:underline font-medium">Edit</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
