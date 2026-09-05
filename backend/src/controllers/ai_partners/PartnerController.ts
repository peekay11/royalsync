import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class PartnerController extends BaseController {
  public getPartnerDashboard = (req: Request, res: Response) => {
    return this.sendSuccess(res, { totalClients: 0, recentMessages: [] }, 'Partner data retrieved');
  };
}
