import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class KycController extends BaseController {
  public getKycStatus = (req: Request, res: Response) => {
    const mockKyc = [
      { id: 'kyc_1', client: 'John Doe', status: 'verified', pepResult: 'clear' }
    ];
    this.sendSuccess(res, mockKyc, 'KYC status retrieved');
  };
}
