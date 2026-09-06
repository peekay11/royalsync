import type { Response } from 'express';
import { BaseController } from '../BaseController';
import { prisma } from '../../lib/prisma';
import type { AuthRequest } from '../../types/auth';

export class ClientDataController extends BaseController {
  public getProfile = async (req: AuthRequest, res: Response) => {
    if (!req.user?.clientId) return this.sendError(res, 'Client profile not found', 404);
    const client = await prisma.client.findUnique({
      where: { id: req.user.clientId },
      include: { user: { select: { email: true } } }
    });
    if (!client) return this.sendError(res, 'Client profile not found', 404);
    return this.sendSuccess(res, {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      name: `${client.firstName} ${client.lastName}`,
      initials: `${client.firstName[0]}${client.lastName[0]}`,
      email: client.email || client.user?.email || '',
      phone: client.mobile,
      idNumber: client.idNumber,
      kycStatus: client.kycStatus,
      riskProfile: client.riskProfile,
      assignedAdviserId: client.assignedAdviserId
    }, 'Profile retrieved');
  };

  public updateProfile = async (req: AuthRequest, res: Response) => {
    if (!req.user?.clientId) return this.sendError(res, 'Client profile not found', 404);
    const { firstName, lastName, mobile, email } = req.body as Record<string, string | undefined>;
    if (!firstName || !lastName || !mobile) return this.sendError(res, 'First name, last name and mobile are required');
    await prisma.client.update({
      where: { id: req.user.clientId },
      data: { firstName, lastName, mobile, email }
    });
    return this.getProfile(req, res);
  };

  public getGoals = async (req: AuthRequest, res: Response) => {
    if (!req.user?.clientId) return this.sendSuccess(res, { goals: [], summary: { totalTarget: 0, totalCurrent: 0, overallPercentage: 0 } }, 'Goals retrieved');
    const goals = await prisma.goal.findMany({
      where: { clientId: req.user.clientId },
      orderBy: { createdAt: 'desc' }
    });
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    return this.sendSuccess(res, {
      goals,
      summary: { totalTarget, totalCurrent, overallPercentage: totalTarget ? Math.round((totalCurrent / totalTarget) * 100) : 0 }
    }, 'Goals retrieved');
  };

  public createGoal = async (req: AuthRequest, res: Response) => {
    const targetClientId = req.user?.clientId || (req.body as Record<string, string | undefined>).clientId;
    if (!targetClientId) return this.sendError(res, 'Client ID is required', 400);
    const { name, targetAmount, currentAmount, targetDate, contributionAmount, contributionFrequency } = req.body as Record<string, string | undefined>;
    if (!name || !targetAmount) return this.sendError(res, 'Name and target amount are required');
    const goal = await prisma.goal.create({
      data: {
        clientId: targetClientId,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        contributionAmount: contributionAmount ? parseFloat(contributionAmount) : null,
        contributionFrequency: contributionFrequency || null
      }
    });
    return this.sendSuccess(res, goal, 'Goal created', 201);
  };

  public updateGoal = async (req: AuthRequest, res: Response) => {
    const id = req.params['id'] as string;
    const { currentAmount, status } = req.body as Record<string, string | undefined>;
    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...(currentAmount !== undefined ? { currentAmount: parseFloat(currentAmount) } : {}),
        ...(status ? { status } : {})
      }
    });
    return this.sendSuccess(res, goal, 'Goal updated');
  };

  public getReminders = async (req: AuthRequest, res: Response) => {
    if (!req.user?.clientId) return this.sendSuccess(res, [], 'Reminders retrieved');
    const reminders = await prisma.reminder.findMany({
      where: { clientId: req.user.clientId, status: 'pending' },
      orderBy: { dueDate: 'asc' }
    });
    return this.sendSuccess(res, reminders, 'Reminders retrieved');
  };

  public getAdvisor = async (req: AuthRequest, res: Response) => {
    if (!req.user?.clientId) return this.sendError(res, 'No adviser assigned', 404);
    const client = await prisma.client.findUnique({ where: { id: req.user.clientId }, select: { assignedAdviserId: true } });
    if (!client?.assignedAdviserId) return this.sendError(res, 'No adviser is assigned to this client', 404);
    const adviser = await prisma.user.findUnique({ where: { id: client.assignedAdviserId }, select: { id: true, firstName: true, lastName: true, email: true } });
    if (!adviser) return this.sendError(res, 'Adviser not found', 404);
    return this.sendSuccess(res, adviser, 'Adviser retrieved');
  };

  public getDocuments = async (req: AuthRequest, res: Response) => {
    if (!req.user?.clientId) return this.sendSuccess(res, [], 'Documents retrieved');
    const docs = await prisma.document.findMany({
      where: { clientId: req.user.clientId },
      orderBy: { createdAt: 'desc' }
    });
    return this.sendSuccess(res, docs, 'Documents retrieved');
  };

  public getPayments = async (req: AuthRequest, res: Response) => {
    if (!req.user?.clientId) return this.sendSuccess(res, [], 'Payments retrieved');
    const payments = await prisma.payment.findMany({
      where: { clientId: req.user.clientId },
      orderBy: { date: 'desc' },
      take: 24
    });
    return this.sendSuccess(res, payments, 'Payments retrieved');
  };
}
