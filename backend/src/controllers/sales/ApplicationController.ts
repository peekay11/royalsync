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
    const { productType, insurerId, premium, sumAssured, notes } = req.body as Record<string, string | undefined>;
    const targetClientId = req.user?.role === 'CLIENT' ? req.user.clientId : (req.body.clientId || req.user?.clientId);
    if (!targetClientId || !productType) return this.sendError(res, 'Target client and productType are required');
    
    let tenantId = await this.getUserTenantId(req.user?.id);
    if (!tenantId) {
      const client = await prisma.client.findUnique({ where: { id: targetClientId }, select: { tenantId: true } });
      tenantId = client?.tenantId || null;
    }
    if (!tenantId) return this.sendError(res, 'Tenant not found', 400);

    const app = await prisma.application.create({
      data: {
        tenantId,
        clientId: targetClientId,
        productType,
        insurerId: insurerId || null,
        premium: premium ? parseFloat(premium) : 0,
        sumAssured: sumAssured ? parseFloat(sumAssured) : 0,
        status: 'ready_to_quote'
      },
      include: { client: true, insurer: true }
    });

    // Notify administrators / advisers of the client's policy quote request
    try {
      const client = await prisma.client.findUnique({ where: { id: targetClientId } });
      const clientName = client ? `${client.firstName} ${client.lastName}` : 'A policyholder';
      await prisma.notification.create({
        data: {
          tenantId,
          clientId: targetClientId,
          title: `New Policy Request: ${productType}`,
          body: `${clientName} has requested a new policy quote for ${productType}.`,
          channel: 'in_app',
          status: 'unread'
        }
      });
    } catch {}

    await audit(req.user, 'CREATE_APPLICATION', 'applications', app.id, `Policy request for ${productType}`);
    return this.sendSuccess(res, app, 'Policy addition request submitted successfully', 201);
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
