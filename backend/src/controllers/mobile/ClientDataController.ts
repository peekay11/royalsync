import type { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { db, saveDb } from '../../db';
import type { AuthRequest } from '../../types/auth';

export class ClientDataController extends BaseController {
  public getProfile = (req: AuthRequest, res: Response) => {
    const user = db.users.find(item => item.id === req.user?.id);
    const client = db.clients.find(item => item.id === req.user?.clientId);
    if (!user || !client) return this.sendError(res, 'Client profile not found', 404);
    return this.sendSuccess(res, {
      id: client.id,
      name: `${client.firstName} ${client.lastName}`,
      initials: `${client.firstName[0]}${client.lastName[0]}`,
      email: user.email,
      phone: client.mobile,
      kycStatus: client.kycStatus,
      assignedAdvisor: null
    }, 'Profile retrieved');
  };

  public updateProfile = (req: AuthRequest, res: Response) => {
    const client = db.clients.find(item => item.id === req.user?.clientId);
    if (!client) return this.sendError(res, 'Client profile not found', 404);
    const { firstName, lastName, mobile } = req.body as Record<string, string | undefined>;
    if (!firstName || !lastName || !mobile) return this.sendError(res, 'First name, last name and mobile are required');
    Object.assign(client, { firstName, lastName, mobile });
    saveDb();
    return this.getProfile(req, res);
  };

  public getGoals = (req: AuthRequest, res: Response) => {
    const goals = db.goals.filter(goal => goal.client_id === req.user?.clientId);
    const totalTarget = goals.reduce((sum, goal) => sum + Number(goal.target || 0), 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + Number(goal.current || 0), 0);
    return this.sendSuccess(res, {
      goals,
      summary: { totalTarget, totalCurrent, overallPercentage: totalTarget ? Math.round((totalCurrent / totalTarget) * 100) : 0 }
    }, 'Goals retrieved');
  };

  public getReminders = (req: Request, res: Response) => this.sendSuccess(res, [], 'Reminders retrieved');

  public getAdvisor = (req: Request, res: Response) => this.sendError(res, 'No adviser is assigned to this client', 404);

  public getDocuments = (req: AuthRequest, res: Response) => this.sendSuccess(res, db.documents.filter(document => document.client_id === req.user?.clientId), 'Documents retrieved');

  public getPayments = (req: AuthRequest, res: Response) => this.sendSuccess(res, db.payments.filter(payment => payment.client_id === req.user?.clientId), 'Payments retrieved');
}