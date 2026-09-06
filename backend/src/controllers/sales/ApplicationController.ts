import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class ApplicationController extends BaseController {
  public getApplications = async (req: AuthRequest, res: Response) => {
    const where = req.user?.role === 'CLIENT'
      ? { clientId: req.user.clientId }
      : await this.tenantFilter(req.user?.id, req.user?.role);

    const apps = await prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { firstName: true, lastName: true } },
        insurer: { select: { name: true } }
      }
    });

    return this.sendSuccess(res, apps.map(a => ({
      ...a,
      client: `${a.client.firstName} ${a.client.lastName}`,
      insurerName: a.insurer?.name ?? ''
    })), 'Applications retrieved');
  };

  public createApplication = async (req: AuthRequest, res: Response) => {
    const { clientId, productType, insurerId, premium, sumAssured } = req.body as Record<string, string | undefined>;
    if (!clientId || !productType) return this.sendError(res, 'clientId and productType are required');
    const tenantId = await this.getUserTenantId(req.user?.id);
    if (!tenantId) return this.sendError(res, 'Tenant not found', 400);
    const app = await prisma.application.create({
      data: {
        tenantId,
        clientId,
        productType,
        insurerId: insurerId || null,
        premium: premium ? parseFloat(premium) : 0,
        sumAssured: sumAssured ? parseFloat(sumAssured) : 0,
        status: 'draft'
      },
      include: { client: true, insurer: true }
    });
    await audit(req.user, 'CREATE_APPLICATION', 'applications', app.id);
    return this.sendSuccess(res, app, 'Application created', 201);
  };

  public updateApplicationStatus = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { status } = req.body as { status?: string };
    const allowed = ['draft', 'ready_to_quote', 'awaiting_quotes', 'comparing', 'client_deciding', 'selected', 'inception', 'live', 'abandoned'];
    if (!status || !allowed.includes(status)) return this.sendError(res, 'Invalid application status');
    const app = await prisma.application.update({ where: { id }, data: { status, updatedAt: new Date() } });
    await audit(req.user, 'UPDATE_APPLICATION_STATUS', 'applications', id, `Status changed to ${status}`);
    return this.sendSuccess(res, app, 'Application updated');
  };

  private tenantFilter = async (userId?: string, role?: string) => {
    if (role === 'SUPER_ADMIN') return {};
    const tenantId = await this.getUserTenantId(userId);
    return tenantId ? { tenantId } : {};
  };

  private getUserTenantId = async (userId?: string) => {
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    return user?.tenantId ?? null;
  };
}
