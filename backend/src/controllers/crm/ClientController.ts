import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { db, saveDb } from '../../db';

export class ClientController extends BaseController {
  public getClients = (req: Request, res: Response) => {
    // Simulate network delay for loaders
    setTimeout(() => {
      this.sendSuccess(res, db.clients, 'Clients retrieved');
    }, 800);
  };

  public createClient = (req: Request, res: Response) => {
      const { firstName, lastName, mobile, riskProfile } = req.body as Record<string, string | undefined>;
      if (!firstName || !lastName || !mobile) return this.sendError(res, 'First name, last name and mobile are required');
      const newClient = {
      id: `cli_${Date.now()}`,
      firstName,
      lastName,
      mobile,
      riskProfile: riskProfile || 'Unknown',
      kycStatus: 'pending'
    };
    db.clients.unshift(newClient);
    saveDb();
    setTimeout(() => {
      this.sendSuccess(res, newClient, 'Client created successfully');
    }, 600);
  };
}
