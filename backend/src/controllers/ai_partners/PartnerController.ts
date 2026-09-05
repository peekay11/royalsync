import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class PartnerController extends BaseController {
  public getPartnerDashboard = (req: Request, res: Response) => {
    const mockData = {
      totalClients: 124,
      recentMessages: [
        { id: 1, sender: 'Admin', text: 'Please upload the latest compliance documents.', time: '10:00 AM' }
      ]
    };
    this.sendSuccess(res, mockData, 'Partner data retrieved');
  };
}
