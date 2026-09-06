import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class PolicyController extends BaseController {
  public getPolicies = async (req: AuthRequest, res: Response) => {
    const where = req.user?.role === 'CLIENT'
      ? { clientId: req.user.clientId }
      : await this.tenantFilter(req.user?.id, req.user?.role);

    const policies = await prisma.policy.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        insurer: { select: { id: true, name: true, domain: true } },
        client: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    const result = policies.map(p => ({
      ...p,
      provider: p.insurer?.name ?? 'Unknown',
      providerDomain: p.insurer?.domain ?? '',
      clientName: p.client ? `${p.client.firstName} ${p.client.lastName}` : 'Unknown'
    }));

    return this.sendSuccess(res, result, 'Policies retrieved');
  };

  public createPolicy = async (req: AuthRequest, res: Response) => {
    const { clientId, insurerId, policyNumber, type, premium, sumAssured, status, inceptionDate } = req.body as Record<string, string | undefined>;
    if (!clientId || !policyNumber || !type || !premium) return this.sendError(res, 'clientId, policyNumber, type and premium are required');
    const tenantId = await this.getUserTenantId(req.user?.id);
    if (!tenantId) return this.sendError(res, 'Tenant not found', 400);
    const policy = await prisma.policy.create({
      data: {
        tenantId,
        clientId,
        insurerId: insurerId || null,
        policyNumber,
        type,
        premium: parseFloat(premium),
        sumAssured: sumAssured ? parseFloat(sumAssured) : 0,
        status: status || 'active',
        inceptionDate: inceptionDate ? new Date(inceptionDate) : new Date()
      },
      include: { insurer: true, client: true }
    });
    await audit(req.user, 'CREATE_POLICY', 'policies', policy.id, `Created policy ${policyNumber}`);
    return this.sendSuccess(res, policy, 'Policy created', 201);
  };

  public updatePolicy = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { status, premium, type } = req.body as Record<string, string | undefined>;
    const policy = await prisma.policy.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(premium ? { premium: parseFloat(premium) } : {}),
        ...(type ? { type } : {})
      }
    });
    await audit(req.user, 'UPDATE_POLICY', 'policies', id);
    return this.sendSuccess(res, policy, 'Policy updated');
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
