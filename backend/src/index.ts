import dotenv from 'dotenv';
<<<<<<< HEAD
import { createApp } from './app';

dotenv.config();

const port = Number(process.env.PORT || 5000);
createApp().listen(port, () => console.log(`Server running on ${port}`));
=======
import { login, getMe } from './auth/auth.controller';
import { authenticate } from './auth/auth.middleware';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('OK'));

app.post('/auth/login', login);
app.get('/auth/me', authenticate, getMe);

app.listen(4000, () => console.log('Server running on port 4000'));
import { getDashboard } from './financials/financials.controller';
app.get('/dashboard', authenticate, getDashboard);
import { createGoal, getGoals, addContribution } from './goals/goals.controller';
app.post('/goals', authenticate, createGoal);
app.get('/goals', authenticate, getGoals);
app.patch('/goals/:id/contribution', authenticate, addContribution);
import { createAddressChange, reviewRequest } from './service_requests/service_requests.controller';
app.post('/service-requests/address-change', authenticate, createAddressChange);
app.patch('/service-requests/:id/review', authenticate, reviewRequest);
import { completeReminder, getReminders } from './automation/reminders.controller';
app.patch('/reminders/:id/complete', authenticate, completeReminder);
app.get('/reminders', authenticate, getReminders);
import { submitAccidentClaim, advanceClaim, getClaimTimeline } from './claims/claims.controller';
app.post('/claims/accident', authenticate, submitAccidentClaim);
app.post('/claims/:id/advance', authenticate, advanceClaim);
app.get('/claims/:id', authenticate, getClaimTimeline);
import { askAi } from './ai/ai.controller';
app.post('/ai/ask', authenticate, askAi);
import { getAuditEvents } from './audit/audit.controller';
app.get('/audit-events', authenticate, getAuditEvents);
import { runReminderCron } from './automation/cron';
runReminderCron();
>>>>>>> ae49398c ( push)
