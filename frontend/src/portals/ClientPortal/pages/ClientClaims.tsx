import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import { apiRequest } from '../../../lib/api';
import { toast } from 'sonner';
import {
  FiShield,
  FiPhone,
  FiMail,
  FiMapPin,
  FiTruck,
  FiClock,
  FiStar,
  FiPlus,
  FiRefreshCw,
  FiX
} from 'react-icons/fi';
import { IncidentCountdownTimer } from '../../../components/claims/IncidentCountdownTimer';

const LIFECYCLE_STAGES = [
  { step: 1, title: 'Handler Assigned', desc: 'Insurer returns claim number & handler' },
  { step: 2, title: 'Assessment', desc: 'Client takes vehicle for assessment' },
  { step: 3, title: 'Report Shared', desc: 'Assessment goes to insurer & broker' },
  { step: 4, title: 'Repair Quotes', desc: 'Repair quotes go to insurer' },
  { step: 5, title: 'Authorisation', desc: 'Insurer authorises repairs' },
  { step: 6, title: 'Drop-off Date', desc: 'Client picks date for vehicle check-in' },
  { step: 7, title: 'Car Hire Arranged', desc: 'Car hire delivered to repairer' },
  { step: 8, title: 'Weekly Updates', desc: 'Weekly repair updates pushed' },
  { step: 9, title: 'Collection', desc: 'Vehicle collection & car hire return' },
  { step: 10, title: 'Review & Close', desc: 'Client review & claim closure' },
];

const DEFAULT_CLAIMS = [
  {
    id: 'clm-8902',
    reference: 'CLM-SAN-89021',
    type: 'Car Collision & Motor Damage',
    incidentType: 'Car Collision',
    vehicle: '2024 Mercedes-Benz C200 AMG Line (Reg: JH 88 GP)',
    insurer: 'Santam Insurance',
    policyNumber: 'POL-SAN-48820',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentCreatedAt: new Date(Date.now() - (13 * 60 * 60 * 1000 + 24 * 60 * 1000)).toISOString(),
    currentStageIndex: 2,
    stage1_insurerClaimNumber: 'SAN-CLM-881924',
    stage1_claimsHandlerName: 'Lindiwe Khumalo',
    stage1_claimsHandlerPhone: '+27 11 928 4000',
    stage1_claimsHandlerEmail: 'claims@santam.co.za',
    stage1_documentsSubmitted: false,
    stage2_assessmentCentre: 'Santam Drive-In Assessment Centre, 14 Sandton Dr, Sandhurst',
    stage2_assessmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    stage2_assessmentTime: '10:30 AM',
    stage2_assessmentStatus: 'booked',
    description: 'Road intersection impact on Rivonia Road. Left fender and front bumper damaged.',
  }
];

export const ClientClaims = () => {
  const { data: claims, loading, refetch } = useApi<any[]>('/claims');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<
    'new_claim' | 'book_assessment' | 'pick_dropoff' | 'submit_review' | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  // New Claim Form
  const [newClaimForm, setNewClaimForm] = useState({
    insurer: 'Santam Insurance',
    policyNumber: 'POL-SAN-48820',
    type: 'Comprehensive Motor Vehicle Claim',
    vehicle: '2024 Mercedes-Benz C200 AMG Line (Reg: JH 88 GP)',
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  // Assessment Booking Form
  const [assessmentForm, setAssessmentForm] = useState({
    assessmentCentre: 'Santam Drive-In Assessment Centre, 14 Sandton Dr, Sandhurst',
    assessmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    assessmentTime: '10:30 AM',
  });

  // Pick Drop-Off Date Form
  const [dropOffForm, setDropOffForm] = useState({
    dropOffDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    dropOffTime: '08:00 AM',
  });

  // Review Form
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    reviewComment: 'Outstanding service and repair turnaround. The Avis courtesy car was ready on arrival and the finish is impeccable.',
  });

  const displayClaims = (claims && claims.length > 0) ? claims : DEFAULT_CLAIMS;
  const activeClaim = displayClaims.find(c => c.id === selectedClaimId) || displayClaims[0] || null;

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimForm.description) {
      toast.error('Please provide an incident description');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiRequest<any>('/claims', {
        method: 'POST',
        body: JSON.stringify(newClaimForm),
      });
      toast.success(res.message || 'Claim registered! Handler allocated.');
      setActiveModal(null);
      await refetch();
      if (res.data?.id) setSelectedClaimId(res.data.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim) return;
    setSubmitting(true);
    try {
      await apiRequest(`/claims/${activeClaim.id}/stage`, {
        method: 'PUT',
        body: JSON.stringify({
          currentStageIndex: 2,
          stage2_assessmentCentre: assessmentForm.assessmentCentre,
          stage2_assessmentDate: assessmentForm.assessmentDate,
          stage2_assessmentTime: assessmentForm.assessmentTime,
          stage2_assessmentStatus: 'booked',
          stageUpdateTitle: 'Assessment Scheduled',
          stageUpdateMessage: `Drive-in assessment confirmed for ${assessmentForm.assessmentDate} at ${assessmentForm.assessmentTime}.`,
        }),
      });
      toast.success('Drive-in assessment booking confirmed.');
      setActiveModal(null);
      refetch();
    } catch {
      toast.error('Failed to book assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickDropoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim) return;
    setSubmitting(true);
    try {
      await apiRequest(`/claims/${activeClaim.id}/stage`, {
        method: 'PUT',
        body: JSON.stringify({
          currentStageIndex: 7,
          stage6_dropOffDate: dropOffForm.dropOffDate,
          stage6_dropOffTime: dropOffForm.dropOffTime,
          stage6_dropOffConfirmed: true,
          stage7_carHirePickupDate: `${dropOffForm.dropOffDate} ${dropOffForm.dropOffTime}`,
          stage7_carHireStatus: 'active_rental',
          stageUpdateTitle: 'Vehicle Drop-Off & Car Hire Confirmed',
          stageUpdateMessage: `Vehicle drop-off scheduled for ${dropOffForm.dropOffDate} at ${dropOffForm.dropOffTime}. Avis courtesy car will be delivered to repairer.`,
        }),
      });
      toast.success('Drop-off date scheduled and courtesy car delivery confirmed.');
      setActiveModal(null);
      refetch();
    } catch {
      toast.error('Failed to confirm drop-off');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim) return;
    setSubmitting(true);
    try {
      await apiRequest(`/claims/${activeClaim.id}/review`, {
        method: 'POST',
        body: JSON.stringify(reviewForm),
      });
      toast.success('Thank you! Review submitted and claim transaction closed.');
      setActiveModal(null);
      refetch();
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <FiRefreshCw className="animate-spin text-3xl mb-3 text-red-500" />
        <p className="text-sm">Loading comprehensive claims lifecycle...</p>
      </div>
    );
  }

  const currentStep = activeClaim?.currentStageIndex || 1;

  return (
    <div className="space-y-8 pb-12">
      {/* ── HEADER & ACTIONS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/40">
              End-to-End Tracking
            </span>
            <span className="text-xs text-gray-500">Live SLA: Active Monitoring</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Claims Lifecycle Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Full 10-stage progression tracking from incident lodge to insurer authority, car hire, repairs & closeout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveModal('new_claim')}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all"
          >
            <FiPlus /> Lodge New Claim
          </button>
        </div>
      </div>

      {/* ── ACTIVE CLAIM SELECTOR TABS (IF MULTIPLE) ── */}
      {displayClaims && displayClaims.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {displayClaims.map(c => {
            const isSelected = activeClaim?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClaimId(c.id)}
                className={`px-4 py-3 rounded-xl text-left border transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800/60 text-red-600 dark:text-red-400 shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiShield className={isSelected ? 'text-red-600 dark:text-red-400' : 'text-gray-400'} />
                  <span className="font-semibold text-sm">{c.reference}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                    Stage {c.currentStageIndex || 1}/10
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{c.vehicle || c.type}</div>
              </button>
            );
          })}
        </div>
      )}

      {activeClaim ? (
        <div className="space-y-8">
          {/* ── 10-STAGE VISUAL STEPPER TRACKER ── */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiClock className="text-red-600 dark:text-red-400" />
                  Claim Progression Journey ({currentStep} of 10 Stages Completed)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ref: <strong className="text-gray-700 dark:text-gray-300">{activeClaim.reference}</strong> · Insurer Claim #{' '}
                  <strong className="text-red-600 dark:text-red-400">{activeClaim.stage1_insurerClaimNumber || 'Pending'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeClaim.stage10_claimClosed ? (
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    ✓ Claim Closed & Settled
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    ● In Progress (Stage {currentStep})
                  </span>
                )}
              </div>
            </div>

            {/* Stepper Bar Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {LIFECYCLE_STAGES.map(stage => {
                const isPassed = currentStep > stage.step || activeClaim.stage10_claimClosed;
                const isCurrent = currentStep === stage.step && !activeClaim.stage10_claimClosed;

                return (
                  <div
                    key={stage.step}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'bg-red-50/80 dark:bg-red-950/40 border-red-500 dark:border-red-600 shadow-sm ring-2 ring-red-500/20'
                        : isPassed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                        : 'bg-gray-50 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-800 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-red-600 text-white'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-200 dark:bg-zinc-700 text-gray-500'
                        }`}
                      >
                        {isPassed ? '✓' : stage.step}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-wider">
                        {isPassed ? 'DONE' : isCurrent ? 'ACTIVE' : 'NEXT'}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold leading-tight truncate text-gray-900 dark:text-white">
                      {stage.title}
                    </div>
                    <div className="text-[9px] text-gray-500 line-clamp-2 mt-1 leading-tight">
                      {stage.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 48-HOUR STATUTORY DOCUMENT REPORTING COUNTDOWN TIMER ── */}
          <IncidentCountdownTimer
            incidentType={activeClaim.incidentType || 'Car Collision'}
            incidentTitle={activeClaim.vehicle || activeClaim.type || 'Motor Vehicle Claim'}
            incidentTimestamp={activeClaim.incidentCreatedAt || activeClaim.created_at || activeClaim.incidentDate}
            isDocumentSubmitted={activeClaim.stage1_documentsSubmitted || false}
          />

          {/* ── 10-STAGE DETAILED CARDS ACCORDION & WORKFLOW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── LEFT COLUMN (Stages 1 to 5) ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* STAGE 1: INSURER CLAIM NUMBER & HANDLER */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Insurer Claim Number & Assigned Claims Handler
                      </h3>
                      <p className="text-xs text-gray-500">Official Underwriter Lodgement</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-semibold">
                    ✓ Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                    <span className="text-xs text-gray-500">Insurer Claim Number:</span>
                    <div className="text-base font-bold text-red-600 dark:text-red-400 mt-0.5">
                      {activeClaim.stage1_insurerClaimNumber || 'SAN-CLM-881924'}
                    </div>
                    <span className="text-[11px] text-gray-400">Underwriter: {activeClaim.insurer}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                    <span className="text-xs text-gray-500">Assigned Claims Handler:</span>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                      {activeClaim.stage1_claimsHandlerName || 'Lindiwe Khumalo'}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <a
                        href={`tel:${activeClaim.stage1_claimsHandlerPhone || '+27119284000'}`}
                        className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
                      >
                        <FiPhone /> Call Handler
                      </a>
                      <a
                        href={`mailto:${activeClaim.stage1_claimsHandlerEmail || 'claims@santam.co.za'}`}
                        className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:underline flex items-center gap-1"
                      >
                        <FiMail /> Send Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* STAGE 2: VEHICLE ASSESSMENT */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Vehicle Assessment Center & Inspection
                      </h3>
                      <p className="text-xs text-gray-500">Drive-in damage inspection & photographic audit</p>
                    </div>
                  </div>
                  {activeClaim.stage2_assessmentStatus === 'completed' ? (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-semibold">
                      ✓ Inspection Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveModal('book_assessment')}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                    >
                      Book / Reschedule Date
                    </button>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="text-red-600 dark:text-red-400 mt-1 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activeClaim.stage2_assessmentCentre || 'Santam Drive-In Assessment Centre, 14 Sandton Dr, Sandhurst'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Scheduled: {activeClaim.stage2_assessmentDate || '2026-08-30'} at{' '}
                        {activeClaim.stage2_assessmentTime || '10:30 AM'} · Assessor:{' '}
                        {activeClaim.stage2_assessorName || 'Johan Van Der Merwe (Cert #ASS-771)'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STAGE 3: ASSESSMENT REPORT TO INSURER & BROKER */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Assessment Report Submitted to Insurer & Royal Square
                      </h3>
                      <p className="text-xs text-gray-500">Independent assessor damage report & structural safety clearance</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-semibold">
                    ✓ Report Verified
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <div>
                      <span className="text-xs text-gray-500">Damage Valuation:</span>
                      <div className="text-base font-bold text-gray-900 dark:text-white">
                        {activeClaim.stage3_damageAssessedAmount || 'R 48,500.00'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">Safety Status:</span>
                      <div className="text-xs font-semibold text-emerald-600">
                        {activeClaim.stage3_structuralDamage || 'Non-structural · Roadworthy until repair'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-400 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/30">
                    <strong>Assessed Scope:</strong>{' '}
                    {activeClaim.stage3_damageScope ||
                      'Rear bumper cover replacement, rear tailgate skin repair, parking sensor recalibration, paint blend left & right rear quarter panels.'}
                  </div>
                </div>
              </div>

              {/* STAGE 4: REPAIR QUOTES GO TO INSURER */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Repair Quotes Submitted to Insurer
                      </h3>
                      <p className="text-xs text-gray-500">SAMBRA / Factory Accredited Panel Beater Quotes</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-semibold">
                    ✓ Quote Approved
                  </span>
                </div>

                <div className="space-y-2">
                  {(activeClaim.stage4_quotes || [
                    { repairerName: 'Precision Auto Body Sandton (SAMBRA Major Structural)', amount: 'R 48,500.00', estimatedDays: 8, status: 'Approved' },
                    { repairerName: 'Renew-It Sandton (Factory Accredited)', amount: 'R 52,300.00', estimatedDays: 10, status: 'Alternative' }
                  ]).map((q: any, i: number) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        q.status === 'Approved'
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50'
                          : 'bg-gray-50 dark:bg-zinc-800/40 border-gray-200 dark:border-zinc-800 opacity-75'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {q.repairerName}
                          {q.status === 'Approved' && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white">
                              Selected Repairer
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Estimated Turnaround: {q.estimatedDays} Working Days
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-900 dark:text-white">{q.amount}</div>
                        <span className="text-[10px] font-semibold text-gray-500">{q.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 5: INSURER AUTHORISES REPAIRS */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                      5
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Insurer Authorises Repairs & Excess Payable
                      </h3>
                      <p className="text-xs text-gray-500">Official repair authority number & warranty endorsement</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-semibold">
                    ✓ Authorised
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                    <span className="text-[11px] text-gray-500">Authorisation Ref:</span>
                    <div className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                      {activeClaim.stage5_repairAuthorisationNumber || 'AUTH-SAN-2026-9021'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                    <span className="text-[11px] text-gray-500">Authorised Amount:</span>
                    <div className="text-xs font-bold text-emerald-600 mt-0.5">
                      {activeClaim.stage5_authorisedAmount || 'R 48,500.00'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                    <span className="text-[11px] text-gray-500">Basic Excess:</span>
                    <div className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                      {activeClaim.stage5_excessAmount || 'R 3,500.00'}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium">Excess Waiver Applied</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN (Stages 6 to 10 + Real-time Workshop Feed) ── */}
            <div className="space-y-6">
              {/* STAGE 6: PICK VEHICLE DROP-OFF DATE */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                      6
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Client Vehicle Drop-Off Date
                      </h3>
                      <p className="text-xs text-gray-500">Schedule vehicle check-in at repairer</p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500">Scheduled Check-in:</span>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {activeClaim.stage6_dropOffDate || '2026-09-04'} at {activeClaim.stage6_dropOffTime || '08:00 AM'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Repairer: {activeClaim.stage6_repairerAddress || 'Precision Auto Body, 5 Daisy St, Sandown, Sandton'}
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveModal('pick_dropoff')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shrink-0"
                    >
                      {activeClaim.stage6_dropOffConfirmed ? 'Change Date' : 'Select Date'}
                    </button>
                  </div>
                </div>
              </div>

              {/* STAGE 7: COURTESY CAR HIRE ARRANGED */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                      7
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Car Hire & Delivery to Repairer
                      </h3>
                      <p className="text-xs text-gray-500">Avis courtesy car rental coordination</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-semibold">
                    ✓ Arranged
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiTruck className="text-red-600 dark:text-red-400" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {activeClaim.stage7_carHireCompany || 'Avis Rent a Car'}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                      {activeClaim.stage7_carHireVoucher || 'AVIS-RS-992014'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Vehicle: {activeClaim.stage7_carHireClass || 'Group B — VW Polo Vivo 1.4 Automatic'}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Delivery point: Delivered directly to Precision Auto Body Sandton for instant swap on drop-off.
                  </div>
                </div>
              </div>

              {/* STAGE 8: WEEKLY REPAIR UPDATES PUSHED */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                      8
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Weekly Repair Updates Timeline
                      </h3>
                      <p className="text-xs text-gray-500">Live workshop status ({activeClaim.stage8_repairProgressPercent || 75}% Complete)</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden mb-4">
                  <div
                    className="bg-red-600 h-full transition-all duration-500"
                    style={{ width: `${activeClaim.stage8_repairProgressPercent || 75}%` }}
                  />
                </div>

                <div className="space-y-3 relative pl-4 border-l-2 border-red-200 dark:border-red-950">
                  {(activeClaim.stage8_weeklyUpdates || [
                    { week: 'Week 1 (04 Sep)', stage: 'Vehicle Ingest & Stripping', details: 'Vehicle checked in at 08:00. Damaged tailgate & bumper stripped. OEM parts arrived.', date: '2026-09-04', status: 'completed' },
                    { week: 'Week 2 (05 Sep)', stage: 'Panel Beating & Metal Prep', details: 'Tailgate skin aligned on electronic jig. Anti-corrosion primer applied and oven-cured.', date: '2026-09-05', status: 'completed' },
                    { week: 'Week 3 (06 Sep)', stage: 'Spray Booth & Clear Coat', details: 'Computerized robotic color match applied in downdraft spray booth.', date: '2026-09-06', status: 'completed' },
                    { week: 'Week 4 (11 Sep)', stage: 'Assembly & 50-Point Quality Detailing', details: 'Reassembly of radar parking sensors, computerized diagnostics & executive polish.', date: '2026-09-11', status: 'in_progress' }
                  ]).map((u: any, i: number) => (
                    <div key={i} className="relative">
                      <span
                        className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full ${
                          u.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
                        }`}
                      />
                      <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center justify-between">
                        <span>{u.stage}</span>
                        <span className="text-[10px] font-normal text-gray-400">{u.week}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{u.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* STAGE 9: COLLECTION & CAR HIRE RETURN */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                      9
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Vehicle Collection & Hire Car Return
                      </h3>
                      <p className="text-xs text-gray-500">Quality sign-off & courtesy car handover</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-semibold">
                    Ready
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 space-y-1 text-xs">
                  <div className="text-gray-900 dark:text-white font-semibold">
                    Collection Date: {activeClaim.stage9_readyForCollectionDate || '2026-09-11 15:00'}
                  </div>
                  <div className="text-gray-500">
                    Handover: Hand back the Avis courtesy car key at the repairer reception desk when picking up your vehicle.
                  </div>
                  <div className="text-emerald-600 font-medium pt-1">
                    ✓ {activeClaim.stage9_qualityCertificate || 'SAMBRA Golden Shield 3-Year Repair Warranty'}
                  </div>
                </div>
              </div>

              {/* STAGE 10: CLIENT REVIEW & CLAIM CLOSEOUT */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-xs">
                      10
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        Client Review & Transaction Closeout
                      </h3>
                      <p className="text-xs text-gray-500">Rate your claims experience & close transaction</p>
                    </div>
                  </div>
                  {activeClaim.stage10_claimClosed && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-semibold">
                      ✓ Closed
                    </span>
                  )}
                </div>

                {activeClaim.stage10_claimClosed ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      {[...Array(activeClaim.stage10_rating || 5)].map((_, idx) => (
                        <FiStar key={idx} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                      "{activeClaim.stage10_reviewComment || 'Transaction completed satisfactorily.'}"
                    </p>
                    <div className="text-[10px] text-gray-500">
                      Closed on: {new Date(activeClaim.stage10_closedAt || activeClaim.updated_at).toLocaleDateString()} · Broker: Royal Square Financial Services
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Once your vehicle is collected and inspected, submit a brief rating to conclude the claim.
                    </p>
                    <button
                      onClick={() => setActiveModal('submit_review')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                    >
                      <FiStar /> Write Review & Close Claim
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8">
          <FiShield className="mx-auto text-4xl text-gray-400 mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-white">No Active Claims</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-4">
            You do not have any open claims. In the event of an incident or loss, lodge a claim to initiate immediate tracking.
          </p>
          <button
            onClick={() => setActiveModal('new_claim')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium text-xs rounded-xl"
          >
            Lodge a Claim
          </button>
        </div>
      )}

      {/* ── MODAL: LODGE NEW CLAIM ── */}
      {activeModal === 'new_claim' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Lodge New Insurance Claim</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Insurer</label>
                <select
                  value={newClaimForm.insurer}
                  onChange={e => setNewClaimForm({ ...newClaimForm, insurer: e.target.value })}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white"
                >
                  <option>Santam Insurance</option>
                  <option>Discovery Insure</option>
                  <option>Hollard Insurance</option>
                  <option>Old Mutual Insure</option>
                  <option>Guardrisk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Vehicle</label>
                <input
                  type="text"
                  value={newClaimForm.vehicle}
                  onChange={e => setNewClaimForm({ ...newClaimForm, vehicle: e.target.value })}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white"
                  placeholder="e.g. 2024 BMW 320i (Reg: CA 910-221)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Incident Date</label>
                <input
                  type="date"
                  value={newClaimForm.incidentDate}
                  onChange={e => setNewClaimForm({ ...newClaimForm, incidentDate: e.target.value })}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Incident Description & Location</label>
                <textarea
                  rows={3}
                  value={newClaimForm.description}
                  onChange={e => setNewClaimForm({ ...newClaimForm, description: e.target.value })}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white"
                  placeholder="Describe damage, third party details, and street intersection..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 disabled:opacity-50"
                >
                  {submitting ? 'Lodging...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: BOOK ASSESSMENT ── */}
      {activeModal === 'book_assessment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Book Vehicle Assessment</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleBookAssessment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Drive-In Assessment Hub</label>
                <select
                  value={assessmentForm.assessmentCentre}
                  onChange={e => setAssessmentForm({ ...assessmentForm, assessmentCentre: e.target.value })}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white"
                >
                  <option>Santam Drive-In Assessment Centre, 14 Sandton Dr, Sandhurst</option>
                  <option>Discovery Drive-In Hub, Rivonia Rd, Sandton</option>
                  <option>Auto Body Assessment Centre, 5th Ave, Bryanston</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={assessmentForm.assessmentDate}
                    onChange={e => setAssessmentForm({ ...assessmentForm, assessmentDate: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <select
                    value={assessmentForm.assessmentTime}
                    onChange={e => setAssessmentForm({ ...assessmentForm, assessmentTime: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white"
                  >
                    <option>08:30 AM</option>
                    <option>10:00 AM</option>
                    <option>10:30 AM</option>
                    <option>01:30 PM</option>
                    <option>03:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  Confirm Assessment Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PICK DROPOFF DATE ── */}
      {activeModal === 'pick_dropoff' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Schedule Vehicle Drop-Off</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handlePickDropoff} className="space-y-3">
              <p className="text-xs text-gray-500">
                Pick a date to drop off your vehicle at Precision Auto Body Sandton. Your Avis courtesy car will be delivered to the repairer simultaneously.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={dropOffForm.dropOffDate}
                    onChange={e => setDropOffForm({ ...dropOffForm, dropOffDate: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Check-in Time</label>
                  <select
                    value={dropOffForm.dropOffTime}
                    onChange={e => setDropOffForm({ ...dropOffForm, dropOffTime: e.target.value })}
                    className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white"
                  >
                    <option>08:00 AM</option>
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:30 AM</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  Schedule Drop-Off & Car Hire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: SUBMIT REVIEW & CLOSE CLAIM ── */}
      {activeModal === 'submit_review' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Review & Close Claim Transaction</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Overall Experience Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="text-2xl p-1 transition-transform hover:scale-125"
                    >
                      <FiStar
                        className={
                          star <= reviewForm.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300 dark:text-zinc-700'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-500 ml-2">{reviewForm.rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Your Feedback / Review Notes</label>
                <textarea
                  rows={3}
                  value={reviewForm.reviewComment}
                  onChange={e => setReviewForm({ ...reviewForm, reviewComment: e.target.value })}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 text-gray-900 dark:text-white"
                  placeholder="Share your comments on repair quality, car hire, and turnaround time..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                >
                  Submit & Officially Close Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
