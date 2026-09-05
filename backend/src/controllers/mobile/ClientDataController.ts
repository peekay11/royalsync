import type { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { db } from '../../db';
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

  public getGoals = (req: Request, res: Response) => this.sendSuccess(res, {
    goals: [],
    summary: { totalTarget: 0, totalCurrent: 0, overallPercentage: 0 }
  }, 'Goals retrieved');

  public getReminders = (req: Request, res: Response) => this.sendSuccess(res, [], 'Reminders retrieved');

  public getAdvisor = (req: Request, res: Response) => this.sendError(res, 'No adviser is assigned to this client', 404);

  public getDocuments = (req: Request, res: Response) => this.sendSuccess(res, [], 'Documents retrieved');

  public getPayments = (req: Request, res: Response) => this.sendSuccess(res, [], 'Payments retrieved');
}