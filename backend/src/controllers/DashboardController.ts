import { Response } from 'express';
import { BaseController } from './BaseController';
import { prisma } from '../lib/prisma';
import type { AuthRequest } from '../types/auth';

export class DashboardController extends BaseController {
  public adminDashboard = async (req: AuthRequest, res: Response) => {
    const tenantId = await this.getUserTenantId(req.user?.id);
    const where = tenantId ? { tenantId } : {};

    const [totalClients, pendingTasks, activeClaims, activePolicies, totalLeads, openApplications] = await Promise.all([
      prisma.client.count({ where }),
      prisma.task.count({ where: { ...where, status: 'open' } }),
      prisma.claim.count({ where: { ...where, status: { in: ['submitted', 'acknowledged', 'under_assessment'] } } }),
      prisma.policy.count({ where: { ...where, status: 'active' } }),
      prisma.lead.count({ where }),
      prisma.application.count({ where: { ...where, status: { notIn: ['live', 'abandoned'] } } })
    ]);

    // Lead funnel data for chart
    const leadGroups = await prisma.lead.groupBy({
      by: ['status'],
      _count: { status: true },
      where
    });
    const leadFunnel = ['New', 'Contacted', 'Qualified', 'Quoted', 'Won', 'Lost'].map(name => ({
      name,
      value: leadGroups.find(g => g.status === name)?._count.status ?? 0
    }));

    // Recent tasks
    const recentTasks = await prisma.task.findMany({
      where: { ...where, status: 'open' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return this.sendSuccess(res, {
      totalClients,
      pendingTasks,
      activeClaims,
      activePolicies,
      totalLeads,
      openApplications,
      leadFunnel,
      recentTasks
    }, 'Dashboard data retrieved');
  };

  public clientDashboard = async (req: AuthRequest, res: Response) => {
    const clientId = req.user?.clientId;
    if (!clientId) return this.sendError(res, 'Client account required', 403);

    const [policies, claims, goals, payments] = await Promise.all([
      prisma.policy.findMany({ where: { clientId, status: 'active' }, include: { insurer: true } }),
      prisma.claim.findMany({ where: { clientId }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.goal.findMany({ where: { clientId } }),
      prisma.payment.findMany({ where: { clientId }, orderBy: { date: 'desc' }, take: 6 })
    ]);

    const totalPremium = policies.reduce((s, p) => s + p.premium, 0);
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const totalGoalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalGoalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0);

    return this.sendSuccess(res, {
      activePolicies: policies.length,
      totalMonthlyPremium: totalPremium,
      activeClaims: claims.filter(c => !['settled', 'closed', 'rejected'].includes(c.status)).length,
      goalsProgress: totalGoalTarget ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0,
      totalPaid,
      recentClaims: claims,
      policies: policies.map(p => ({
        ...p,
        provider: p.insurer?.name ?? 'Unknown',
        providerDomain: p.insurer?.domain ?? ''
      }))
    }, 'Client dashboard retrieved');
  };

  public superDashboard = async (_req: AuthRequest, res: Response) => {
    const [totalTenants, totalUsers, totalClients, totalPolicies, totalClaims, totalApplications] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.client.count(),
      prisma.policy.count({ where: { status: 'active' } }),
      prisma.claim.count({ where: { status: { in: ['submitted', 'acknowledged', 'under_assessment'] } } }),
      prisma.application.count()
    ]);

    const tenantBreakdown = await prisma.tenant.findMany({
      include: {
        _count: { select: { users: true, clients: true, policies: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Monthly signups for last 6 months (from user createdAt)
    const recentAuditEvents = await prisma.auditEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { actor: { select: { email: true, role: true } } }
    });

    return this.sendSuccess(res, {
      totalTenants,
      totalUsers,
      totalClients,
      activePolicies: totalPolicies,
      activeClaims: totalClaims,
      totalApplications,
      tenantBreakdown: tenantBreakdown.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: t.status,
        plan: t.plan,
        users: t._count.users,
        clients: t._count.clients,
        policies: t._count.policies,
        createdAt: t.createdAt
      })),
      recentAuditEvents: recentAuditEvents.map(e => ({
        id: e.id,
        actor: e.actor?.email ?? 'System',
        actorRole: e.actorRole,
        action: e.action,
        resource: e.resource,
        resourceId: e.resourceId,
        description: e.description,
        createdAt: e.createdAt
      }))
    }, 'Super admin dashboard retrieved');
  };

  private getUserTenantId = async (userId?: string) => {
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    return user?.tenantId ?? null;
  };
}
