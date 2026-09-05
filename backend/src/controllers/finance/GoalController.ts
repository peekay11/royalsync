import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class GoalController extends BaseController {
  public getGoals = (req: Request, res: Response) => {
    return this.sendSuccess(res, [], 'Goals retrieved');
  };
}
