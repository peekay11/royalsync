import { useApi } from '../../../hooks/useApi';
import { FiPlus } from 'react-icons/fi';

export const ClientGoals = () => {
  const { data: goals, loading } = useApi<any[]>('/finance/goals');

  if (loading) return <div className="p-8 text-gray-500">Loading goals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Financial Goals</h1>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
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
              <button className="text-sm font-medium text-gray-700 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50">Contribute</button>
              <button className="text-sm font-medium text-gray-700 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50">Ask AI</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
