import { Response } from 'express';
import { BaseController } from './BaseController';
import { prisma } from '../lib/prisma';
import type { AuthRequest } from '../types/auth';

export class AuditController extends BaseController {
  public getAuditLog = async (req: AuthRequest, res: Response) => {
    const tenantId = req.user?.role === 'SUPER_ADMIN'
      ? (req.query.tenantId as string | undefined)
      : await this.getUserTenantId(req.user?.id);

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);

    const where = tenantId ? { tenantId } : {};

    const [events, total] = await Promise.all([
      prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { actor: { select: { email: true, role: true } } }
      }),
      prisma.auditEvent.count({ where })
    ]);

    return this.sendSuccess(res, {
      events: events.map(e => ({
        id: e.id,
        actor: e.actor?.email ?? 'System',
        actorRole: e.actorRole ?? 'SYSTEM',
        action: e.action,
        resource: e.resource,
        resourceId: e.resourceId,
        description: e.description,
        tenantId: e.tenantId,
        createdAt: e.createdAt
      })),
      total,
      page,
      pages: Math.ceil(total / limit)
    }, 'Audit log retrieved');
  };

  private getUserTenantId = async (userId?: string) => {
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    return user?.tenantId ?? null;
  };
}
