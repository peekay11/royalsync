import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class ClaimController extends BaseController {
  public getClaims = async (req: AuthRequest, res: Response) => {
    const where = req.user?.role === 'CLIENT'
      ? { clientId: req.user.clientId }
      : await this.tenantFilter(req.user?.id, req.user?.role);

    const claims = await prisma.claim.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { firstName: true, lastName: true, mobile: true, email: true } },
        policy: { include: { insurer: true } },
        claimNotes: { orderBy: { createdAt: 'asc' }, include: { claim: false } }
      }
    });

    const result = claims.map(c => ({
      ...c,
      client: c.client ? `${c.client.firstName} ${c.client.lastName}` : 'Unknown',
      clientName: c.client ? `${c.client.firstName} ${c.client.lastName}` : 'Unknown',
      clientMobile: c.client?.mobile ?? '',
      clientEmail: c.client?.email ?? '',
      insurer: c.policy?.insurer?.name || 'Santam',
      insurerName: c.policy?.insurer?.name || 'Santam',
      insurerDomain: c.policy?.insurer?.domain || 'santam.co.za',
      policyNumber: c.policy?.policyNumber ?? '',
      policyType: c.policy?.type ?? '',
      policyPremium: c.policy?.premium ?? 0
    }));

    return this.sendSuccess(res, result, 'Claims retrieved');
  };

  public createClaim = async (req: AuthRequest, res: Response) => {
    const { type, amount, description, policyId, incidentDate } = req.body as Record<string, string | undefined>;
    if (!description) return this.sendError(res, 'Description is required');
    const targetClientId = req.user?.clientId || (req.body as Record<string, string | undefined>).clientId;
    if (!targetClientId) return this.sendError(res, 'Client ID is required', 400);
    const tenantId = await this.getUserTenantId(req.user?.id);
    if (!tenantId) return this.sendError(res, 'Tenant not found', 400);
    const reference = `CLM-${Date.now().toString().slice(-8)}`;
    const claim = await prisma.claim.create({
      data: {
        tenantId,
        clientId: targetClientId,
        policyId: policyId || null,
        reference,
        type: type || 'General',
        status: 'submitted',
        incidentDate: incidentDate ? new Date(incidentDate) : new Date(),
        description,
        amount: amount ? parseFloat(amount) : 0
      }
    });
    await audit(req.user, 'SUBMIT_CLAIM', 'claims', claim.id, `Claim ${reference} submitted`);
    return this.sendSuccess(res, claim, 'Claim submitted', 201);
  };

  public updateClaimStatus = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { status } = req.body as { status?: string };
    const allowed = ['submitted', 'acknowledged', 'under_assessment', 'approved', 'rejected', 'settled', 'closed', 'reopened'];
    if (!status || !allowed.includes(status)) return this.sendError(res, 'Invalid claim status');
    const claim = await prisma.claim.update({ where: { id }, data: { status, updatedAt: new Date() } });
    await audit(req.user, 'UPDATE_CLAIM_STATUS', 'claims', id, `Claim status changed to ${status}`);
    return this.sendSuccess(res, claim, 'Claim updated');
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
