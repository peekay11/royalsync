import { Request, Response } from 'express';
import { BaseController } from '../BaseController';

export class UserController extends BaseController {
  public getUsers = (req: Request, res: Response) => {
    const mockUsers = [
      { id: 'usr_1', email: 'adviser1@example.com', role: 'ADVISER' },
      { id: 'usr_2', email: 'admin@example.com', role: 'SUPER_ADMIN' }
    ];
    this.sendSuccess(res, mockUsers, 'Users retrieved');
  };
}
