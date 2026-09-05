import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class ApplicationController extends BaseController {
  public getApplications = (req: Request, res: Response) => {
    const mockApps = [
      { id: 'app_1', client: 'John Doe', status: 'ready_to_quote', productType: 'Motor' }
    ];
    this.sendSuccess(res, mockApps, 'Applications retrieved');
  };
}
