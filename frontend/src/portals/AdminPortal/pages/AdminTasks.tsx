import { useState, useEffect } from 'react';
import { FiPlus } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import { toast } from 'sonner';
import { apiRequest } from '../../../lib/api';

export const AdminTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>('/workflow/tasks')
      .then(setTasks)
      .catch(() => toast.error('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const toggleTask = async (id: string) => {
    const original = [...tasks];
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'open' ? 'completed' : 'open' } : t));
    
    try {
      const task = await apiRequest<any>(`/workflow/tasks/${id}/toggle`, { method: 'PUT' });
      toast.success(`Task marked as ${task.status}`);
    } catch(e) {
      setTasks(original);
      toast.error('Failed to update task');
    }
  };

  const createTask = async () => {
    const title = window.prompt('Task title');
    if (!title) return;
    try {
      const task = await apiRequest<any>('/workflow/tasks', { method: 'POST', body: JSON.stringify({ title, priority: 'normal', status: 'open' }) });
      setTasks(current => [task, ...current]);
      toast.success('Task created');
    } catch {
      toast.error('Failed to create task');
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><ClipLoader color="#ef4444" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-normal text-gray-800">Task Board</h1>
        <button onClick={createTask} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
          <FiPlus /> New Task
        </button>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:border-red-200 transition-colors bg-gray-50/50">
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox" 
                  checked={task.status === 'completed'}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer" 
                />
                <div className="flex flex-col">
                  <span className={`font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                task.priority === 'high' && task.status !== 'completed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {task.priority} Priority
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
