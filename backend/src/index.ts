import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { AuthController } from './controllers/iam/AuthController';
import { UserController } from './controllers/iam/UserController';
import { ClientController } from './controllers/crm/ClientController';
import { LeadController } from './controllers/crm/LeadController';
import { PolicyController } from './controllers/policies/PolicyController';
import { ClaimController } from './controllers/claims/ClaimController';
import { TaskController } from './controllers/workflow/TaskController';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const auth = new AuthController();
const users = new UserController();
const clients = new ClientController();
const leads = new LeadController();
const policies = new PolicyController();
const claims = new ClaimController();
const tasks = new TaskController();

app.post('/api/auth/login', auth.login);
app.get('/api/iam/users', users.getUsers);

app.get('/api/crm/clients', clients.getClients);
app.post('/api/crm/clients', clients.createClient);

app.get('/api/crm/leads', leads.getLeads);
app.put('/api/crm/leads/:id/status', leads.updateLeadStatus);

app.get('/api/policies', policies.getPolicies);
app.get('/api/claims', claims.getClaims);

app.get('/api/workflow/tasks', tasks.getTasks);
app.put('/api/workflow/tasks/:id/toggle', tasks.toggleTask);

app.listen(5000, () => console.log('Server running on 5000'));
