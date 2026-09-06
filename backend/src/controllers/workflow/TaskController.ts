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

  public getServiceRequests = async (req: AuthRequest, res: Response) => {
    try {
      const clientId = req.user?.clientId || (req.query?.clientId as string | undefined);
      const isClient = req.user?.role === 'CLIENT';

      const tasks = await prisma.task.findMany({
        where: {
          title: { startsWith: 'SR-' }
        },
        orderBy: { createdAt: 'desc' }
      });

      const parsed = tasks.map(t => {
        let meta: Record<string, any> = {};
        try {
          if (t.description?.startsWith('{')) {
            meta = JSON.parse(t.description);
          }
        } catch {
          // ignore
        }
        return {
          id: t.id,
          reference: meta.reference || t.title.split(':')[0] || `SR-2026-${t.id.slice(-4)}`,
          title: meta.title || t.title,
          taskType: meta.taskType || 'service_request',
          status: t.status,
          priority: t.priority,
          clientId: meta.clientId,
          clientName: meta.clientName || 'Client',
          phone: meta.phone,
          email: meta.email,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
          ...meta
        };
      });

      const filtered = isClient && clientId
        ? parsed.filter(p => p.clientId === clientId)
        : parsed;

      return this.sendSuccess(res, filtered, 'Service requests retrieved');
    } catch {
      return this.sendSuccess(res, [], 'Service requests retrieved');
    }
  };

  public getFinancialStatement = async (req: AuthRequest, res: Response) => {
    try {
      const clientId = req.user?.clientId;
      const tasks = await prisma.task.findMany({
        where: {
          title: { startsWith: 'SR-' }
        },
        orderBy: { createdAt: 'desc' }
      });

      for (const t of tasks) {
        try {
          if (t.description?.startsWith('{')) {
            const parsed = JSON.parse(t.description);
            if (parsed.taskType === 'client_financial_statement' && (!clientId || parsed.clientId === clientId)) {
              return this.sendSuccess(res, { id: t.id, ...parsed, createdAt: t.createdAt.toISOString() }, 'Financial statement retrieved');
            }
          }
        } catch {
          // ignore
        }
      }
      return this.sendSuccess(res, null, 'No financial statement found');
    } catch {
      return this.sendSuccess(res, null, 'No financial statement found');
    }
  };

  public createServiceRequest = async (req: AuthRequest, res: Response) => {
    try {
      const body = req.body as Record<string, any>;
      const { taskType } = body;
      if (!taskType) return this.sendError(res, 'Task type is required', 400);

      const reference = `SR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      let taskTitle = `${reference}: Service Request`;

      switch (taskType) {
        case 'change_of_address':
          taskTitle = `${reference}: Change of Address (${body.physicalAddress || body.newAddress || 'Residential'})`;
          if (req.user?.clientId && (body.physicalAddress || body.newAddress)) {
            await prisma.client.update({
              where: { id: req.user.clientId },
              data: {
                ...(body.phone ? { mobile: body.phone } : {})
              }
            }).catch(() => {});
          }
          break;
        case 'change_of_bank_details':
          taskTitle = `${reference}: Bank Update (${body.bankName || 'New Account'})`;
          break;
        case 'request_policy_schedule':
          taskTitle = `${reference}: Policy Document (${body.documentType || 'Schedule'} - ${body.provider || 'Insurer'})`;
          break;
        case 'request_border_letter':
          taskTitle = `${reference}: Cross-Border Letter (${body.destinationCountry || 'SADC'} - ${body.vehicleReg || 'Vehicle'})`;
          break;
        case 'request_tax_certificate':
          taskTitle = `${reference}: Tax Certificate (${body.taxYear || '2026'} - ${body.investmentCompany || 'Investment'})`;
          break;
        case 'book_financial_review':
          taskTitle = `${reference}: Consultation (${body.consultationType || 'Annual Review'} - ${body.preferredDate || 'Scheduled'})`;
          break;
        case 'client_financial_statement':
          taskTitle = `${reference}: Financial Statement (${body.financialYear || '2026'})`;
          break;
      }

      const tenantId = await this.getUserTenantId(req.user?.id) || (await prisma.tenant.findFirst({ select: { id: true } }))?.id;
      if (!tenantId) return this.sendError(res, 'Tenant not found', 400);

      const payload = {
        ...body,
        reference,
        title: taskTitle,
        clientId: req.user?.clientId || body.clientId || null,
        status: 'submitted',
        createdAt: new Date().toISOString()
      };

      const task = await prisma.task.create({
        data: {
          tenantId,
          title: taskTitle,
          description: JSON.stringify(payload),
          priority: 'high',
          status: 'open'
        }
      });

      // Notification for admin/broker
      await prisma.notification.create({
        data: {
          tenantId,
          title: `New Service Request: ${reference}`,
          body: `${body.clientName || 'Client'} submitted ${taskTitle}`,
          channel: 'in_app',
          status: 'unread'
        }
      }).catch(() => {});

      await audit(req.user, 'CREATE_SERVICE_REQUEST', 'tasks', task.id, `Created service request ${reference}`);
      return this.sendSuccess(res, { id: task.id, reference, title: taskTitle, status: 'submitted', ...payload }, 'Service request created', 201);
    } catch (err: any) {
      return this.sendError(res, err.message || 'Failed to submit service request', 500);
    }
  };

  public updateServiceRequestStatus = async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params['id'] as string;
      const { status } = req.body as { status?: string };
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) return this.sendError(res, 'Service request not found', 404);

      let prevMeta: Record<string, any> = {};
      try {
        if (task.description?.startsWith('{')) prevMeta = JSON.parse(task.description);
      } catch {
        // ignore
      }

      const updatedMeta = { ...prevMeta, status: status || 'completed' };
      const updated = await prisma.task.update({
        where: { id },
        data: {
          status: status === 'completed' || status === 'approved' ? 'completed' : 'open',
          description: JSON.stringify(updatedMeta),
          updatedAt: new Date()
        }
      });

      return this.sendSuccess(res, { id: updated.id, ...updatedMeta }, 'Service request status updated');
    } catch (err: any) {
      return this.sendError(res, err.message || 'Failed to update service request', 500);
    }
  };

  private getUserTenantId = async (userId?: string) => {
    if (!userId) return null;
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
      if (!user?.tenantId || !/^[0-9a-fA-F]{24}$/.test(user.tenantId)) return null;
      return user.tenantId;
    } catch {
      return null;
    }
  };
}
