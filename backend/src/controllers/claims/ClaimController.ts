import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { db } from '../../db';

export class ClaimController extends BaseController {
  public getClaims = (req: Request, res: Response) => {
    setTimeout(() => {
      this.sendSuccess(res, db.claims, 'Claims retrieved');
    }, 700);
  };
}
