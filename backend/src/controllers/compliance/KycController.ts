import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class KycController extends BaseController {
  public getKycOverview = async (req: AuthRequest, res: Response) => {
    const tenantId = await this.getUserTenantId(req.user?.id, req.user?.role);
    const where = tenantId ? { tenantId } : {};

    const [verified, pending, failed, total] = await Promise.all([
      prisma.client.count({ where: { ...where, kycStatus: 'verified' } }),
      prisma.client.count({ where: { ...where, kycStatus: 'pending' } }),
      prisma.client.count({ where: { ...where, kycStatus: 'failed' } }),
      prisma.client.count({ where })
    ]);

    const recentPending = await prisma.client.findMany({
      where: { ...where, kycStatus: 'pending' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, firstName: true, lastName: true, mobile: true, email: true, kycStatus: true, createdAt: true }
    });

    return this.sendSuccess(res, {
      stats: { verified, pending, failed, total, verificationRate: total ? Math.round((verified / total) * 100) : 0 },
      pendingClients: recentPending
    }, 'KYC overview retrieved');
  };

  public updateKycStatus = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { kycStatus } = req.body as { kycStatus?: string };
    const allowed = ['pending', 'verified', 'failed', 'in_review'];
    if (!kycStatus || !allowed.includes(kycStatus)) return this.sendError(res, 'Invalid KYC status');
    const client = await prisma.client.update({ where: { id }, data: { kycStatus } });
    await audit(req.user, 'UPDATE_KYC_STATUS', 'clients', id, `KYC status set to ${kycStatus} for ${client.firstName} ${client.lastName}`);
    return this.sendSuccess(res, client, 'KYC status updated');
  };

  private getUserTenantId = async (userId?: string, role?: string) => {
    if (role === 'SUPER_ADMIN') return null;
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    return user?.tenantId ?? null;
  };
}
