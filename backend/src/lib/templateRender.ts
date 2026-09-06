import { prisma } from './prisma';

/**
 * Merge-field engine for document templates.
 *
 * Templates are HTML authored by a Super Admin and may contain:
 *   - scalar fields:  {{ client.firstName }}
 *   - iteration:      {{#each policies}} ... {{ this.policyNumber }} ... {{/each}}
 *
 * Scalar values are HTML-escaped so client data can never break the layout.
 */

export type MergeContext = Record<string, unknown>;

// ─── Merge-field catalog (drives the builder's insert-field picker) ──────────
export const MERGE_FIELDS: { group: string; fields: { token: string; label: string }[] }[] = [
  {
    group: 'Client',
    fields: [
      { token: 'client.fullName', label: 'Full name' },
      { token: 'client.firstName', label: 'First name' },
      { token: 'client.lastName', label: 'Last name' },
      { token: 'client.idNumber', label: 'ID number' },
      { token: 'client.mobile', label: 'Mobile' },
      { token: 'client.email', label: 'Email' },
      { token: 'client.kycStatus', label: 'KYC status' },
      { token: 'client.riskProfile', label: 'Risk profile' },
    ],
  },
  {
    group: 'Adviser & Company',
    fields: [
      { token: 'adviser.name', label: 'Adviser name' },
      { token: 'company', label: 'Company (insurer)' },
      { token: 'broker.name', label: 'Broker / tenant name' },
    ],
  },
  {
    group: 'First policy',
    fields: [
      { token: 'policy.policyNumber', label: 'Policy number' },
      { token: 'policy.type', label: 'Policy type' },
      { token: 'policy.premium', label: 'Premium' },
      { token: 'policy.sumAssured', label: 'Sum assured' },
      { token: 'policy.insurer', label: 'Insurer' },
    ],
  },
  {
    group: 'Date',
    fields: [
      { token: 'date.today', label: "Today's date" },
      { token: 'date.year', label: 'Current year' },
    ],
  },
  {
    group: 'Lists (use inside {{#each policies}} … {{/each}})',
    fields: [
      { token: 'this.policyNumber', label: 'Policy number' },
      { token: 'this.type', label: 'Policy type' },
      { token: 'this.premium', label: 'Premium' },
      { token: 'this.insurer', label: 'Insurer' },
    ],
  },
];

const fmtDate = (d?: Date | null) =>
  d ? new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : '';

const fmtMoney = (n?: number | null) =>
  n == null ? '' : `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── Build the real merge context for a client ───────────────────────────────
export const buildClientContext = async (clientId: string, companyLabel?: string | null): Promise<MergeContext> => {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      tenant: true,
      policies: { include: { insurer: true }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!client) throw new Error('Client not found');

  let adviserName = '';
  if (client.assignedAdviserId) {
    const adviser = await prisma.user.findUnique({ where: { id: client.assignedAdviserId } });
    if (adviser) adviserName = `${adviser.firstName} ${adviser.lastName}`.trim();
  }

  const policies = client.policies.map((p) => ({
    policyNumber: p.policyNumber,
    type: p.type,
    premium: fmtMoney(p.premium),
    sumAssured: fmtMoney(p.sumAssured),
    status: p.status,
    insurer: p.insurer?.name ?? '',
    inceptionDate: fmtDate(p.inceptionDate),
    expiryDate: fmtDate(p.expiryDate),
  }));

  const now = new Date();
  return {
    client: {
      firstName: client.firstName,
      lastName: client.lastName,
      fullName: `${client.firstName} ${client.lastName}`.trim(),
      idNumber: client.idNumber ?? '',
      mobile: client.mobile,
      email: client.email ?? '',
      kycStatus: client.kycStatus,
      riskProfile: client.riskProfile,
    },
    adviser: { name: adviserName },
    company: companyLabel || client.tenant?.name || '',
    broker: { name: client.tenant?.name ?? '' },
    date: { today: fmtDate(now), year: String(now.getFullYear()) },
    policies,
    policy: policies[0] ?? {},
  };
};

// ─── Sample context for the live builder preview (no client selected) ────────
export const sampleContext = (companyLabel?: string | null): MergeContext => ({
  client: {
    firstName: 'Sipho', lastName: 'Nkosi', fullName: 'Sipho Nkosi',
    idNumber: '9001015009087', mobile: '082 555 1234', email: 'sipho@example.co.za',
    kycStatus: 'verified', riskProfile: 'Moderate',
  },
  adviser: { name: 'Thandi Mbeki' },
  company: companyLabel || 'Santam',
  broker: { name: 'Royal Square Financial' },
  date: { today: fmtDate(new Date()), year: String(new Date().getFullYear()) },
  policies: [
    { policyNumber: 'SAN-2024-GG-1234567', type: 'Comprehensive Motor', premium: fmtMoney(1365), sumAssured: fmtMoney(320000), status: 'active', insurer: 'Santam', inceptionDate: '01 Mar 2024', expiryDate: '01 Mar 2027' },
    { policyNumber: 'SAN-2024-HO-7654321', type: 'Home Contents', premium: fmtMoney(540), sumAssured: fmtMoney(180000), status: 'active', insurer: 'Santam', inceptionDate: '15 Jun 2024', expiryDate: '' },
  ],
  policy: { policyNumber: 'SAN-2024-GG-1234567', type: 'Comprehensive Motor', premium: fmtMoney(1365), sumAssured: fmtMoney(320000), insurer: 'Santam' },
});

// ─── Merge engine ────────────────────────────────────────────────────────────
const escapeHtml = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const resolvePath = (ctx: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, ctx);

const replaceScalars = (tpl: string, ctx: unknown): string =>
  tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, path: string) => escapeHtml(resolvePath(ctx, path)));

export const renderMerge = (template: string, context: MergeContext): string => {
  // Iteration blocks first: {{#each collection}} inner {{/each}}
  const withLoops = template.replace(
    /\{\{\s*#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\s*\/each\s*\}\}/g,
    (_m, collectionPath: string, inner: string) => {
      const collection = resolvePath(context, collectionPath);
      if (!Array.isArray(collection)) return '';
      return collection.map((item) => replaceScalars(inner, { ...context, this: item })).join('');
    },
  );
  return replaceScalars(withLoops, context);
};

// ─── Wrap merged body in a print-ready, branded HTML document ────────────────
export const documentHtmlShell = (title: string, company: string, broker: string, bodyHtml: string): string => `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { margin: 22mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #1f2933; font-size: 12pt; line-height: 1.55; margin: 0; }
  .rs-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #c0392b; padding-bottom: 14px; margin-bottom: 26px; }
  .rs-header .brand { font-family: Arial, Helvetica, sans-serif; font-weight: 700; font-size: 15pt; color: #c0392b; letter-spacing: .5px; }
  .rs-header .company { font-family: Arial, Helvetica, sans-serif; text-align: right; font-size: 10pt; color: #52606d; }
  .rs-title { font-family: Arial, Helvetica, sans-serif; font-size: 17pt; font-weight: 700; margin: 0 0 20px; color: #1f2933; }
  h1, h2, h3 { font-family: Arial, Helvetica, sans-serif; color: #1f2933; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11pt; }
  th, td { border: 1px solid #cbd2d9; padding: 7px 10px; text-align: left; }
  th { background: #f5f7fa; font-family: Arial, Helvetica, sans-serif; }
  ul, ol { padding-left: 20px; }
  .rs-footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #cbd2d9; font-family: Arial, Helvetica, sans-serif; font-size: 8.5pt; color: #7b8794; text-align: center; }
</style></head>
<body>
  <div class="rs-header">
    <div class="brand">${escapeHtml(broker || 'Royal Square Financial')}</div>
    <div class="company">${company ? 'Prepared for ' + escapeHtml(company) : ''}</div>
  </div>
  <div class="rs-title">${escapeHtml(title)}</div>
  <div class="rs-body">${bodyHtml}</div>
  <div class="rs-footer">Generated by RoyalSync${company ? ' · ' + escapeHtml(company) : ''} · This document is confidential and subject to FAIS &amp; POPIA.</div>
</body></html>`;
