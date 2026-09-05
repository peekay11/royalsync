export const AdminTemplates = () => (
  <div className="space-y-6 max-w-4xl">
    <h1 className="text-2xl font-normal text-gray-800">Templates</h1>
    <div className="grid grid-cols-2 gap-6">
      {['Quote Request', 'Welcome Letter', 'Border Letter', 'Document Checklist'].map(t => (
        <div key={t} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-sm cursor-pointer transition-all">
          <h3 className="font-medium text-gray-900">{t}</h3>
          <p className="text-sm text-gray-500 mt-1">Click to use this template</p>
        </div>
      ))}
    </div>
  </div>
);
