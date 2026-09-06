import React, { useState, useEffect } from 'react';
import { 
  FiClock, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiUploadCloud, 
  FiFileText, 
  FiCamera, 
  FiShield, 
  FiX 
} from 'react-icons/fi';
import { toast } from 'sonner';

interface IncidentCountdownTimerProps {
  incidentType?: string;
  incidentTitle?: string;
  incidentTimestamp?: string | number | Date;
  isDocumentSubmitted?: boolean;
  onDocumentsSubmitted?: (docs: any) => void;
  className?: string;
}

export const IncidentCountdownTimer: React.FC<IncidentCountdownTimerProps> = ({
  incidentType = 'Car Collision',
  incidentTitle = 'Motor Vehicle Accident',
  incidentTimestamp,
  isDocumentSubmitted: initialSubmitted = false,
  onDocumentsSubmitted,
  className = ''
}) => {
  // 48 hours in milliseconds
  const WINDOW_MS = 48 * 60 * 60 * 1000;

  // Derive start time from incidentTimestamp or default to 14 hours ago for demo
  const [startTime] = useState<number>(() => {
    if (incidentTimestamp) {
      const parsed = new Date(incidentTimestamp).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    // Default: 13 hours and 24 minutes ago
    return Date.now() - (13 * 60 * 60 * 1000 + 24 * 60 * 1000);
  });

  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    const elapsed = Date.now() - startTime;
    return Math.max(0, WINDOW_MS - elapsed);
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(initialSubmitted);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [arNumber, setArNumber] = useState('AR 492/09/2026');
  const [sapsStation, setSapsStation] = useState('SAPS Sandton');
  const [filesCount] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  // Live timer interval updating every 1000ms
  useEffect(() => {
    if (isSubmitted) return;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, WINDOW_MS - elapsed);
      setTimeLeftMs(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isSubmitted]);

  // Convert milliseconds to hours, minutes, seconds
  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const percentageRemaining = Math.min(100, Math.max(0, (timeLeftMs / WINDOW_MS) * 100));
  const isUrgent = hours < 12;
  const isExpired = timeLeftMs <= 0;

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setIsSubmitted(true);
      setSubmitting(false);
      setIsUploadModalOpen(false);
      toast.success('Incident documents & Police AR report submitted successfully within the 48-hour reporting window!');
      if (onDocumentsSubmitted) {
        onDocumentsSubmitted({
          arNumber,
          sapsStation,
          filesCount,
          submittedAt: new Date().toISOString()
        });
      }
    }, 600);
  };

  return (
    <div className={`rounded-2xl border transition-all ${
      isSubmitted
        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
        : isExpired
        ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200'
        : 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/80 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border-amber-300 dark:border-amber-700/60 shadow-sm'
    } p-5 ${className}`}>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Section: Info & Trigger Status */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isSubmitted
                ? 'bg-emerald-600 text-white shadow-sm'
                : isExpired
                ? 'bg-red-600 text-white'
                : 'bg-amber-600 text-white animate-pulse'
            }`}>
              {isSubmitted ? (
                <>
                  <FiCheckCircle className="text-sm" /> 48h Window Compliant
                </>
              ) : isExpired ? (
                <>
                  <FiAlertTriangle className="text-sm" /> 48h Window Expired
                </>
              ) : (
                <>
                  <FiClock className="text-sm" /> 48-Hour Reporting Window
                </>
              )}
            </span>

            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <FiShield className="text-red-600 dark:text-red-400" />
              Under {incidentType || 'Car Collision'} · {incidentTitle}
            </span>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            {isSubmitted
              ? 'All required incident documents (Police AR docket, driver license, and damage photos) were successfully logged within the 48-hour statutory policy window.'
              : isExpired
              ? 'The 48-hour document submission window has passed. Please contact your claims handler immediately to submit an expedited late documentation waiver.'
              : 'Under South African insurance regulations and policy terms, accident documentation (SAPS Police AR docket number, driver licence, and scene photos) must be reported within 48 hours of the incident.'}
          </p>
        </div>

        {/* Right Section: Live Countdown Clock or Verified Badge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-end">
          {isSubmitted ? (
            <div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-800/80 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-sm">
              <FiCheckCircle className="text-xl text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="font-bold">Documents Verified</div>
                <div className="text-[11px] font-normal opacity-80">AR: {arNumber} ({sapsStation})</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center bg-white dark:bg-zinc-800 px-4 py-3 rounded-xl border border-amber-200 dark:border-amber-700/50 shadow-sm min-w-[210px]">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <FiClock className={isUrgent ? 'text-red-500 animate-spin' : 'text-amber-500'} /> Time Remaining
              </span>
              
              <div className="flex items-baseline gap-1 font-mono font-black text-xl text-gray-900 dark:text-white">
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded-md">
                  {String(hours).padStart(2, '0')}
                </span>
                <span className="text-gray-400 text-xs font-sans">h</span>
                <span className="text-amber-500 font-bold">:</span>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded-md">
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className="text-gray-400 text-xs font-sans">m</span>
                <span className="text-amber-500 font-bold">:</span>
                <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-700 rounded-md text-red-600 dark:text-red-400">
                  {String(seconds).padStart(2, '0')}
                </span>
                <span className="text-gray-400 text-xs font-sans">s</span>
              </div>

              {/* Mini Countdown Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    isUrgent ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${percentageRemaining}%` }}
                />
              </div>
            </div>
          )}

          {!isSubmitted && (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full sm:w-auto px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              <FiUploadCloud className="text-base" />
              Report & Submit Docs
            </button>
          )}
        </div>
      </div>

      {/* Required Documents Pill Strip */}
      {!isSubmitted && (
        <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-zinc-700/60 flex flex-wrap items-center gap-2 text-[11px] text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
            <FiFileText className="text-red-500" /> Required within 48h:
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
            1. Police AR Docket Number
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
            2. Driver's Licence Card Scan
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
            3. Vehicle Damage & Scene Photos
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-white/80 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
            4. Third-Party Details
          </span>
        </div>
      )}

      {/* POPUP MODAL: SUBMIT 48-HOUR INCIDENT DOCUMENTS */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-red-600 dark:text-red-400">
                  48-Hour Statutory Window
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Submit Incident Documents & Police AR
                </h3>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleDocumentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    SAPS Police AR Docket Number
                  </label>
                  <input
                    type="text"
                    required
                    value={arNumber}
                    onChange={e => setArNumber(e.target.value)}
                    placeholder="e.g. AR 492/09/2026"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Reporting Police Station
                  </label>
                  <input
                    type="text"
                    required
                    value={sapsStation}
                    onChange={e => setSapsStation(e.target.value)}
                    placeholder="e.g. SAPS Sandton Police Station"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Document Attachments simulation */}
              <div className="space-y-2">
                <label className="block font-semibold text-gray-700 dark:text-gray-300">
                  Attached Documents & Photographs ({filesCount} files ready)
                </label>
                
                <div className="p-3 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-200 dark:border-zinc-700 space-y-2">
                  <div className="flex items-center justify-between text-[11px] p-2 bg-white dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                      <FiFileText className="text-red-500 text-sm" />
                      <span className="font-medium text-gray-900 dark:text-white">saps_accident_report_stamp.pdf</span>
                    </div>
                    <span className="text-gray-400">1.8 MB</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] p-2 bg-white dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                      <FiCamera className="text-blue-500 text-sm" />
                      <span className="font-medium text-gray-900 dark:text-white">vehicle_damage_front_left.jpg</span>
                    </div>
                    <span className="text-gray-400">3.2 MB</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] p-2 bg-white dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700">
                    <div className="flex items-center gap-2">
                      <FiShield className="text-emerald-500 text-sm" />
                      <span className="font-medium text-gray-900 dark:text-white">driver_licence_card_scan.pdf</span>
                    </div>
                    <span className="text-gray-400">950 KB</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
                <FiClock className="text-base shrink-0 mt-0.5" />
                <span>
                  By submitting these documents now, your claim compliance status is registered with the insurer within the required 48-hour period.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  <FiCheckCircle />
                  {submitting ? 'Submitting...' : 'Confirm & Complete 48h Reporting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
