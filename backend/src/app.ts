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
import { ApplicationController } from './controllers/sales/ApplicationController';
import { requireAuth, requireRole } from './middleware/auth';

export const createApp = () => {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(value => value.trim());
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
  const applications = new ApplicationController();

  app.post('/api/auth/login', auth.login);
  app.post('/api/auth/login-id', auth.loginById);
  app.post('/api/auth/send-otp', auth.sendOtp);
  app.post('/api/auth/register', auth.register);

  app.use('/api', requireAuth);
  app.get('/api/iam/users', requireRole('SUPER_ADMIN', 'ADMIN'), users.getUsers);
  app.get('/api/sales/applications', requireRole('SUPER_ADMIN', 'ADMIN', 'ADVISER'), applications.getApplications);
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
  app.get('/api/goals', clientData.getGoals);
  app.get('/api/reminders', clientData.getReminders);
  app.get('/api/user/advisor', clientData.getAdvisor);
  app.get('/api/workflow/documents', clientData.getDocuments);
  app.get('/api/finance/payments', clientData.getPayments);

  app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
  return app;
};