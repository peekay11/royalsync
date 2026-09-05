import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class KycController extends BaseController {
  public getKycStatus = (req: Request, res: Response) => {
    return this.sendSuccess(res, [], 'KYC status retrieved');
  };
}
