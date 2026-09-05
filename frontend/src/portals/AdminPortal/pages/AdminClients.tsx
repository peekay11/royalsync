import { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'sonner';
import { FiPlus } from 'react-icons/fi';

export const AdminClients = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/crm/clients')
      .then(r => r.json())
      .then(d => { setClients(d.data); setLoading(false); });
  }, []);

  const handleAdd = async () => {
    setIsAdding(true);
    try {
      const res = await fetch('http://localhost:5000/api/crm/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'New', lastName: 'Client', mobile: '000 000 0000', riskProfile: 'Low' })
      });
      const data = await res.json();
      if(data.success) {
        setClients([data.data, ...clients]);
        toast.success('Client added successfully');
      }
    } catch(e) {
      toast.error('Failed to add client');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><ClipLoader color="#ef4444" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Clients</h1>
        <button onClick={handleAdd} disabled={isAdding} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50">
          {isAdding ? <ClipLoader size={14} color="#fff" /> : <FiPlus />}
          Quick Add Mock Client
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full text-left text-sm text-gray-600 relative">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Mobile</th>
                <th className="px-6 py-4 font-medium">Risk Profile</th>
                <th className="px-6 py-4 font-medium">KYC Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{client.firstName} {client.lastName}</td>
                  <td className="px-6 py-4">{client.mobile}</td>
                  <td className="px-6 py-4">{client.riskProfile}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      client.kycStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {client.kycStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-red-600 font-medium hover:underline">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
