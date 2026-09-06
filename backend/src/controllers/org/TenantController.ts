import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class TenantController extends BaseController {
  public getTenants = async (req: AuthRequest, res: Response) => {
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { users: true, clients: true, policies: true } } }
    });
    return this.sendSuccess(res, tenants.map(t => ({
      ...t,
      userCount: t._count.users,
      clientCount: t._count.clients,
      policyCount: t._count.policies
    })), 'Tenants retrieved');
  };

  public createTenant = async (req: AuthRequest, res: Response) => {
    const { name, slug, plan } = req.body as Record<string, string | undefined>;
    if (!name || !slug) return this.sendError(res, 'Name and slug are required');
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) return this.sendError(res, 'Slug already in use', 409);
    const tenant = await prisma.tenant.create({ data: { name, slug, plan: plan || 'professional', status: 'active' } });
    await audit(req.user, 'CREATE_TENANT', 'tenants', tenant.id, `Created tenant ${name}`);
    return this.sendSuccess(res, tenant, 'Tenant created', 201);
  };

  public updateTenant = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { name, status, plan } = req.body as Record<string, string | undefined>;
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { ...(name ? { name } : {}), ...(status ? { status } : {}), ...(plan ? { plan } : {}) }
    });
    await audit(req.user, 'UPDATE_TENANT', 'tenants', id);
    return this.sendSuccess(res, tenant, 'Tenant updated');
  };
}
