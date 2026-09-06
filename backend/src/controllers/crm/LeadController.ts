import { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import { audit } from '../../lib/audit';
import type { AuthRequest } from '../../types/auth';

export class LeadController extends BaseController {
  private allowedStatuses = ['New', 'Contacted', 'Qualified', 'Quoted', 'Won', 'Lost'];

  public getLeads = async (req: AuthRequest, res: Response) => {
    const tenantId = await this.getUserTenantId(req.user?.id);
    const leads = await prisma.lead.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { leadNotes: { orderBy: { createdAt: 'asc' } } }
    });
    return this.sendSuccess(res, leads, 'Leads retrieved');
  };

  public createLead = async (req: AuthRequest, res: Response) => {
    const { firstName, lastName, email, mobile, interest, notes } = req.body as Record<string, string | undefined>;
    if (!firstName || !lastName) return this.sendError(res, 'First name and last name are required');
    const tenantId = await this.getUserTenantId(req.user?.id);
    if (!tenantId) return this.sendError(res, 'Tenant not found', 400);
    const lead = await prisma.lead.create({
      data: { tenantId, firstName, lastName, email, mobile, interest: interest || 'General Insurance', notes, status: 'New' },
      include: { leadNotes: true }
    });
    await audit(req.user, 'CREATE_LEAD', 'leads', lead.id, `Created lead ${firstName} ${lastName}`);
    return this.sendSuccess(res, lead, 'Lead created', 201);
  };

  public addLeadNote = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { content } = req.body as { content?: string };
    if (!content?.trim()) return this.sendError(res, 'Note content is required');
    const note = await prisma.leadNote.create({
      data: { leadId: id, authorId: req.user?.id ?? null, content: content.trim() }
    });
    return this.sendSuccess(res, note, 'Note added', 201);
  };

  public updateLeadStatus = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { status } = req.body as { status?: string };
    if (!status || !this.allowedStatuses.includes(status)) return this.sendError(res, 'Invalid lead status');
    const lead = await prisma.lead.update({ where: { id }, data: { status, updatedAt: new Date() } });
    await audit(req.user, 'UPDATE_LEAD_STATUS', 'leads', id, `Lead status changed to ${status}`);
    return this.sendSuccess(res, lead, 'Lead updated');
  };

  public deleteLead = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    await prisma.lead.delete({ where: { id } });
    await audit(req.user, 'DELETE_LEAD', 'leads', id);
    return this.sendSuccess(res, { id }, 'Lead deleted');
  };

  private getUserTenantId = async (userId?: string) => {
    if (!userId) return null;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    return user?.tenantId ?? null;
  };
}
