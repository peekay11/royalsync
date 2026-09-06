import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { AuthController } from './controllers/iam/AuthController';
import { UserController } from './controllers/iam/UserController';
import { ClientController } from './controllers/crm/ClientController';
import { LeadController } from './controllers/crm/LeadController';
import { PolicyController } from './controllers/policies/PolicyController';
import { ClaimController } from './controllers/claims/ClaimController';
import { TaskController } from './controllers/workflow/TaskController';
import { ApplicationController } from './controllers/sales/ApplicationController';
import { ClientDataController } from './controllers/mobile/ClientDataController';
import { DashboardController } from './controllers/DashboardController';
import { ReportsController } from './controllers/ReportsController';
import { AuditController } from './controllers/AuditController';
import { TenantController } from './controllers/org/TenantController';
import { InsurerController } from './controllers/ai_partners/InsurerController';
import { KycController } from './controllers/compliance/KycController';
import { MessagingController } from './controllers/messaging/MessagingController';
import { TemplateController } from './controllers/TemplateController';
import { requireAuth, requireRole } from './middleware/auth';
import { prisma } from './lib/prisma';
import type { AuthRequest } from './types/auth';

export const createApp = () => {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGINS || '*').split(',').map(v => v.trim());
  app.use(helmet());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: '2mb' }));

  const auth = new AuthController();
  const users = new UserController();
  const clients = new ClientController();
  const leads = new LeadController();
  const policies = new PolicyController();
  const claims = new ClaimController();
  const tasks = new TaskController();
  const apps = new ApplicationController();
  const clientData = new ClientDataController();
  const dashboard = new DashboardController();
  const reports = new ReportsController();
  const auditCtrl = new AuditController();
  const tenants = new TenantController();
  const insurers = new InsurerController();
  const kyc = new KycController();

  const messaging = new MessagingController();
  const templates = new TemplateController();

  // ─── Health ───────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'royalsync-api', db: 'prisma-sqlite' }));

  // ─── Auth (public) ────────────────────────────────────────────────────────
  app.post('/api/auth/login', auth.login);
  app.post('/api/auth/login-id', auth.loginById);
  app.post('/api/auth/send-otp', auth.sendOtp);
  app.post('/api/auth/register', auth.register);
  app.post('/api/auth/bootstrap-admin', auth.bootstrapAdmin);

  // ─── Authenticated routes ─────────────────────────────────────────────────
  app.use('/api', requireAuth);

  // ─── Dashboards ───────────────────────────────────────────────────────────
  app.get('/api/dashboard/super', requireRole('SUPER_ADMIN'), dashboard.superDashboard);
  app.get('/api/dashboard/admin', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), dashboard.adminDashboard);
  app.get('/api/dashboard/client', requireRole('CLIENT'), dashboard.clientDashboard);

  // ─── IAM ─────────────────────────────────────────────────────────────────
  app.get('/api/iam/users', requireRole('SUPER_ADMIN', 'ADMIN'), users.getUsers);
  app.post('/api/iam/users', requireRole('SUPER_ADMIN', 'ADMIN'), users.createUser);
  app.put('/api/iam/users/:id', requireRole('SUPER_ADMIN', 'ADMIN'), users.updateUser);
  app.delete('/api/iam/users/:id', requireRole('SUPER_ADMIN'), users.deleteUser);

  // ─── CRM – Clients ────────────────────────────────────────────────────────
  app.get('/api/crm/clients', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), clients.getClients);
  app.post('/api/crm/clients', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), clients.createClient);
  app.get('/api/crm/clients/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), clients.getClient);
  app.put('/api/crm/clients/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), clients.updateClient);

  // ─── CRM – Leads ──────────────────────────────────────────────────────────
  app.get('/api/crm/leads', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), leads.getLeads);
  app.get('/api/crm/leads/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), async (req: AuthRequest, res) => {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params['id'] as string },
      include: { leadNotes: { orderBy: { createdAt: 'asc' } } }
    });
    if (!lead) { res.status(404).json({ success: false, error: 'Lead not found' }); return; }
    res.json({ success: true, data: lead });
  });
  app.post('/api/crm/leads', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), leads.createLead);
  app.put('/api/crm/leads/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), async (req: AuthRequest, res) => {
    const id = req.params['id'] as string;
    const { firstName, lastName, email, mobile, interest, notes } = req.body as Record<string, string | undefined>;
    const lead = await prisma.lead.update({
      where: { id },
      data: { firstName, lastName, email, mobile, interest, notes, updatedAt: new Date() },
      include: { leadNotes: true }
    });
    res.json({ success: true, data: lead });
  });
  app.put('/api/crm/leads/:id/status', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), leads.updateLeadStatus);
  app.post('/api/crm/leads/:id/notes', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), leads.addLeadNote);
  app.delete('/api/crm/leads/:id', requireRole('SUPER_ADMIN', 'ADMIN'), leads.deleteLead);

  // ─── Sales – Applications ─────────────────────────────────────────────────
  app.get('/api/sales/applications', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER', 'CLIENT'), apps.getApplications);
  app.post('/api/sales/applications', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), apps.createApplication);
  app.put('/api/sales/applications/:id/status', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), apps.updateApplicationStatus);
  // Legacy route used by existing frontend
  app.put('/api/sales/applications/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), apps.updateApplicationStatus);

  // ─── Policies ─────────────────────────────────────────────────────────────
  app.get('/api/policies', policies.getPolicies);
  app.post('/api/policies', requireRole('SUPER_ADMIN', 'ADMIN'), policies.createPolicy);
  app.put('/api/policies/:id', requireRole('SUPER_ADMIN', 'ADMIN'), policies.updatePolicy);

  // ─── Claims ───────────────────────────────────────────────────────────────
  app.get('/api/claims', claims.getClaims);
  app.get('/api/claims/:id', async (req: AuthRequest, res) => {
    const id = req.params['id'] as string;
    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        client: true,
        policy: { include: { insurer: true } },
        claimNotes: { orderBy: { createdAt: 'asc' } }
      }
    });
    if (!claim) { res.status(404).json({ success: false, error: 'Claim not found' }); return; }
    res.json({ success: true, data: claim });
  });
  app.post('/api/claims', claims.createClaim);
  app.put('/api/claims/:id/status', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), claims.updateClaimStatus);
  app.put('/api/claims/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), claims.updateClaimStatus);

  // ─── Tasks ────────────────────────────────────────────────────────────────
  app.get('/api/workflow/tasks', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), tasks.getTasks);
  app.post('/api/workflow/tasks', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), tasks.createTask);
  app.put('/api/workflow/tasks/:id/toggle', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), tasks.toggleTask);
  app.put('/api/workflow/tasks/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), tasks.updateTask);

  // ─── Claim notes ──────────────────────────────────────────────────────────
  app.post('/api/claims/:id/notes', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), async (req: AuthRequest, res) => {
    const claimId = req.params['id'] as string;
    const { content } = req.body as { content?: string };
    if (!content?.trim()) { res.status(400).json({ success: false, error: 'Content required' }); return; }
    const note = await prisma.claimNote.create({
      data: { claimId, authorId: req.user?.id ?? null, content: content.trim() }
    });
    res.json({ success: true, data: note });
  });
  app.get('/api/claims/:id/notes', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), async (req: AuthRequest, res) => {
    const notes = await prisma.claimNote.findMany({
      where: { claimId: req.params['id'] as string },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: notes });
  });

  // ─── Lead notes ───────────────────────────────────────────────────────────
  app.post('/api/crm/leads/:id/notes', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), async (req: AuthRequest, res) => {
    const leadId = req.params['id'] as string;
    const { content } = req.body as { content?: string };
    if (!content?.trim()) { res.status(400).json({ success: false, error: 'Content required' }); return; }
    const note = await prisma.leadNote.create({
      data: { leadId, authorId: req.user?.id ?? null, content: content.trim() }
    });
    res.json({ success: true, data: note });
  });

  // ─── Messaging ────────────────────────────────────────────────────────────
  app.get('/api/messages', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), messaging.getConversations);
  app.get('/api/messages/:clientId', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), messaging.getOrCreateConversation);
  app.post('/api/messages/:clientId', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), messaging.sendMessage);

  // ─── Send notification (broadcast) ────────────────────────────────────────
  app.post('/api/notifications', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), async (req: AuthRequest, res) => {
    const { clientId, clientIds, title, body, channel } = req.body as Record<string, any>;
    const tenantId = await (async () => {
      const u = await prisma.user.findUnique({ where: { id: req.user?.id }, select: { tenantId: true } });
      return u?.tenantId;
    })();
    const ids: string[] = clientIds ?? (clientId ? [clientId] : []);
    if (!title || !body) { res.status(400).json({ success: false, error: 'Title and body required' }); return; }

    if (ids.length > 0) {
      await prisma.notification.createMany({
        data: ids.map(cid => ({ tenantId: tenantId ?? undefined, clientId: cid, title, body, channel: channel || 'in_app', status: 'unread' }))
      });
    } else {
      await prisma.notification.create({ data: { tenantId: tenantId ?? undefined, title, body, channel: channel || 'in_app', status: 'unread' } });
    }
    res.json({ success: true, data: { sent: ids.length || 1 } });
  });

  // ─── Client portal data ───────────────────────────────────────────────────
  app.get('/api/user/profile', clientData.getProfile);
  app.put('/api/user/profile', clientData.updateProfile);
  app.get('/api/goals', clientData.getGoals);
  app.post('/api/goals', clientData.createGoal);
  app.put('/api/goals/:id', clientData.updateGoal);
  app.get('/api/reminders', clientData.getReminders);
  app.get('/api/user/advisor', clientData.getAdvisor);
  app.get('/api/workflow/documents', clientData.getDocuments);
  app.get('/api/finance/payments', clientData.getPayments);

  // ─── Reports & Commissions ────────────────────────────────────────────────
  app.get('/api/reports/summary', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), reports.getSummary);
  app.get('/api/admin/commissions', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), reports.getCommissions);

  // ─── Notifications (in-DB) ────────────────────────────────────────────────
  app.get('/api/notifications', async (req: AuthRequest, res) => {
    const where = req.user?.role === 'CLIENT' ? { clientId: req.user?.clientId } : {};
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json({ success: true, data: notifications });
  });
  app.put('/api/notifications/:id', async (req: AuthRequest, res) => {
    const notif = await prisma.notification.update({ where: { id: req.params['id'] as string }, data: { status: 'read' } });
    res.json({ success: true, data: notif });
  });

  // ─── Templates ────────────────────────────────────────────────────────────
  app.get('/api/templates', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), templates.list);
  app.get('/api/templates/merge-fields', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), templates.mergeFields);
  app.post('/api/templates', requireRole('SUPER_ADMIN'), templates.create);
  app.put('/api/templates/:id', requireRole('SUPER_ADMIN'), templates.update);
  app.post('/api/templates/:id/preview', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), templates.preview);
  app.post('/api/templates/:id/generate', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), templates.generate);

  // ─── Generated documents ──────────────────────────────────────────────────
  app.get('/api/documents/:id/download', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER', 'CLIENT'), templates.download);

  // ─── Tenants ─────────────────────────────────────────────────────────────
  app.get('/api/tenants', requireRole('SUPER_ADMIN'), tenants.getTenants);
  app.post('/api/tenants', requireRole('SUPER_ADMIN'), tenants.createTenant);
  app.put('/api/tenants/:id', requireRole('SUPER_ADMIN'), tenants.updateTenant);

  // ─── Insurers ─────────────────────────────────────────────────────────────
  app.get('/api/insurers', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER', 'PARTNER'), insurers.getInsurers);
  app.post('/api/insurers', requireRole('SUPER_ADMIN'), insurers.createInsurer);
  app.put('/api/insurers/:id', requireRole('SUPER_ADMIN'), insurers.updateInsurer);
  app.delete('/api/insurers/:id', requireRole('SUPER_ADMIN'), insurers.deleteInsurer);

  // ─── Compliance / KYC ─────────────────────────────────────────────────────
  app.get('/api/compliance/kyc', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), kyc.getKycOverview);
  app.put('/api/compliance/kyc/:id', requireRole('SUPER_ADMIN', 'ADMIN'), kyc.updateKycStatus);

  // ─── Audit Log ────────────────────────────────────────────────────────────
  app.get('/api/audit', requireRole('SUPER_ADMIN', 'ADMIN'), auditCtrl.getAuditLog);

  // ─── Settings / Config ────────────────────────────────────────────────────
  app.get('/api/settings', async (_req: AuthRequest, res) => {
    const settings = await prisma.systemConfig.findMany();
    res.json({ success: true, data: settings });
  });
  app.put('/api/settings/:key', requireRole('SUPER_ADMIN'), async (req: AuthRequest, res) => {
    const { value } = req.body as { value: string };
    const key = req.params['key'] as string;
    const setting = await prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    res.json({ success: true, data: setting });
  });

  // ─── Integrations status ──────────────────────────────────────────────────
  app.get('/api/integrations/status', requireRole('SUPER_ADMIN'), (_req, res) => res.json({
    success: true,
    data: {
      email: Boolean(process.env.EMAIL_PROVIDER_URL),
      sms: Boolean(process.env.SMS_PROVIDER_URL),
      storage: Boolean(process.env.STORAGE_ENDPOINT),
      payments: Boolean(process.env.PAYMENT_PROVIDER_URL),
      insurers: Boolean(process.env.INSURER_GATEWAY_URL),
      ai: Boolean(process.env.AI_PROVIDER_URL)
    }
  }));

  // ─── AI ───────────────────────────────────────────────────────────────────
  app.post('/api/ai/ask', (_req, res) => res.status(503).json({ success: false, error: 'AI provider not configured' }));

  // ─── Partner portal ───────────────────────────────────────────────────────
  app.get('/api/partner/dashboard', requireRole('PARTNER'), async (_req, res) => {
    const [insurerCount, appCount] = await Promise.all([prisma.insurer.count(), prisma.application.count()]);
    res.json({ success: true, data: { insurerCount, appCount } });
  });
  app.get('/api/partner/quotes', requireRole('PARTNER'), apps.getApplications);
  app.get('/api/partner/messages', requireRole('PARTNER'), async (_req, res) => {
    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
    res.json({ success: true, data: notifications });
  });

  // ─── 404 ──────────────────────────────────────────────────────────────────
  app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));

  return app;
};
