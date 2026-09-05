import { useEffect, useState } from 'react';
import { FiCheck, FiSave } from 'react-icons/fi';

interface AppPreferences {
  emailNotifications: boolean;
  browserNotifications: boolean;
  compactLayout: boolean;
}

const defaultPreferences: AppPreferences = {
  emailNotifications: true,
  browserNotifications: true,
  compactLayout: false,
};

export const Settings = () => {
  const [preferences, setPreferences] = useState<AppPreferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('royalsync_preferences');
    if (stored) setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
  }, []);

  const updatePreference = (key: keyof AppPreferences) => {
    setSaved(false);
    setPreferences(current => ({ ...current, [key]: !current[key] }));
  };

  const savePreferences = () => {
    localStorage.setItem('royalsync_preferences', JSON.stringify(preferences));
    setSaved(true);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-normal text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage how RoyalSync behaves on this device.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-medium text-gray-800">Notifications</h2>
        <label className="flex items-center justify-between gap-4 text-sm text-gray-700">
          Email notifications
          <input type="checkbox" checked={preferences.emailNotifications} onChange={() => updatePreference('emailNotifications')} className="text-red-600 rounded border-gray-300 focus:ring-red-500" />
        </label>
        <label className="flex items-center justify-between gap-4 text-sm text-gray-700">
          Browser notifications
          <input type="checkbox" checked={preferences.browserNotifications} onChange={() => updatePreference('browserNotifications')} className="text-red-600 rounded border-gray-300 focus:ring-red-500" />
        </label>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-medium text-gray-800">Appearance</h2>
        <label className="flex items-center justify-between gap-4 text-sm text-gray-700">
          Compact layout
          <input type="checkbox" checked={preferences.compactLayout} onChange={() => updatePreference('compactLayout')} className="text-red-600 rounded border-gray-300 focus:ring-red-500" />
        </label>
      </div>

      <button onClick={savePreferences} className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
        {saved ? <FiCheck /> : <FiSave />}
        {saved ? 'Saved' : 'Save settings'}
      </button>
      {saved && <p className="text-sm text-green-700">Your settings are saved on this device.</p>}
    </div>
  );
};
