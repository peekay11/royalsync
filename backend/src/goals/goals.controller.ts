import type { Context } from 'hono';
import { prisma } from '../common/prisma';
import type { AppEnv } from '../common/types';

export async function createGoal(c: Context<AppEnv>) {
  const { name, targetAmount, currentAmount, ownerId } = await c.req.json();
  const user = c.get('user');

  const goal = await prisma.goal.create({
    data: {
      tenantId: user.tenantId,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      ownerId
    }
  });

  console.log(`GOAL_CREATED: Goal ${goal.id} created`);
  return c.json({ goal });
}

export async function getGoals(c: Context<AppEnv>) {
  const user = c.get('user');
  const clientId = c.req.query('client_id');

  const goals = await prisma.goal.findMany({
    where: {
      tenantId: user.tenantId,
      ownerId: clientId
    }
  });

  const goalsWithProgress = goals.map(g => ({
    ...g,
    progressPercentage: Math.min((g.currentAmount / g.targetAmount) * 100, 100)
  }));

  return c.json({ goals: goalsWithProgress });
}

export async function addContribution(c: Context<AppEnv>) {
  const goalId = c.req.param('id');
  const { amount } = await c.req.json();

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) return c.json({ error: 'Goal not found' }, 404);

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: {
      currentAmount: goal.currentAmount + amount
    }
  });

  console.log(`GOAL_UPDATED: Goal ${goal.id} contributed ${amount}`);
  return c.json({
    goal: {
      ...updated,
      progressPercentage: Math.min((updated.currentAmount / updated.targetAmount) * 100, 100)
    }
  });
}
