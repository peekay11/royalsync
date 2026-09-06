import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class ClientController extends BaseController {
  public getClients = async (req: AuthRequest, res: Response) => {
    const tenantId = req.user?.role === 'SUPER_ADMIN' ? undefined : await this.getUserTenantId(req.user?.id);
    const clients = await prisma.client.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, firstName: true, lastName: true, mobile: true, email: true,
        idNumber: true, kycStatus: true, riskProfile: true, assignedAdviserId: true,
        tenantId: true, createdAt: true,
        _count: { select: { policies: true, claims: true, documents: true, goals: true } }
      }
    });
    return this.sendSuccess(res, clients, 'Clients retrieved');
  };

  public getClient = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        policies: { include: { insurer: true } },
        claims: true,
        goals: true,
        documents: true,
        payments: { orderBy: { date: 'desc' }, take: 12 }
      }
    });
    if (!client) return this.sendError(res, 'Client not found', 404);
    return this.sendSuccess(res, client, 'Client retrieved');
  };

  public createClient = async (req: AuthRequest, res: Response) => {
    const { firstName, lastName, mobile, email, riskProfile, idNumber, kycStatus } = req.body as Record<string, string | undefined>;
    if (!firstName || !lastName || !mobile) return this.sendError(res, 'First name, last name and mobile are required');
    const tenantId = await this.getUserTenantId(req.user?.id);
    if (!tenantId) return this.sendError(res, 'Tenant not found', 400);
    const client = await prisma.client.create({
      data: {
        tenantId,
        firstName,
        lastName,
        mobile,
        email: email || null,
        idNumber: idNumber || null,
        riskProfile: riskProfile || 'Medium',
        kycStatus: kycStatus || 'pending'
      }
    });
    await audit(req.user, 'CREATE_CLIENT', 'clients', client.id, `Created client ${firstName} ${lastName}`);
    return this.sendSuccess(res, client, 'Client created', 201);
  };

  public updateClient = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { firstName, lastName, mobile, email, riskProfile, kycStatus, idNumber } = req.body as Record<string, string | undefined>;
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (email !== undefined) updateData.email = email;
    if (riskProfile !== undefined) updateData.riskProfile = riskProfile;
    if (kycStatus !== undefined) updateData.kycStatus = kycStatus;
    if (idNumber !== undefined) updateData.idNumber = idNumber;

    const client = await prisma.client.update({
      where: { id },
      data: updateData
    });
    await audit(req.user, 'UPDATE_CLIENT', 'clients', id, `Updated client ${client.firstName} ${client.lastName}`);
    return this.sendSuccess(res, client, 'Client updated');
  };

  private getUserTenantId = async (userId?: string) => {
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    return user?.tenantId ?? null;
  };
}
