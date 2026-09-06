import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class TaskController extends BaseController {
  public getTasks = async (req: AuthRequest, res: Response) => {
    const tenantId = await this.getUserTenantId(req.user?.id);
    const tasks = await prisma.task.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
    });
    return this.sendSuccess(res, tasks, 'Tasks retrieved');
  };

  public createTask = async (req: AuthRequest, res: Response) => {
    const { title, description, priority, assigneeId, dueDate } = req.body as Record<string, string | undefined>;
    if (!title) return this.sendError(res, 'Title is required');
    const tenantId = await this.getUserTenantId(req.user?.id);
    if (!tenantId) return this.sendError(res, 'Tenant not found', 400);
    const task = await prisma.task.create({
      data: {
        tenantId,
        title,
        description: description || null,
        priority: priority || 'normal',
        status: 'open',
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });
    await audit(req.user, 'CREATE_TASK', 'tasks', task.id, `Created task: ${title}`);
    return this.sendSuccess(res, task, 'Task created', 201);
  };

  public toggleTask = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return this.sendError(res, 'Task not found', 404);
    const updated = await prisma.task.update({
      where: { id },
      data: { status: task.status === 'open' ? 'completed' : 'open', updatedAt: new Date() }
    });
    await audit(req.user, 'UPDATE_TASK', 'tasks', id, `Task marked as ${updated.status}`);
    return this.sendSuccess(res, updated, 'Task updated');
  };

  public updateTask = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { title, priority, status, dueDate } = req.body as Record<string, string | undefined>;
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(priority ? { priority } : {}),
        ...(status ? { status } : {}),
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        updatedAt: new Date()
      }
    });
    return this.sendSuccess(res, task, 'Task updated');
  };

  private getUserTenantId = async (userId?: string) => {
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    return user?.tenantId ?? null;
  };
}
