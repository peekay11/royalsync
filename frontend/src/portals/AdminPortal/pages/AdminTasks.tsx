import { useState, useEffect } from 'react';
import {
  FiPlus,
  FiCheckSquare,
} from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';
import { toast } from 'sonner';
import { apiRequest } from '../../../lib/api';

export const AdminTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'internal'>('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [adviserNotes, setAdviserNotes] = useState('');
  const [processingStatus, setProcessingStatus] = useState(false);

  const loadData = async () => {
    try {
      const [tsk, reqs] = await Promise.all([
        apiRequest<any[]>('/workflow/tasks').catch(() => []),
        apiRequest<any[]>('/service-requests').catch(() => [])
      ]);
      setTasks(tsk || []);
      setServiceRequests(reqs || []);
    } catch {
      toast.error('Failed to load tasks and service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleTask = async (id: string) => {
    const original = [...tasks];
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'open' : 'completed' } : t));
    try {
      const task = await apiRequest<any>(`/workflow/tasks/${id}/toggle`, { method: 'PUT' });
      toast.success(`Task marked as ${task.status}`);
    } catch {
      setTasks(original);
      toast.error('Failed to update task');
    }
  };

  const handleUpdateServiceRequestStatus = async (id: string, status: string) => {
    setProcessingStatus(true);
    try {
      await apiRequest(`/service-requests/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status,
          adviserNotes: adviserNotes.trim() || `Processed by adviser on ${new Date().toLocaleDateString('en-ZA')}`
        })
      });
      toast.success(`Service request status updated to ${status}`);
      setSelectedRequest(null);
      setAdviserNotes('');
      loadData();
    } catch {
      toast.error('Failed to update service request status');
    } finally {
      setProcessingStatus(false);
    }
  };

  const createTask = async () => {
    const title = window.prompt('Enter new task description:');
    if (!title) return;
    try {
      const task = await apiRequest<any>('/workflow/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, priority: 'normal', status: 'open' })
      });
      setTasks(current => [task, ...current]);
      toast.success('Task created');
    } catch {
      toast.error('Failed to create task');
    }
  };

  if (loading) return (
    <div className="p-16 flex justify-center items-center gap-3 text-gray-500">
      <ClipLoader color="#ef4444" size={28} />
      <span>Loading tasks and service requests...</span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCheckSquare className="text-red-600 w-6 h-6" /> Operations & Tasks Command Board
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Process client service requests (Address, Banking, Border Letters, IRP5, Financial Statements) and internal adviser tasks.
          </p>
        </div>

        <button
          onClick={createTask}
          className="bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" /> New Internal Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          All Items ({tasks.length + serviceRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          Client Service Requests ({serviceRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('internal')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'internal'
              ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-900 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          Internal Tasks ({tasks.length})
        </button>
      </div>

      {/* Client Service Requests Section */}
      {(activeTab === 'all' || activeTab === 'requests') && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Client Service Requests</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Direct self-service requests submitted by policyholders.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              FAIS 29370 Compliant
            </span>
          </div>

          {serviceRequests.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">No client service requests received yet.</p>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {serviceRequests.map(req => (
                <div key={req.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-500 dark:text-gray-400">{req.reference || req.id}</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">{req.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status === 'completed' || req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {req.status || 'submitted'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Client: <strong>{req.clientName || 'Policyholder'}</strong> · ID: {req.idNumber || '8501015800088'} · Mobile: {req.phone || '082 123 4567'}
                    </p>

                    {req.borderCertificateNumber && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                        Clearance Certificate: {req.borderCertificateNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(req)}
                      className="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      Process / Sign Off
                    </button>
                    {req.status !== 'completed' && req.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateServiceRequestStatus(req.id, 'approved')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-sm"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Internal Task Board Section */}
      {(activeTab === 'all' || activeTab === 'internal') && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Internal Adviser Tasks</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Adviser checklist, policy renewals, and CRM follow-ups.</p>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="flex justify-between items-center p-4 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-red-200 dark:hover:border-red-800 transition-colors bg-gray-50/50 dark:bg-gray-900/30">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => toggleTask(task.id)}
                    className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer"
                  />
                  <div>
                    <span className={`text-xs font-medium ${task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                      {task.title}
                    </span>
                    {task.clientName && (
                      <div className="text-[10px] text-gray-500">Client: {task.clientName}</div>
                    )}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                  task.priority === 'high' && task.status !== 'completed'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {task.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Process Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6 space-y-4">
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Process Service Request: {selectedRequest.reference}
            </h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1">
              <div><strong>Task Type:</strong> {selectedRequest.taskType}</div>
              <div><strong>Title:</strong> {selectedRequest.title}</div>
              <div><strong>Client:</strong> {selectedRequest.clientName} ({selectedRequest.idNumber || 'SA ID'})</div>
              <div><strong>Submitted Date:</strong> {selectedRequest.created_at}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Adviser Sign-off Notes & Deliverables:
              </label>
              <textarea
                rows={3}
                value={adviserNotes}
                onChange={e => setAdviserNotes(e.target.value)}
                placeholder="e.g. Verified and approved. Document issued to policyholder vault under FAIS 29370."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processingStatus}
                onClick={() => handleUpdateServiceRequestStatus(selectedRequest.id, 'completed')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                {processingStatus ? 'Processing...' : 'Mark as Completed & Sign Off'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
