export const SuperConfig = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-normal text-gray-800">System Config</h1>
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-medium text-gray-900 mb-4">API Credentials</h3>
      <div className="space-y-3">
        <input type="text" placeholder="SendGrid API Key" className="w-full max-w-md border-gray-300 rounded-md text-sm" />
        <input type="text" placeholder="Twilio Auth Token" className="w-full max-w-md border-gray-300 rounded-md text-sm" />
      </div>
    </div>
  </div>
);
