import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class UserController extends BaseController {
  public getUsers = (req: Request, res: Response) => {
    return this.sendSuccess(res, [], 'Users retrieved');
  };
}
