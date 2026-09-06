import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { hashPassword } from '../../middleware/auth';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class UserController extends BaseController {
  public getUsers = async (req: AuthRequest, res: Response) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, role: true, status: true,
        firstName: true, lastName: true, tenantId: true,
        createdAt: true,
        tenant: { select: { name: true } }
      }
    });
    return this.sendSuccess(res, users, 'Users retrieved');
  };

  public createUser = async (req: AuthRequest, res: Response) => {
    const { email, password, role, firstName, lastName, tenantId } = req.body as Record<string, string | undefined>;
    if (!email || !password || !role) return this.sendError(res, 'Email, password and role are required');
    if (password.length < 8) return this.sendError(res, 'Password must be at least 8 characters');
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return this.sendError(res, 'Email is already registered', 409);

    // Resolve tenant
    const resolvedTenantId = tenantId || (await prisma.tenant.findFirst())?.id;
    if (!resolvedTenantId) return this.sendError(res, 'No tenant found');

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        role,
        firstName: firstName || '',
        lastName: lastName || '',
        tenantId: resolvedTenantId,
        status: 'active'
      },
      select: { id: true, email: true, role: true, status: true, firstName: true, lastName: true, tenantId: true, createdAt: true }
    });
    await audit(req.user, 'CREATE_USER', 'users', user.id, `Created user ${user.email} with role ${user.role}`);
    return this.sendSuccess(res, user, 'User created', 201);
  };

  public updateUser = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { role, status, firstName, lastName } = req.body as Record<string, string | undefined>;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return this.sendError(res, 'User not found', 404);
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {})
      },
      select: { id: true, email: true, role: true, status: true, firstName: true, lastName: true, tenantId: true, createdAt: true }
    });
    await audit(req.user, 'UPDATE_USER', 'users', id, `Updated user ${user.email}`);
    return this.sendSuccess(res, updated, 'User updated');
  };

  public deleteUser = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    if (id === req.user?.id) return this.sendError(res, 'Cannot deactivate your own account', 400);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return this.sendError(res, 'User not found', 404);
    await prisma.user.update({ where: { id }, data: { status: 'deactivated' } });
    await audit(req.user, 'DEACTIVATE_USER', 'users', id, `Deactivated user ${user.email}`);
    return this.sendSuccess(res, { id }, 'User deactivated');
  };
}
