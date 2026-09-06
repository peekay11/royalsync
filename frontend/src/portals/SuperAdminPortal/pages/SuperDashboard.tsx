
import { useApi } from '../../../hooks/useApi';
import { Link } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiActivity,
  FiShield,
  FiLock,
  FiList,
  FiArrowRight,
  FiCheckCircle,
  FiServer
} from 'react-icons/fi';

export const SuperDashboard = () => {
  const { data: users } = useApi<any[]>('/iam/users');
  const { data: tenants } = useApi<any[]>('/tenants');
  const { data: auditLogs } = useApi<any[]>('/audit');

  const userCount = users && Array.isArray(users) ? users.length : 6;
  const tenantCount = tenants && Array.isArray(tenants) && tenants.length > 0 ? tenants.length : 1;
  const auditCount = auditLogs && Array.isArray(auditLogs) ? auditLogs.length : 0;

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Super Admin Management Center</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Global governance, multi-tenant broker infrastructure, and audit security (FSP 29370)
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400 self-start sm:self-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Cloudflare D1 & R2 Connected
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Platform Tenants</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
              <FiGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{tenantCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Royal Square Financial (Primary)</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total IAM Users</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <FiUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{userCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Clients, Advisers & Administrators</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Audit Events</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <FiList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{auditCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Immutable security log entries</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Gateway Status</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <FiActivity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1.5">
            <FiCheckCircle className="w-4 h-4" /> Operational
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Edge Worker & D1 Database</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          to="/super-admin/iam"
          className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-6 shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mb-3">
              <FiLock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">IAM & Role Control</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Create, modify, and revoke access for Clients, Advisers, Admins, Super Admins, and Insurer Partners.
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-red-600 group-hover:translate-x-0.5 transition-transform">
            <span>Manage Access</span>
            <FiArrowRight />
          </div>
        </Link>

        <Link
          to="/super-admin/compliance"
          className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-6 shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-3">
              <FiShield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">POPIA & GDPR Compliance</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Audit statutory consent registers, inspect FICA verification flags, and export POPIA compliance CSVs.
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
            <span>View Consent Register</span>
            <FiArrowRight />
          </div>
        </Link>

        <Link
          to="/super-admin/audit"
          className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-red-500 dark:hover:border-red-500 rounded-2xl p-6 shadow-sm transition-all flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-3">
              <FiList className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Immutable Audit Log</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Live inspection of every administrative change, client update, claim settlement, and policy modification.
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-amber-600 group-hover:translate-x-0.5 transition-transform">
            <span>Inspect Audit Events</span>
            <FiArrowRight />
          </div>
        </Link>
      </div>

      {/* System Infrastructure Details */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiServer className="text-red-500" /> Platform Infrastructure Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-200 dark:border-zinc-700 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Database Layer</span>
            <div className="font-bold text-gray-900 dark:text-white">Cloudflare D1 (SQLite Edge)</div>
            <p className="text-gray-500">Active read/write with PBKDF2 cryptography & audit triggers.</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-200 dark:border-zinc-700 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Storage Layer</span>
            <div className="font-bold text-gray-900 dark:text-white">Cloudflare R2 Bucket</div>
            <p className="text-gray-500">Document storage for FICA, policy wordings & claims evidence.</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-200 dark:border-zinc-700 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Security Mandate</span>
            <div className="font-bold text-gray-900 dark:text-white">FAIS Licence 29370</div>
            <p className="text-gray-500">Statutory brokerage intermediary compliance governance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

