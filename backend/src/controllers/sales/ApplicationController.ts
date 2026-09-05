import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class ApplicationController extends BaseController {
  public getApplications = (req: Request, res: Response) => {
    return this.sendSuccess(res, [], 'Applications retrieved');
  };
}
