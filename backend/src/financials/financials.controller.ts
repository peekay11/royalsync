import type { Context } from 'hono';
import { prisma } from '../common/prisma';
import { FinancialSummaryService } from './financials.service';
import type { AppEnv } from '../common/types';

const svc = new FinancialSummaryService();

export async function getDashboard(c: Context<AppEnv>) {
  const user = c.get('user');

  let targetClientId = c.req.query('client_id');

  if (user.roles.includes('CLIENT')) {
    const client = await prisma.client.findUnique({ where: { userId: user.userId } });
    if (!client) return c.json({ error: 'Client profile not found' }, 404);
    targetClientId = client.id;
  }

  if (!targetClientId) {
    return c.json({ error: 'client_id is required for advisers' }, 400);
  }

  // Authorize: check if adviser has access to this client via tenant_id
  const clientData = await prisma.client.findUnique({
    where: { id: targetClientId },
    include: {
      assets: true,
      liabilities: true,
      incomes: true,
      expenses: true
    }
  });

  if (!clientData || clientData.tenantId !== user.tenantId) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const summary = svc.calculateSummary(
    clientData.assets,
    clientData.liabilities,
    clientData.incomes,
    clientData.expenses
  );

  return c.json({ dashboard: summary });
}
