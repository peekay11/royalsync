import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';
import {
  FiShield,
  FiTruck,
  FiClock,
  FiRefreshCw,
  FiX,
  FiEdit,
  FiFilter
} from 'react-icons/fi';

const LIFECYCLE_STAGES = [
  { step: 1, title: 'Handler Assigned', key: 'handler_assigned' },
  { step: 2, title: 'Assessment', key: 'assessment_booked' },
  { step: 3, title: 'Report Shared', key: 'assessment_completed' },
  { step: 4, title: 'Repair Quotes', key: 'quotes_received' },
  { step: 5, title: 'Authorisation', key: 'repairs_authorised' },
  { step: 6, title: 'Drop-off Date', key: 'dropoff_scheduled' },
  { step: 7, title: 'Car Hire Arranged', key: 'car_hire_active' },
  { step: 8, title: 'Weekly Updates', key: 'in_repairs' },
  { step: 9, title: 'Collection', key: 'ready_for_collection' },
  { step: 10, title: 'Review & Close', key: 'settled_closed' },
];

export const AdminClaims = () => {
  const { data: claims, loading, refetch } = useApi<any[]>('/claims');
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'in_repairs' | 'closed'>('all');
  const [submitting, setSubmitting] = useState(false);
  const [modalType, setModalType] = useState<'advance_stage' | 'add_workshop_update' | null>(null);

  // Advance Stage Form
  const [stageForm, setStageForm] = useState({
    targetStage: 8,
    insurerClaimNumber: '',
    claimsHandlerName: '',
    claimsHandlerPhone: '',
    claimsHandlerEmail: '',
    damageAssessedAmount: '',
    selectedRepairer: '',
    authorisedAmount: '',
    carHireVoucher: '',
    stageNotes: '',
  });

  // Workshop Update Form
  const [workshopForm, setWorkshopForm] = useState({
    weekLabel: 'Week 3',
    stageName: 'Spray Booth & Clear Coat',
    details: 'Computerized robotic color match applied in downdraft spray booth.',
    progressPercent: 75,
  });

  const openAdvanceModal = (claim: any) => {
    setSelectedClaim(claim);
    setStageForm({
      targetStage: Math.min((claim.currentStageIndex || 1) + 1, 10),
      insurerClaimNumber: claim.stage1_insurerClaimNumber || '',
      claimsHandlerName: claim.stage1_claimsHandlerName || '',
      claimsHandlerPhone: claim.stage1_claimsHandlerPhone || '',
      claimsHandlerEmail: claim.stage1_claimsHandlerEmail || '',
      damageAssessedAmount: claim.stage3_damageAssessedAmount || 'R 48,500.00',
      selectedRepairer: claim.stage4_selectedRepairer || 'Precision Auto Body Sandton',
      authorisedAmount: claim.stage5_authorisedAmount || 'R 48,500.00',
      carHireVoucher: claim.stage7_carHireVoucher || 'AVIS-RS-992014',
      stageNotes: '',
    });
    setModalType('advance_stage');
  };

  const openWorkshopModal = (claim: any) => {
    setSelectedClaim(claim);
    setWorkshopForm({
      weekLabel: `Week ${(claim.stage8_weeklyUpdates?.length || 0) + 1}`,
      stageName: 'Assembly & 50-Point Quality Detailing',
      details: 'Reassembly of radar parking sensors, computerized diagnostics & executive polish.',
      progressPercent: Math.min((claim.stage8_repairProgressPercent || 50) + 25, 100),
    });
    setModalType('add_workshop_update');
  };

  const handleAdvanceStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;
    setSubmitting(true);
    try {
      const payload: Record<string, any> = {
        currentStageIndex: stageForm.targetStage,
        stageUpdateTitle: `Claim Progressed to Stage ${stageForm.targetStage}`,
        stageUpdateMessage: `Claim ${selectedClaim.reference} has been advanced to ${LIFECYCLE_STAGES[stageForm.targetStage - 1]?.title} by claims operations.`,
      };

      if (stageForm.insurerClaimNumber) payload.stage1_insurerClaimNumber = stageForm.insurerClaimNumber;
      if (stageForm.claimsHandlerName) payload.stage1_claimsHandlerName = stageForm.claimsHandlerName;
      if (stageForm.damageAssessedAmount) payload.stage3_damageAssessedAmount = stageForm.damageAssessedAmount;
      if (stageForm.authorisedAmount) payload.stage5_authorisedAmount = stageForm.authorisedAmount;
      if (stageForm.carHireVoucher) payload.stage7_carHireVoucher = stageForm.carHireVoucher;

      if (stageForm.targetStage === 10) {
        payload.status = 'settled_closed';
        payload.stage10_claimClosed = true;
      } else if (stageForm.targetStage >= 8) {
        payload.status = 'in_repairs';
      } else if (stageForm.targetStage >= 5) {
        payload.status = 'approved';
      }

      await apiRequest(`/claims/${selectedClaim.id}/stage`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      toast.success(`Claim progressed to Stage ${stageForm.targetStage}: ${LIFECYCLE_STAGES[stageForm.targetStage - 1]?.title}`);
      setModalType(null);
      refetch();
    } catch {
      toast.error('Failed to advance claim stage');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddWorkshopUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;
    setSubmitting(true);
    try {
      const currentUpdates = selectedClaim.stage8_weeklyUpdates || [];
      const newUpdate = {
        week: `${workshopForm.weekLabel} (${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })})`,
        stage: workshopForm.stageName,
        details: workshopForm.details,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
      };

      const payload = {
        stage8_weeklyUpdates: [...currentUpdates, newUpdate],
        stage8_repairProgressPercent: workshopForm.progressPercent,
        currentStageIndex: 8,
        status: 'in_repairs',
        stageUpdateTitle: `Workshop Update: ${workshopForm.stageName}`,
        stageUpdateMessage: `Live repair progress updated: ${workshopForm.details} (${workshopForm.progressPercent}% complete).`,
      };

      await apiRequest(`/claims/${selectedClaim.id}/stage`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      toast.success('Live workshop update pushed to client and insurer.');
      setModalType(null);
      refetch();
    } catch {
      toast.error('Failed to push workshop update');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClaims = (claims || []).filter(c => {
    if (activeTab === 'active') return !c.stage10_claimClosed && (c.currentStageIndex || 1) < 8;
    if (activeTab === 'in_repairs') return !c.stage10_claimClosed && (c.currentStageIndex || 1) >= 8;
    if (activeTab === 'closed') return c.stage10_claimClosed || c.status === 'settled_closed';
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <FiRefreshCw className="animate-spin text-3xl mb-3 text-red-500" />
        <p className="text-sm">Loading Claims Operations Command...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
              Operations Board
            </span>
            <span className="text-xs text-gray-500">Underwriter & Repairer Lifecycle Integration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Claims Lifecycle Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage the complete 10-stage claims lifecycle across insurers, assessors, panel beaters, and car rental fleets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-gray-50"
          >
            <FiRefreshCw /> Refresh Data
          </button>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
        <FiFilter className="text-gray-400 text-sm mr-1" />
        {(['all', 'active', 'in_repairs', 'closed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab === 'all'
              ? `All Claims (${claims?.length || 0})`
              : tab === 'active'
              ? 'Assessment & Authority'
              : tab === 'in_repairs'
              ? 'In Workshop & Car Hire'
              : 'Closed & Settled'}
          </button>
        ))}
      </div>

      {/* ── CLAIMS TABLE & OPERATIONS FEED ── */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Reference & Vehicle</th>
                <th className="px-5 py-3.5">Insurer & Handler</th>
                <th className="px-5 py-3.5">10-Stage Progression</th>
                <th className="px-5 py-3.5">Assessment & Quotes</th>
                <th className="px-5 py-3.5">Car Hire & Workshop</th>
                <th className="px-5 py-3.5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 font-normal">
              {filteredClaims.map((claim: any) => {
                const currentStage = claim.currentStageIndex || 1;
                const stageInfo = LIFECYCLE_STAGES[currentStage - 1] || LIFECYCLE_STAGES[0];
                const isClosed = claim.stage10_claimClosed;

                return (
                  <tr key={claim.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                        <FiShield className="text-red-600 dark:text-red-400 shrink-0" />
                        {claim.reference}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{claim.vehicle || claim.type}</div>
                      <span className="text-[10px] text-gray-400">Incident: {claim.incidentDate}</span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{claim.insurer}</div>
                      <div className="text-[11px] text-red-600 dark:text-red-400 font-mono">
                        {claim.stage1_insurerClaimNumber || 'Claim # Pending'}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        Handler: {claim.stage1_claimsHandlerName || 'Lindiwe Khumalo'}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isClosed
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          Stage {currentStage}/10: {stageInfo.title}
                        </span>
                      </div>
                      {/* Mini Stepper progress */}
                      <div className="w-32 bg-gray-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${isClosed ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${(currentStage / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block truncate max-w-[180px]">
                        {stageInfo.key.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {claim.stage3_damageAssessedAmount || 'Assessment Pending'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Repairer: {claim.stage4_selectedRepairer || 'Precision Auto Body'}
                      </div>
                      {claim.stage5_repairAuthorisationNumber && (
                        <div className="text-[10px] text-emerald-600 font-mono mt-0.5">
                          Auth: {claim.stage5_repairAuthorisationNumber}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                        <FiTruck className="text-red-500" />
                        {claim.stage7_carHireCompany || 'Avis Rent a Car'}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500">
                        {claim.stage7_carHireVoucher || 'Voucher Ready'}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        Progress: {claim.stage8_repairProgressPercent || 50}% in workshop
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right space-y-1">
                      <button
                        onClick={() => openAdvanceModal(claim)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all shadow-sm"
                      >
                        <FiEdit /> Advance Stage
                      </button>
                      <button
                        onClick={() => openWorkshopModal(claim)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all block w-full text-center justify-center mt-1"
                      >
                        <FiClock /> Workshop Update
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: ADVANCE STAGE ── */}
      {modalType === 'advance_stage' && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Advance Claim Lifecycle</h3>
                <p className="text-xs text-gray-500">Claim Ref: {selectedClaim.reference}</p>
              </div>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleAdvanceStage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Lifecycle Stage</label>
                <select
                  value={stageForm.targetStage}
                  onChange={e => setStageForm({ ...stageForm, targetStage: Number(e.target.value) })}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white font-semibold"
                >
                  {LIFECYCLE_STAGES.map(s => (
                    <option key={s.step} value={s.step}>
                      Stage {s.step}: {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Insurer Claim #</label>
                  <input
                    type="text"
                    value={stageForm.insurerClaimNumber}
                    onChange={e => setStageForm({ ...stageForm, insurerClaimNumber: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Claims Handler Name</label>
                  <input
                    type="text"
                    value={stageForm.claimsHandlerName}
                    onChange={e => setStageForm({ ...stageForm, claimsHandlerName: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Assessed Damage Amount</label>
                  <input
                    type="text"
                    value={stageForm.damageAssessedAmount}
                    onChange={e => setStageForm({ ...stageForm, damageAssessedAmount: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Authorised Amount</label>
                  <input
                    type="text"
                    value={stageForm.authorisedAmount}
                    onChange={e => setStageForm({ ...stageForm, authorisedAmount: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Avis Car Hire Voucher</label>
                <input
                  type="text"
                  value={stageForm.carHireVoucher}
                  onChange={e => setStageForm({ ...stageForm, carHireVoucher: e.target.value })}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  Confirm Stage Transition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD WORKSHOP UPDATE ── */}
      {modalType === 'add_workshop_update' && selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Push Live Workshop Update</h3>
                <p className="text-xs text-gray-500">Ref: {selectedClaim.reference}</p>
              </div>
              <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleAddWorkshopUpdate} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Week Label</label>
                  <input
                    type="text"
                    value={workshopForm.weekLabel}
                    onChange={e => setWorkshopForm({ ...workshopForm, weekLabel: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Overall Progress %</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={workshopForm.progressPercent}
                    onChange={e => setWorkshopForm({ ...workshopForm, progressPercent: Number(e.target.value) })}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Workshop Stage Name</label>
                <input
                  type="text"
                  value={workshopForm.stageName}
                  onChange={e => setWorkshopForm({ ...workshopForm, stageName: e.target.value })}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Details / Status Description</label>
                <textarea
                  rows={3}
                  value={workshopForm.details}
                  onChange={e => setWorkshopForm({ ...workshopForm, details: e.target.value })}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2 text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  Push Real-Time Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
