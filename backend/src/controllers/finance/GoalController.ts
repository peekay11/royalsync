import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class GoalController extends BaseController {
  public getGoals = (req: Request, res: Response) => {
    const mockGoals = [
      { id: 'gol_1', title: 'Retirement', target: 5000000, current: 200000 }
    ];
    this.sendSuccess(res, mockGoals, 'Goals retrieved');
  };
}
