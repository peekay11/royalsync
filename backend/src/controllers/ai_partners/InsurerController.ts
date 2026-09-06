import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class InsurerController extends BaseController {
  public getInsurers = async (_req: AuthRequest, res: Response) => {
    const insurers = await prisma.insurer.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { policies: true } } }
    });
    return this.sendSuccess(res, insurers.map(i => ({
      ...i,
      policyCount: i._count.policies
    })), 'Insurers retrieved');
  };

  public createInsurer = async (req: AuthRequest, res: Response) => {
    const { name, domain, category, contactEmail } = req.body as Record<string, string | undefined>;
    if (!name) return this.sendError(res, 'Name is required');
    const existing = await prisma.insurer.findUnique({ where: { name } });
    if (existing) return this.sendError(res, 'Insurer already exists', 409);
    const insurer = await prisma.insurer.create({
      data: {
        name,
        domain: domain || null,
        category: category || 'short-term',
        contactEmail: contactEmail || null,
        status: 'active',
        apiStatus: 'active'
      }
    });
    await audit(req.user, 'CREATE_INSURER', 'insurers', insurer.id, `Added insurer ${name}`);
    return this.sendSuccess(res, insurer, 'Insurer created', 201);
  };

  public updateInsurer = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { name, status, apiStatus, contactEmail, category } = req.body as Record<string, string | undefined>;
    const insurer = await prisma.insurer.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(apiStatus !== undefined ? { apiStatus } : {}),
        ...(contactEmail !== undefined ? { contactEmail } : {}),
        ...(category !== undefined ? { category } : {})
      }
    });
    await audit(req.user, 'UPDATE_INSURER', 'insurers', id);
    return this.sendSuccess(res, insurer, 'Insurer updated');
  };

  public deleteInsurer = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const count = await prisma.policy.count({ where: { insurerId: id } });
    if (count > 0) return this.sendError(res, `Cannot remove: insurer has ${count} active policies`, 409);
    await prisma.insurer.delete({ where: { id } });
    await audit(req.user, 'DELETE_INSURER', 'insurers', id);
    return this.sendSuccess(res, { id }, 'Insurer removed');
  };
}
