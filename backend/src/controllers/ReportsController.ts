import { Response } from 'express';
import { BaseController } from './BaseController';
import { prisma } from '../lib/prisma';
import type { AuthRequest } from '../types/auth';

export class ReportsController extends BaseController {
  public getSummary = async (req: AuthRequest, res: Response) => {
    const tenantId = await this.getUserTenantId(req.user?.id);
    const where = tenantId ? { tenantId } : {};

    const [leadGroups, claimGroups, appGroups, policyGroups] = await Promise.all([
      prisma.lead.groupBy({ by: ['status'], _count: { status: true }, where }),
      prisma.claim.groupBy({ by: ['status'], _count: { status: true }, where }),
      prisma.application.groupBy({ by: ['status'], _count: { status: true }, where }),
      prisma.policy.groupBy({ by: ['status'], _count: { status: true }, where })
    ]);

    return this.sendSuccess(res, {
      leadsByStatus: leadGroups.map(g => ({ name: g.status, value: g._count.status })),
      claimsByStatus: claimGroups.map(g => ({ name: g.status.replace(/_/g, ' '), value: g._count.status })),
      applicationsByStatus: appGroups.map(g => ({ name: g.status.replace(/_/g, ' '), value: g._count.status })),
      policiesByStatus: policyGroups.map(g => ({ name: g.status, value: g._count.status }))
    }, 'Reports summary retrieved');
  };

  public getCommissions = async (req: AuthRequest, res: Response) => {
    const tenantId = await this.getUserTenantId(req.user?.id);
    const where = tenantId ? { tenantId } : {};

    const commissions = await prisma.commission.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const totalEarned = commissions.reduce((s, c) => s + c.amount, 0);
    const paidCommissions = commissions.filter(c => c.status === 'paid');
    const paidTotal = paidCommissions.reduce((s, c) => s + c.amount, 0);

    // Group by month
    const byMonth = commissions.reduce<Record<string, number>>((acc, c) => {
      acc[c.month] = (acc[c.month] ?? 0) + c.amount;
      return acc;
    }, {});

    const monthlyData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, amount]) => ({ name: month, value: Math.round(amount) }));

    return this.sendSuccess(res, {
      totalEarned: Math.round(totalEarned),
      paidTotal: Math.round(paidTotal),
      thisMonth: Math.round(commissions.filter(c => c.month === new Date().toISOString().slice(0, 7)).reduce((s, c) => s + c.amount, 0)),
      count: commissions.length,
      monthlyData,
      recent: commissions.slice(0, 10)
    }, 'Commissions retrieved');
  };

  private getUserTenantId = async (userId?: string) => {
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    return user?.tenantId ?? null;
  };
}
