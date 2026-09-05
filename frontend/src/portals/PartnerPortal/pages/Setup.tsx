import { useState } from 'react';
import { toast } from 'sonner';

export const PartnerSetup = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    servicesOffered: '',
    needsFromUs: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Partner details saved successfully.');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-normal text-gray-800">Account Setup</h1>
        <p className="text-gray-500 mt-2 text-sm">Provide details about your business so we can add you to our database.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Company Name</label>
          <input 
            type="text"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            placeholder="e.g. Acme Corp"
            value={formData.companyName}
            onChange={e => setFormData({...formData, companyName: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Services you offer to us</label>
          <textarea 
            rows={4}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
            placeholder="Describe the services you provide..."
            value={formData.servicesOffered}
            onChange={e => setFormData({...formData, servicesOffered: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">What you need from us</label>
          <textarea 
            rows={4}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
            placeholder="List any requirements or tools you need..."
            value={formData.needsFromUs}
            onChange={e => setFormData({...formData, needsFromUs: e.target.value})}
          />
        </div>

        <button 
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md text-sm transition-colors"
        >
          Save Details
        </button>
      </form>
    </div>
  );
};
