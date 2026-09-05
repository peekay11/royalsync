import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { db } from '../../db';

export class ClientController extends BaseController {
  public getClients = (req: Request, res: Response) => {
    // Simulate network delay for loaders
    setTimeout(() => {
      this.sendSuccess(res, db.clients, 'Clients retrieved');
    }, 800);
  };

  public createClient = (req: Request, res: Response) => {
    const newClient = {
      id: `cli_${Date.now()}`,
      ...req.body,
      kycStatus: 'pending'
    };
    db.clients.unshift(newClient);
    setTimeout(() => {
      this.sendSuccess(res, newClient, 'Client created successfully');
    }, 600);
  };
}
