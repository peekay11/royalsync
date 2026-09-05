import { useApi } from '../../../hooks/useApi';
import { FiPlus } from 'react-icons/fi';
import { apiRequest } from '../../../lib/api';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

export const ClientGoals = () => {
  const { data, loading, error, refetch } = useApi<{ goals: any[] }>('/goals');
  const goals = data?.goals;

  const addGoal = async () => {
    const title = window.prompt('Goal title');
    const target = Number(window.prompt('Target amount'));
    const deadline = window.prompt('Target date (YYYY-MM-DD)');
    if (!title || !Number.isFinite(target) || target <= 0 || !deadline) return;
    try { await apiRequest('/goals', { method: 'POST', body: JSON.stringify({ title, target, current: 0, deadline, status: 'on_track' }) }); toast.success('Goal created'); refetch(); }
    catch { toast.error('Could not create goal'); }
  };

  const contribute = async (goal: any) => {
    const amount = Number(window.prompt('Contribution amount'));
    if (!Number.isFinite(amount) || amount <= 0) return;
    try { await apiRequest(`/goals/${goal.id}`, { method: 'PUT', body: JSON.stringify({ current: Number(goal.current || 0) + amount }) }); toast.success('Contribution saved'); refetch(); }
    catch { toast.error('Could not save contribution'); }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading goals...</div>;
  if (error) return <div className="p-8 space-y-3"><p className="text-red-600">{error}</p><button onClick={refetch} className="border rounded-lg px-4 py-2">Retry</button></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Financial Goals</h1>
        <button onClick={addGoal} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
          <FiPlus /> Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals?.map(goal => (
          <div key={goal.id} className="border border-gray-200 rounded-xl p-6 bg-white hover:shadow-sm transition-shadow">
            <h3 className="font-medium text-gray-900 mb-2">{goal.title}</h3>
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>R {goal.current.toLocaleString()}</span>
              <span>Target: R {goal.target.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(goal.current / goal.target) * 100}%` }}></div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => contribute(goal)} className="text-sm font-medium text-gray-700 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50">Contribute</button>
              <button className="text-sm font-medium text-gray-700 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50">Ask AI</button>
            </div>
          </div>
        ))}
      </div>
      {goals?.length ? <div className="border border-gray-200 rounded-xl p-6 bg-white"><h2 className="text-lg font-medium text-gray-800 mb-4">Goal progress</h2><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={goals}><CartesianGrid strokeDasharray="3 3" stroke="#eee" /><XAxis dataKey="title" /><YAxis /><Tooltip /><Bar dataKey="current" fill="#d92820" name="Current" /><Bar dataKey="target" fill="#c9a84c" name="Target" /></BarChart></ResponsiveContainer></div></div> : null}
    </div>
  );
};
