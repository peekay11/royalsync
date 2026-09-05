import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { db } from '../../db';

export class PolicyController extends BaseController {
  public getPolicies = (req: Request, res: Response) => {
    setTimeout(() => {
      this.sendSuccess(res, db.policies, 'Policies retrieved');
    }, 1000);
  };
}
