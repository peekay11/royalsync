import { prisma } from '../common/prisma';

export async function runReminderCron() {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringPolicies = await prisma.policy.findMany({
    where: {
      certificateExpiryDate: { lte: thirtyDaysFromNow }
    }
  });

  for (const policy of expiringPolicies) {
    const existing = await prisma.reminder.findFirst({
      where: { relatedEntityId: policy.id, relatedEntityType: 'Policy', status: 'PENDING' }
    });

    if (!existing) {
      await prisma.reminder.create({
        data: {
          tenantId: policy.tenantId,
          clientId: policy.clientId,
          relatedEntityType: 'Policy',
          relatedEntityId: policy.id,
          title: 'Policy Expiry Reminder',
          dueDate: policy.certificateExpiryDate
        }
      });
      console.log(`Created reminder for policy ${policy.id}`);
    }
  }
}
// Run periodically if needed (setInterval)
setInterval(runReminderCron, 1000 * 60 * 60); // 1 hour
