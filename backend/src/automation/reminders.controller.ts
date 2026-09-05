import type { Context } from 'hono';
import { prisma } from '../common/prisma';
import type { AppEnv } from '../common/types';

export async function completeReminder(c: Context<AppEnv>) {
  const id = c.req.param('id');
  const user = c.get('user');

  const reminder = await prisma.reminder.findUnique({ where: { id } });
  if (!reminder) return c.json({ error: 'Not found' }, 404);

  const updated = await prisma.reminder.update({
    where: { id },
    data: { status: 'COMPLETED', completedAt: new Date() }
  });

  await prisma.auditEvent.create({
    data: {
      actor: user.userId,
      tenantId: user.tenantId,
      action: 'COMPLETE_REMINDER',
      resource: 'Reminder',
      beforeState: JSON.stringify(reminder),
      afterState: JSON.stringify(updated)
    }
  });

  return c.json({ success: true, reminder: updated });
}

export async function getReminders(c: Context<AppEnv>) {
  const user = c.get('user');
  const clientId = c.req.query('client_id');
  const whereClause: any = { tenantId: user.tenantId };
  if (clientId) whereClause.clientId = clientId;

  const reminders = await prisma.reminder.findMany({ where: whereClause });
  return c.json({ reminders });
}
