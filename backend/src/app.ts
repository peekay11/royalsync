import express from 'express';
import cors from 'cors';
import { AuthController } from './controllers/iam/AuthController';
import { UserController } from './controllers/iam/UserController';
import { ClientController } from './controllers/crm/ClientController';
import { LeadController } from './controllers/crm/LeadController';
import { PolicyController } from './controllers/policies/PolicyController';
import { ClaimController } from './controllers/claims/ClaimController';
import { TaskController } from './controllers/workflow/TaskController';
import { ClientDataController } from './controllers/mobile/ClientDataController';
import { requireAuth, requireRole } from './middleware/auth';
import { ResourceController } from './controllers/ResourceController';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

export const createApp = () => {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(value => value.trim());
  app.use(helmet());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: '1mb' }));

  const auth = new AuthController();
  const users = new UserController();
  const clients = new ClientController();
  const leads = new LeadController();
  const policies = new PolicyController();
  const claims = new ClaimController();
  const tasks = new TaskController();
  const clientData = new ClientDataController();
  const resources = new ResourceController();

  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'royalsync-api' }));

  app.post('/api/auth/login', auth.login);
  app.post('/api/auth/login-id', auth.loginById);
  app.post('/api/auth/send-otp', auth.sendOtp);
  app.post('/api/auth/register', auth.register);
  app.post('/api/auth/bootstrap-admin', auth.bootstrapAdmin);

  app.use('/api', requireAuth);
  app.get('/api/iam/users', requireRole('SUPER_ADMIN', 'ADMIN'), users.getUsers);
  app.get('/api/sales/applications', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), resources.list('applications'));
  app.post('/api/sales/applications', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), resources.create('applications'));
  app.put('/api/sales/applications/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), resources.update('applications'));
  app.get('/api/crm/clients', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), clients.getClients);
  app.post('/api/crm/clients', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), clients.createClient);
  app.get('/api/crm/leads', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), leads.getLeads);
  app.put('/api/crm/leads/:id/status', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), leads.updateLeadStatus);
  app.get('/api/policies', policies.getPolicies);
  app.get('/api/claims', claims.getClaims);
  app.post('/api/claims', claims.createClaim);
  app.get('/api/workflow/tasks', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), tasks.getTasks);
  app.put('/api/workflow/tasks/:id/toggle', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), tasks.toggleTask);
  app.get('/api/user/profile', clientData.getProfile);
  app.put('/api/user/profile', clientData.updateProfile);
  app.get('/api/goals', clientData.getGoals);
  app.post('/api/goals', resources.create('goals'));
  app.put('/api/goals/:id', resources.update('goals'));
  app.get('/api/reminders', clientData.getReminders);
  app.get('/api/user/advisor', clientData.getAdvisor);
  app.get('/api/workflow/documents', clientData.getDocuments);
  app.post('/api/workflow/documents', resources.create('documents'));
  app.put('/api/workflow/documents/:id', resources.update('documents'));
  app.get('/api/finance/payments', clientData.getPayments);
  app.post('/api/finance/payments', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), resources.create('payments'));

  app.get('/api/notifications', resources.list('notifications'));
  app.put('/api/notifications/:id', resources.update('notifications'));
  app.get('/api/compliance/kyc', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), resources.list('kyc'));
  app.get('/api/audit', requireRole('SUPER_ADMIN'), resources.list('auditLog'));
  app.get('/api/tenants', requireRole('SUPER_ADMIN'), resources.list('tenants'));
  app.post('/api/tenants', requireRole('SUPER_ADMIN'), resources.create('tenants'));
  app.put('/api/tenants/:id', requireRole('SUPER_ADMIN'), resources.update('tenants'));
  app.get('/api/insurers', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER', 'PARTNER'), resources.list('insurers'));
  app.post('/api/insurers', requireRole('SUPER_ADMIN'), resources.create('insurers'));
  app.put('/api/insurers/:id', requireRole('SUPER_ADMIN'), resources.update('insurers'));
  app.get('/api/templates', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), resources.list('templates'));
  app.post('/api/templates', requireRole('SUPER_ADMIN'), resources.create('templates'));
  app.put('/api/templates/:id', requireRole('SUPER_ADMIN'), resources.update('templates'));
  app.get('/api/integrations', requireRole('SUPER_ADMIN'), resources.list('integrations'));
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
  app.get('/api/settings', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER', 'CLIENT'), resources.list('settings'));
  app.put('/api/settings/:id', resources.update('settings'));
  app.post('/api/ai/ask', (_req, res) => res.status(503).json({ success: false, error: 'AI provider is not configured' }));
  app.get('/api/partner/dashboard', requireRole('PARTNER'), resources.list('insurers'));
  app.get('/api/partner/quotes', requireRole('PARTNER'), resources.list('applications'));
  app.get('/api/partner/messages', requireRole('PARTNER'), resources.list('notifications'));
  app.get('/api/partner/setup', requireRole('PARTNER'), resources.list('settings'));

  app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
  return app;
};